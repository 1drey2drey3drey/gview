import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';

let adminToken;
let adminUser;

beforeAll(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  adminUser = await prisma.user.create({
    data: { name: 'Admin Test', email: `admin_games_${Date.now()}@test.com`, passwordHash: hash, role: 'ADMIN' }
  });
  adminToken = jwt.sign({ id: adminUser.id, email: adminUser.email, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.game.deleteMany({ where: { slug: { startsWith: 'test-game-integ' } } });
  await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
  await prisma.$disconnect();
});

describe('GET /api/games', () => {
  it('deve retornar lista de jogos ou fallback', async () => {
    const res = await request(app).get('/api/games');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('deve aceitar filtro por status', async () => {
    const res = await request(app).get('/api/games?status=FEATURED');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/games', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).post('/api/games').send({ title: 'Test', shortDescription: 'Test' });
    expect(res.status).toBe(401);
  });

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Only title' });
    expect(res.status).toBe(400);
  });

  it('deve criar jogo com sucesso (admin)', async () => {
    const res = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: `Test Game Integ ${Date.now()}`, shortDescription: 'Test description', genre: 'Action' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('slug');
  });
});

describe('PUT /api/games/:id', () => {
  let gameId;
  beforeEach(async () => {
    const game = await prisma.game.create({
      data: { title: `Upd Game ${Date.now()}`, slug: `test-game-integ-upd-${Date.now()}`, shortDescription: 'Test' }
    });
    gameId = game.id;
  });

  it('deve atualizar jogo com sucesso', async () => {
    const res = await request(app)
      .put(`/api/games/${gameId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ genre: 'RPG' });
    expect(res.status).toBe(200);
    expect(res.body.genre).toBe('RPG');
  });

  it('deve retornar 404 para id inexistente', async () => {
    const res = await request(app)
      .put('/api/games/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ genre: 'RPG' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/games/:id', () => {
  it('deve deletar jogo com sucesso', async () => {
    const game = await prisma.game.create({
      data: { title: `Del Game ${Date.now()}`, slug: `test-game-integ-del-${Date.now()}`, shortDescription: 'Test' }
    });
    const res = await request(app)
      .delete(`/api/games/${game.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});