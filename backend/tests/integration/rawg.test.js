import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/lib/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';

// Mock RAWG game object
const mockRawgGame = {
  id: 3498,
  name: 'Grand Theft Auto V',
  description_raw: 'An open world action-adventure game.',
  released: '2013-09-17',
  background_image: 'https://rawg.io/gtav.jpg',
  website: 'https://www.rockstargames.com/V',
  genres: [{ name: 'Action' }],
  platforms: [{ platform: { name: 'PC' } }],
  developers: [{ name: 'Rockstar North' }],
  rating: 4.47,
  ratings_count: 5683,
};

describe('RAWG API Integration Tests', () => {
  let playerToken;
  let importedGameIds = [];
  let originalFetch;

  beforeEach(async () => {
    originalFetch = global.fetch;

    const player = await prisma.user.create({
      data: { name: 'Test Player', email: `test_rawg_${Date.now()}@gview.com`, passwordHash: 'dummyhash', role: 'PLAYER' },
    });
    playerToken = jwt.sign({ id: player.id, email: player.email, role: player.role }, JWT_SECRET);
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    if (importedGameIds.length > 0) {
      await prisma.game.deleteMany({ where: { id: { in: importedGameIds } } });
      importedGameIds = [];
    }
    await prisma.user.deleteMany({ where: { email: { endsWith: '@gview.com' } } });
  });

  it('GET /api/rawg/games — deve listar jogos populares da RAWG', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [mockRawgGame], count: 1 }),
    });

    const res = await request(app).get('/api/rawg/games?page_size=5');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].rawgId).toBe(3498);
    expect(res.body.data[0].name).toBe('Grand Theft Auto V');
  });

  it('GET /api/rawg/search — deve buscar jogos por nome', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [mockRawgGame] }),
    });

    const res = await request(app).get('/api/rawg/search?q=gta');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].rawgId).toBe(3498);
  });

  it('GET /api/rawg/search — deve retornar 400 sem parâmetro q', async () => {
    const res = await request(app).get('/api/rawg/search');
    expect(res.status).toBe(400);
  });

  it('GET /api/rawg/game/:rawgId — deve retornar detalhes do jogo', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRawgGame,
    });

    const res = await request(app).get('/api/rawg/game/3498');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Grand Theft Auto V');
    expect(res.body.rawgId).toBe(3498);
  });

  it('POST /api/rawg/import/:rawgId — deve importar jogo para o banco', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRawgGame,
    });

    const res = await request(app).post('/api/rawg/import/3498');
    expect([200, 201]).toContain(res.status);
    expect(res.body.game).toHaveProperty('id');
    expect(res.body.game.title).toBe('Grand Theft Auto V');
    importedGameIds.push(res.body.game.id);

    const dbGame = await prisma.game.findUnique({ where: { id: res.body.game.id } });
    expect(dbGame).not.toBeNull();
    expect(dbGame.title).toBe('Grand Theft Auto V');
  });

  it('POST /api/rawg/import/:rawgId — deve retornar jogo existente (sem duplicar)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRawgGame,
    });

    // Importa pela primeira vez
    const first = await request(app).post('/api/rawg/import/3498');
    expect([200, 201]).toContain(first.status);
    importedGameIds.push(first.body.game.id);

    // Importa novamente — deve retornar o mesmo jogo sem criar duplicata
    const second = await request(app).post('/api/rawg/import/3498');
    expect(second.status).toBe(200);
    expect(second.body.game.id).toBe(first.body.game.id);

    const count = await prisma.game.count({ where: { slug: first.body.game.slug } });
    expect(count).toBe(1);
  });
});
