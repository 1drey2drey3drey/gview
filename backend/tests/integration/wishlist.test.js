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
  const user = await prisma.user.create({ data: { name: 'WL User', email: `wl_${Date.now()}@t.com`, passwordHash: hash } });
  userId = user.id;
  userToken = jwt.sign({ id: user.id, email: user.email, role: 'PLAYER' }, JWT_SECRET, { expiresIn: '1h' });
  const game = await prisma.game.create({ data: { title: `WL Game ${Date.now()}`, slug: `wl-game-${Date.now()}`, shortDescription: 'Test' } });
  gameId = game.id;
});

afterAll(async () => {
  await prisma.wishlist.deleteMany({ where: { userId } });
  await prisma.game.deleteMany({ where: { id: gameId } });
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  await prisma.$disconnect();
});

describe('GET /api/wishlist/:userId', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get(`/api/wishlist/${userId}`);
    expect(res.status).toBe(401);
  });

  it('deve retornar wishlist vazia', async () => {
    const res = await request(app).get(`/api/wishlist/${userId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('POST /api/wishlist', () => {
  it('deve adicionar jogo à wishlist', async () => {
    const res = await request(app).post('/api/wishlist').set('Authorization', `Bearer ${userToken}`).send({ gameId });
    expect(res.status).toBe(201);
  });

  it('deve retornar 409 ao duplicar', async () => {
    const res = await request(app).post('/api/wishlist').set('Authorization', `Bearer ${userToken}`).send({ gameId });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/wishlist/:gameId', () => {
  it('deve remover jogo da wishlist', async () => {
    const res = await request(app).delete(`/api/wishlist/${gameId}`).set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(204);
  });
});