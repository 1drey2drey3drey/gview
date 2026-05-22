import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/lib/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';

describe('Reviews Integration Tests', () => {
  let user1, user2, game;
  let token1, token2;
  let originalFetch;

  beforeEach(async () => {
    originalFetch = global.fetch;

    user1 = await prisma.user.create({
      data: { name: 'User1', email: `u1_${Date.now()}@gview.com`, passwordHash: 'hash', role: 'PLAYER' },
    });
    user2 = await prisma.user.create({
      data: { name: 'User2', email: `u2_${Date.now()}@gview.com`, passwordHash: 'hash', role: 'PLAYER' },
    });
    token1 = jwt.sign({ id: user1.id, email: user1.email, role: user1.role }, JWT_SECRET);
    token2 = jwt.sign({ id: user2.id, email: user2.email, role: user2.role }, JWT_SECRET);

    game = await prisma.game.create({
      data: {
        title: 'Test Game Reviews',
        slug: `test-game-reviews-${Date.now()}`,
        shortDescription: 'A test game',
        status: 'AVAILABLE',
      },
    });
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    await prisma.review.deleteMany({ where: { gameId: game.id } });
    await prisma.game.delete({ where: { id: game.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
  });

  it('GET /api/reviews/game/:gameId — deve listar reviews de um jogo', async () => {
    await prisma.review.create({ data: { userId: user1.id, gameId: game.id, rating: 4, comment: 'Bom jogo' } });

    const res = await request(app).get(`/api/reviews/game/${game.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].rating).toBe(4);
    expect(res.body.data[0].user.name).toBe('User1');
  });

  it('POST /api/reviews — deve criar review com autenticação', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token1}`)
      .send({ gameId: game.id, rating: 5, comment: 'Excelente!' });

    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.gameId).toBe(game.id);
  });

  it('POST /api/reviews — deve rejeitar rating inválido', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token1}`)
      .send({ gameId: game.id, rating: 10 });

    expect(res.status).toBe(400);
  });

  it('POST /api/reviews — deve rejeitar sem autenticação', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ gameId: game.id, rating: 4 });

    expect(res.status).toBe(401);
  });

  it('POST /api/reviews — deve impedir review duplicada', async () => {
    await prisma.review.create({ data: { userId: user1.id, gameId: game.id, rating: 3 } });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token1}`)
      .send({ gameId: game.id, rating: 5 });

    expect(res.status).toBe(409);
  });

  it('PUT /api/reviews/:id — deve atualizar própria review', async () => {
    const review = await prisma.review.create({
      data: { userId: user1.id, gameId: game.id, rating: 3 },
    });

    const res = await request(app)
      .put(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ rating: 5, comment: 'Melhorou muito!' });

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(5);
  });

  it('PUT /api/reviews/:id — deve proibir editar review de outro usuário', async () => {
    const review = await prisma.review.create({
      data: { userId: user1.id, gameId: game.id, rating: 3 },
    });

    const res = await request(app)
      .put(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ rating: 1 });

    expect(res.status).toBe(403);
  });

  it('DELETE /api/reviews/:id — deve deletar própria review', async () => {
    const review = await prisma.review.create({
      data: { userId: user1.id, gameId: game.id, rating: 4 },
    });

    const res = await request(app)
      .delete(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(204);

    const deleted = await prisma.review.findUnique({ where: { id: review.id } });
    expect(deleted).toBeNull();
  });

  it('DELETE /api/reviews/:id — deve proibir deletar review de outro usuário', async () => {
    const review = await prisma.review.create({
      data: { userId: user1.id, gameId: game.id, rating: 4 },
    });

    const res = await request(app)
      .delete(`/api/reviews/${review.id}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });
});
