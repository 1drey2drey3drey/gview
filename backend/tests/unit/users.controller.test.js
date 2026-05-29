import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeMockRes, makeMockReq } from '../helpers.js';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = {
    user: { findMany: vi.fn(), update: vi.fn() },
  };
  global.__prisma = mockPrisma;
  return { ...mockPrisma, default: mockPrisma };
});

import prisma from '../../src/lib/prisma.js';
import { listUsers, updateUserRole } from '../../src/controllers/users.controller.js';

describe('listUsers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve listar usuários com sucesso', async () => {
    const list = [{ id: 'u1', name: 'User 1', email: 'u1@t.com', role: 'PLAYER' }];
    prisma.user.findMany.mockResolvedValue(list);
    const res = makeMockRes();
    await listUsers(makeMockReq(), res);
    expect(res._body).toEqual(list);
  });
});

describe('updateUserRole', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 para role inválido', async () => {
    const res = makeMockRes();
    await updateUserRole(makeMockReq({ params: { id: 'u1' }, body: { role: 'INVALID' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve retornar 403 se tentar tirar o próprio admin', async () => {
    const res = makeMockRes();
    await updateUserRole(makeMockReq({ user: { id: 'admin1' }, params: { id: 'admin1' }, body: { role: 'PLAYER' } }), res);
    expect(res._status).toBe(403);
  });

  it('deve atualizar o cargo com sucesso', async () => {
    const updated = { id: 'u1', name: 'User 1', email: 'u1@t.com', role: 'ADMIN' };
    prisma.user.update.mockResolvedValue(updated);
    const res = makeMockRes();
    await updateUserRole(makeMockReq({ user: { id: 'admin1' }, params: { id: 'u1' }, body: { role: 'ADMIN' } }), res);
    expect(res._body).toEqual(updated);
  });
});