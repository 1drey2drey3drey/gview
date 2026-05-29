import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeMockRes, makePrismaModel, makeMockReq } from '../helpers.js';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = {
    collection:     makePrismaModel(),
    collectionItem: { create: vi.fn(), delete: vi.fn() },
  };
  global.__prisma = mockPrisma;
  return { ...mockPrisma, default: mockPrisma };
});

import prisma from '../../src/lib/prisma.js';
import { createCollection, updateCollection, deleteCollection, addGameToCollection, removeGameFromCollection } from '../../src/controllers/collections.controller.js';

describe('createCollection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem nome', async () => {
    const res = makeMockRes();
    await createCollection(makeMockReq({ body: {}, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve criar coleção com sucesso', async () => {
    const collection = { id: 'c1', name: 'Favoritos', userId: 'user-1' };
    prisma.collection.create.mockResolvedValue(collection);
    const res = makeMockRes();
    await createCollection(makeMockReq({ body: { name: 'Favoritos' }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(201);
    expect(res._body).toEqual(collection);
  });
});

describe('updateCollection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 404 se coleção não encontrada', async () => {
    prisma.collection.findUnique.mockResolvedValue(null);
    const res = makeMockRes();
    await updateCollection(makeMockReq({ params: { id: 'c1' }, body: { name: 'Novo' }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(404);
  });

  it('deve retornar 403 se não é o dono', async () => {
    prisma.collection.findUnique.mockResolvedValue({ id: 'c1', userId: 'other' });
    const res = makeMockRes();
    await updateCollection(makeMockReq({ params: { id: 'c1' }, body: { name: 'Novo' }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(403);
  });
});

describe('deleteCollection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve deletar com sucesso', async () => {
    prisma.collection.findUnique.mockResolvedValue({ id: 'c1', userId: 'user-1' });
    prisma.collection.delete.mockResolvedValue({});
    const res = makeMockRes();
    await deleteCollection(makeMockReq({ params: { id: 'c1' }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(204);
  });
});

describe('addGameToCollection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem gameId', async () => {
    prisma.collection.findUnique.mockResolvedValue({ id: 'c1', userId: 'user-1' });
    const res = makeMockRes();
    await addGameToCollection(makeMockReq({ params: { id: 'c1' }, body: {}, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve retornar 409 se jogo já está na coleção', async () => {
    prisma.collection.findUnique.mockResolvedValue({ id: 'c1', userId: 'user-1' });
    prisma.collectionItem.create.mockRejectedValue({ code: 'P2002' });
    const res = makeMockRes();
    await addGameToCollection(makeMockReq({ params: { id: 'c1' }, body: { gameId: 'g1' }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(409);
  });
});