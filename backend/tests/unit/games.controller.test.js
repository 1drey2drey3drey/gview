import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeMockRes, makePrismaModel, makeMockReq } from '../helpers.js';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = { game: makePrismaModel() };
  global.__prisma = mockPrisma;
  return { ...mockPrisma, default: mockPrisma };
});

import prisma from '../../src/lib/prisma.js';
import { listGames, getGameBySlug, createGame, updateGame, deleteGame, generateSlug } from '../../src/controllers/games.controller.js';

describe('generateSlug', () => {
  it('deve gerar slug corretamente', () => {
    expect(generateSlug('Meu Jogo Legal')).toBe('meu-jogo-legal');
  });
  it('deve remover caracteres especiais', () => {
    expect(generateSlug('Ação!')).toBe('acao');
  });
  it('deve lidar com múltiplos espaços', () => {
    expect(generateSlug('Jogo  Duplo  Espaço')).toBe('jogo-duplo-espaco');
  });
});

describe('listGames', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar jogos do banco quando existem', async () => {
    const mockGames = [{ id: '1', title: 'Test', slug: 'test' }];
    prisma.game.findMany.mockResolvedValue(mockGames);
    const res = makeMockRes();
    await listGames(makeMockReq(), res);
    expect(res._body.data).toEqual(mockGames);
    expect(res._body.total).toBe(1);
  });

  it('deve retornar mock quando banco está vazio', async () => {
    prisma.game.findMany.mockResolvedValue([]);
    const res = makeMockRes();
    await listGames(makeMockReq(), res);
    expect(res._body.source).toBe('mock');
    expect(Array.isArray(res._body.data)).toBe(true);
  });

  it('deve filtrar por status', async () => {
    prisma.game.findMany.mockResolvedValue([]);
    const res = makeMockRes();
    await listGames(makeMockReq({ query: { status: 'FEATURED' } }), res);
    expect(res._body.source).toBe('mock');
  });
});

describe('createGame', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 quando título está ausente', async () => {
    const res = makeMockRes();
    await createGame(makeMockReq({ body: { shortDescription: 'test' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve criar jogo com sucesso', async () => {
    const game = { id: '1', title: 'New Game', slug: 'new-game', shortDescription: 'Test' };
    prisma.game.create.mockResolvedValue(game);
    const res = makeMockRes();
    await createGame(makeMockReq({ body: { title: 'New Game', shortDescription: 'Test' } }), res);
    expect(res._status).toBe(201);
    expect(res._body).toEqual(game);
  });

  it('deve retornar 409 para slug duplicado', async () => {
    prisma.game.create.mockRejectedValue({ code: 'P2002' });
    const res = makeMockRes();
    await createGame(makeMockReq({ body: { title: 'Existing', shortDescription: 'Test' } }), res);
    expect(res._status).toBe(409);
  });
});

describe('deleteGame', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 404 se jogo não existe', async () => {
    prisma.game.delete.mockRejectedValue({ code: 'P2025' });
    const res = makeMockRes();
    await deleteGame(makeMockReq({ params: { id: 'nonexistent' } }), res);
    expect(res._status).toBe(404);
  });

  it('deve deletar com sucesso', async () => {
    prisma.game.delete.mockResolvedValue({});
    const res = makeMockRes();
    await deleteGame(makeMockReq({ params: { id: 'game-1' } }), res);
    expect(res._status).toBe(204);
  });
});