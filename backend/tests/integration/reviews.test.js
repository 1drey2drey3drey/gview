import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';
let userToken, userId, gameId;

beforeAll(async () => {
  const hash = await bcrypt.hash('pass123', 10);
  const user = await prisma.user.create({ data: { name: 'Rev User', email: `rev_${Date.now()}@t.com`, passwordHash: hash } });
  userId = user.id;
  userToken = jwt.sign({ id: user.id, email: user.email, role: 'PLAYER' }, JWT_SECRET, { expiresIn: '1h' });
  const game = await prisma.game.create({ data: { title: `Rev Game ${Date.now()}`, slug: `rev-game-${Date.now()}`, shortDescription: 'Test' } });
  gameId = game.id;
});

afterAll(async () => {
  await prisma.review.deleteMany({ where: { userId } });
  await prisma.game.deleteMany({ where: { id: gameId } });
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  await prisma.$disconnect();
});

describe('GET /api/reviews/game/:gameId', () => {
  it('deve retornar reviews de um jogo', async () => {
    const res = await request(app).get(`/api/reviews/game/${gameId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

describe('POST /api/reviews', () => {
  it('deve retornar 401 sem autenticação', async () => {
    const res = await request(app).post('/api/reviews').send({ gameId, rating: 5 });
    expect(res.status).toBe(401);
  });

  it('deve criar review com sucesso', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ gameId, rating: 4, comment: 'Muito bom!' });
    expect(res.status).toBe(201);
    expect(res.body.rating).toBe(4);
  });

  it('deve retornar 409 ao duplicar review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ gameId, rating: 3 });
    expect(res.status).toBe(409);
  });
});