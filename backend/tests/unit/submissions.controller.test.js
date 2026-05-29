import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeMockRes, makePrismaModel, makeMockReq } from '../helpers.js';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = {
    submission: makePrismaModel(),
    game:       { create: vi.fn() },
  };
  global.__prisma = mockPrisma;
  return { ...mockPrisma, default: mockPrisma };
});

import prisma from '../../src/lib/prisma.js';
import { listSubmissions, getSubmission, createSubmission, updateSubmissionStatus, deleteSubmission } from '../../src/controllers/submissions.controller.js';

describe('createSubmission', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem campos obrigatórios', async () => {
    const res = makeMockRes();
    await createSubmission(makeMockReq({ body: { gameTitle: 'Test' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve criar submissão com sucesso', async () => {
    const sub = { id: 's1', gameTitle: 'Test', contactEmail: 'a@b.com', reviewStatus: 'PENDING' };
    prisma.submission.create.mockResolvedValue(sub);
    const res = makeMockRes();
    await createSubmission(makeMockReq({ body: { gameTitle: 'Test', description: 'Desc', contactEmail: 'a@b.com' } }), res);
    expect(res._status).toBe(201);
    expect(res._body.data).toMatchObject(sub);
  });
});

describe('updateSubmissionStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 para status inválido', async () => {
    const res = makeMockRes();
    await updateSubmissionStatus(makeMockReq({ params: { id: 's1' }, body: { status: 'INVALID' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve atualizar status para APPROVED', async () => {
    const sub = { id: 's1', gameTitle: 'Test', description: 'Desc', reviewStatus: 'PENDING' };
    prisma.submission.findUnique.mockResolvedValue(sub);
    prisma.submission.update.mockResolvedValue({ ...sub, reviewStatus: 'APPROVED' });
    prisma.game.create.mockResolvedValue({});
    const res = makeMockRes();
    await updateSubmissionStatus(makeMockReq({ params: { id: 's1' }, body: { status: 'APPROVED' } }), res);
    expect(res._body.reviewStatus).toBe('APPROVED');
  });

  it('deve retornar 404 se não encontrada', async () => {
    prisma.submission.findUnique.mockResolvedValue(null);
    const res = makeMockRes();
    await updateSubmissionStatus(makeMockReq({ params: { id: 'none' }, body: { status: 'APPROVED' } }), res);
    expect(res._status).toBe(404);
  });
});

describe('deleteSubmission', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve deletar com sucesso', async () => {
    prisma.submission.delete.mockResolvedValue({});
    const res = makeMockRes();
    await deleteSubmission(makeMockReq({ params: { id: 's1' } }), res);
    expect(res._status).toBe(204);
  });
});