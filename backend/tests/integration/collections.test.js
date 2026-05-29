import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';
let userToken, userId;

beforeAll(async () => {
  const hash = await bcrypt.hash('pass123', 10);
  const user = await prisma.user.create({ data: { name: 'Coll User', email: `coll_${Date.now()}@t.com`, passwordHash: hash } });
  userId = user.id;
  userToken = jwt.sign({ id: user.id, email: user.email, role: 'PLAYER' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.collection.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  await prisma.$disconnect();
});

describe('GET /api/collections/my', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/collections/my');
    expect(res.status).toBe(401);
  });

  it('deve retornar coleções do usuário', async () => {
    const res = await request(app).get('/api/collections/my').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

describe('POST /api/collections', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).post('/api/collections').send({ name: 'Favoritos' });
    expect(res.status).toBe(401);
  });

  it('deve criar coleção com sucesso', async () => {
    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Minha Coleção', description: 'Jogos favoritos', isPublic: false });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Minha Coleção');
    expect(res.body.userId).toBe(userId);
  });

  it('deve retornar 400 sem nome', async () => {
    const res = await request(app)
      .post('/api/collections')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ description: 'Sem nome' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/collections/:id', () => {
  it('deve atualizar coleção', async () => {
    const coll = await prisma.collection.create({ data: { name: 'Upd Coll', userId } });
    const res = await request(app)
      .put(`/api/collections/${coll.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Coleção Atualizada', isPublic: true });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Coleção Atualizada');
  });
});

describe('DELETE /api/collections/:id', () => {
  it('deve deletar coleção', async () => {
    const coll = await prisma.collection.create({ data: { name: 'Del Coll', userId } });
    const res = await request(app)
      .delete(`/api/collections/${coll.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(204);
  });
});