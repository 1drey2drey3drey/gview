import { describe, it, expect, afterEach, beforeEach } from 'vitest';
const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/lib/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';

describe('Games Integration Tests', () => {
  let adminToken, playerToken;
  let createdGameIds = [];

  beforeEach(async () => {
    const admin = await prisma.user.create({
      data: { name: 'Admin', email: `admin_${Date.now()}@gview.com`, passwordHash: 'hash', role: 'ADMIN' },
    });
    const player = await prisma.user.create({
      data: { name: 'Player', email: `player_${Date.now()}@gview.com`, passwordHash: 'hash', role: 'PLAYER' },
    });
    adminToken  = jwt.sign({ id: admin.id,  email: admin.email,  role: admin.role  }, JWT_SECRET);
    playerToken = jwt.sign({ id: player.id, email: player.email, role: player.role }, JWT_SECRET);
  });

  afterEach(async () => {
    if (createdGameIds.length > 0) {
      await prisma.game.deleteMany({ where: { id: { in: createdGameIds } } });
      createdGameIds = [];
    }
    await prisma.user.deleteMany({ where: { email: { endsWith: '@gview.com' } } });
  });

  it('GET /api/games — deve listar jogos', async () => {
    const res = await request(app).get('/api/games');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/games — deve criar jogo como admin', async () => {
    const payload = {
      title: 'Meu Novo Jogo',
      shortDescription: 'Descrição curta do jogo',
      genre: 'Action',
      status: 'AVAILABLE',
    };

    const res = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Meu Novo Jogo');
    expect(res.body.slug).toBe('meu-novo-jogo');
    createdGameIds.push(res.body.id);
  });

  it('POST /api/games — deve rejeitar criação sem autenticação', async () => {
    const res = await request(app)
      .post('/api/games')
      .send({ title: 'Jogo Sem Auth', shortDescription: 'desc' });

    expect(res.status).toBe(401);
  });

  it('POST /api/games — deve rejeitar player (não admin)', async () => {
    const res = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ title: 'Jogo Player', shortDescription: 'desc' });

    expect(res.status).toBe(403);
  });

  it('GET /api/games/:slug — deve retornar 404 para jogo inexistente', async () => {
    const res = await request(app).get('/api/games/jogo-que-nao-existe-123456');
    expect(res.status).toBe(404);
  });

  it('PUT /api/games/:id — deve atualizar jogo como admin', async () => {
    const game = await prisma.game.create({
      data: { title: 'Jogo Antigo', slug: `jogo-antigo-${Date.now()}`, shortDescription: 'Desc' },
    });
    createdGameIds.push(game.id);

    const res = await request(app)
      .put(`/api/games/${game.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ shortDescription: 'Descrição atualizada' });

    expect(res.status).toBe(200);
    expect(res.body.shortDescription).toBe('Descrição atualizada');
  });

  it('DELETE /api/games/:id — deve deletar jogo como admin', async () => {
    const game = await prisma.game.create({
      data: { title: 'Para Deletar', slug: `para-deletar-${Date.now()}`, shortDescription: 'Desc' },
    });

    const res = await request(app)
      .delete(`/api/games/${game.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });
});
