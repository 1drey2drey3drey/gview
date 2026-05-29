import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeMockRes, makePrismaModel, makeMockReq } from '../helpers.js';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = {
    gameJam:      makePrismaModel(),
    gameJamEntry: { create: vi.fn() },
  };
  global.__prisma = mockPrisma;
  return { ...mockPrisma, default: mockPrisma };
});

import prisma from '../../src/lib/prisma.js';
import { listGameJams, createGameJam, updateGameJam, deleteGameJam, joinGameJam } from '../../src/controllers/gamejams.controller.js';

describe('listGameJams', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar lista de game jams', async () => {
    const jams = [{ id: 'j1', title: 'Jam 1' }];
    prisma.gameJam.findMany.mockResolvedValue(jams);
    const res = makeMockRes();
    await listGameJams(makeMockReq(), res);
    expect(res._body).toEqual([{ id: 'j1', title: 'Jam 1', status: 'ACTIVE' }]);
  });
});

describe('createGameJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = makeMockRes();
    await createGameJam(makeMockReq({ body: { title: 'Test' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve criar jam com sucesso', async () => {
    const jam = { id: 'j1', title: 'Jam 2025' };
    prisma.gameJam.create.mockResolvedValue(jam);
    const res = makeMockRes();
    await createGameJam(makeMockReq({ body: { title: 'Jam 2025', description: 'Desc', startDate: '2025-01-01', endDate: '2025-01-03', creatorId: 'u1' } }), res);
    expect(res._status).toBe(201);
  });
});

describe('updateGameJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 404 se não encontrada', async () => {
    prisma.gameJam.update.mockRejectedValue({ code: 'P2025' });
    const res = makeMockRes();
    await updateGameJam(makeMockReq({ params: { id: 'j1' }, body: { title: 'Novo' } }), res);
    expect(res._status).toBe(404);
  });
});

describe('deleteGameJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve deletar jam com sucesso', async () => {
    prisma.gameJam.delete.mockResolvedValue({});
    const res = makeMockRes();
    await deleteGameJam(makeMockReq({ params: { id: 'j1' } }), res);
    expect(res._status).toBe(204);
  });
});

describe('joinGameJam', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem gameId', async () => {
    const res = makeMockRes();
    await joinGameJam(makeMockReq({ params: { id: 'j1' }, body: {}, user: { id: 'u1' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve retornar 404 se game jam não existir', async () => {
    prisma.gameJam.findUnique.mockResolvedValue(null);
    const res = makeMockRes();
    await joinGameJam(makeMockReq({ params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } }), res);
    expect(res._status).toBe(404);
    expect(res._body.error).toBe('Game Jam não encontrada.');
  });

  it('deve retornar 400 se a game jam ainda não começou', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    prisma.gameJam.findUnique.mockResolvedValue({ id: 'j1', startDate: tomorrow, endDate: nextWeek });
    const res = makeMockRes();
    await joinGameJam(makeMockReq({ params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } }), res);
    expect(res._status).toBe(400);
    expect(res._body.error).toBe('A Game Jam ainda não começou.');
  });

  it('deve retornar 400 se a game jam já terminou', async () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    prisma.gameJam.findUnique.mockResolvedValue({ id: 'j1', startDate: lastWeek, endDate: yesterday });
    const res = makeMockRes();
    await joinGameJam(makeMockReq({ params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } }), res);
    expect(res._status).toBe(400);
    expect(res._body.error).toBe('A Game Jam já terminou.');
  });

  it('deve retornar 409 se já inscrito', async () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    prisma.gameJam.findUnique.mockResolvedValue({ id: 'j1', startDate: lastWeek, endDate: nextWeek });
    prisma.gameJamEntry.create.mockRejectedValue({ code: 'P2002' });
    const res = makeMockRes();
    await joinGameJam(makeMockReq({ params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } }), res);
    expect(res._status).toBe(409);
  });

  it('deve se inscrever com sucesso', async () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const entry = { id: 'e1', jamId: 'j1', gameId: 'g1', developerId: 'u1' };
    prisma.gameJam.findUnique.mockResolvedValue({ id: 'j1', startDate: lastWeek, endDate: nextWeek });
    prisma.gameJamEntry.create.mockResolvedValue(entry);
    const res = makeMockRes();
    await joinGameJam(makeMockReq({ params: { id: 'j1' }, body: { gameId: 'g1' }, user: { id: 'u1' } }), res);
    expect(res._status).toBe(201);
    expect(res._body).toEqual(entry);
  });
});