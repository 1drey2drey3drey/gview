import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/lib/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';

describe('Wishlist Integration Tests', () => {
  let user, token, game;
  let originalFetch;

  beforeEach(async () => {
    originalFetch = global.fetch;

    user = await prisma.user.create({
      data: { name: 'WishUser', email: `wish_${Date.now()}@gview.com`, passwordHash: 'hash', role: 'PLAYER' },
    });
    token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);

    game = await prisma.game.create({
      data: { title: 'Wishlist Game', slug: `wishlist-game-${Date.now()}`, shortDescription: 'desc' },
    });
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    await prisma.wishlist.deleteMany({ where: { userId: user.id } });
    await prisma.game.delete({ where: { id: game.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('POST /api/wishlist — deve adicionar jogo à wishlist', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId: game.id });

    expect(res.status).toBe(201);
    expect(res.body.gameId).toBe(game.id);
  });

  it('POST /api/wishlist — deve rejeitar sem autenticação', async () => {
    const res = await request(app)
      .post('/api/wishlist')
      .send({ gameId: game.id });

    expect(res.status).toBe(401);
  });

  it('POST /api/wishlist — deve rejeitar duplicata', async () => {
    await prisma.wishlist.create({ data: { userId: user.id, gameId: game.id } });

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId: game.id });

    expect(res.status).toBe(409);
  });

  it('GET /api/wishlist/:userId — deve listar wishlist do usuário', async () => {
    await prisma.wishlist.create({ data: { userId: user.id, gameId: game.id } });

    const res = await request(app)
      .get(`/api/wishlist/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].game.title).toBe('Wishlist Game');
  });

  it('DELETE /api/wishlist/:gameId — deve remover jogo da wishlist', async () => {
    await prisma.wishlist.create({ data: { userId: user.id, gameId: game.id } });

    const res = await request(app)
      .delete(`/api/wishlist/${game.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('POST /api/wishlist com rawgId — deve auto-importar jogo da RAWG', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 99999,
        name: 'RAWG Auto Import Game',
        description_raw: 'desc',
        released: '2024-01-01',
        background_image: null,
        genres: [{ name: 'Indie' }],
        developers: [{ name: 'Test Dev' }],
      }),
    });

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${token}`)
      .send({ gameId: '99999' });  // rawgId numérico como string

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('gameId');

    // Cleanup
    await prisma.wishlist.deleteMany({ where: { userId: user.id } });
    await prisma.game.deleteMany({ where: { slug: 'rawg-auto-import-game-99999' } });
  });
});
