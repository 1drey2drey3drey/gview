import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';
let adminToken, adminId;

beforeAll(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({ data: { name: 'Jam Admin', email: `jam_admin_${Date.now()}@t.com`, passwordHash: hash, role: 'ADMIN' } });
  adminId = admin.id;
  adminToken = jwt.sign({ id: admin.id, email: admin.email, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.gameJam.deleteMany({ where: { creatorId: adminId } });
  await prisma.user.deleteMany({ where: { id: adminId } });
  await prisma.$disconnect();
});

describe('GET /api/gamejams', () => {
  it('deve retornar lista de game jams', async () => {
    const res = await request(app).get('/api/gamejams');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/gamejams', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).post('/api/gamejams').send({
      title: 'Test Jam', description: 'Desc', startDate: '2025-01-01', endDate: '2025-01-07', creatorId: adminId
    });
    expect(res.status).toBe(401);
  });

  it('deve criar game jam com sucesso (admin)', async () => {
    const res = await request(app)
      .post('/api/gamejams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: `Integration Jam ${Date.now()}`, description: 'Test', startDate: '2026-06-01', endDate: '2026-06-07', creatorId: adminId });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/gamejams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Incomplete Jam' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/gamejams/:id', () => {
  it('deve atualizar game jam', async () => {
    const jam = await prisma.gameJam.create({
      data: { title: 'Upd Jam', description: 'Test', startDate: new Date(), endDate: new Date(), creatorId: adminId }
    });
    const res = await request(app)
      .put(`/api/gamejams/${jam.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ theme: 'Space' });
    expect(res.status).toBe(200);
    expect(res.body.theme).toBe('Space');
  });
});

describe('DELETE /api/gamejams/:id', () => {
  it('deve deletar game jam', async () => {
    const jam = await prisma.gameJam.create({
      data: { title: 'Del Jam', description: 'Test', startDate: new Date(), endDate: new Date(), creatorId: adminId }
    });
    const res = await request(app)
      .delete(`/api/gamejams/${jam.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});