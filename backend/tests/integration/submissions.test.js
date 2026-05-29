import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';
let adminToken;

beforeAll(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({ data: { name: 'Sub Admin', email: `sub_admin_${Date.now()}@t.com`, passwordHash: hash, role: 'ADMIN' } });
  adminToken = jwt.sign({ id: admin.id, email: admin.email, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.submission.deleteMany({ where: { contactEmail: { contains: 'submittest' } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'sub_admin_' } } });
  await prisma.$disconnect();
});

describe('POST /api/submissions', () => {
  it('deve criar submissão com autenticação', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        gameTitle: 'My Indie Game', description: 'A cool game', contactEmail: 'dev@submittest.com'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.reviewStatus).toBe('PENDING');
  });

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ gameTitle: 'Test only' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/submissions', () => {
  it('deve retornar 401 sem token', async () => {
    const res = await request(app).get('/api/submissions');
    expect(res.status).toBe(401);
  });

  it('deve listar submissões para admin', async () => {
    const res = await request(app)
      .get('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});