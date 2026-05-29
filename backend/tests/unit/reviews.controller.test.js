import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeMockRes, makePrismaModel, makeMockReq } from '../helpers.js';

vi.mock('../../src/lib/prisma.js', () => {
  const mockPrisma = { review: makePrismaModel() };
  global.__prisma = mockPrisma;
  return { ...mockPrisma, default: mockPrisma };
});

import prisma from '../../src/lib/prisma.js';
import { getReviewsByGame, createReview, updateReview, deleteReview, getReviewsByUser } from '../../src/controllers/reviews.controller.js';

describe('getReviewsByGame', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar reviews de um jogo', async () => {
    const reviews = [{ id: '1', rating: 5, comment: 'Ótimo!' }];
    prisma.review.findMany.mockResolvedValue(reviews);
    const res = makeMockRes();
    await getReviewsByGame(makeMockReq({ params: { gameId: 'game-1' } }), res);
    expect(res._body.data).toEqual(reviews);
    expect(res._body.total).toBe(1);
  });
});

describe('createReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 sem gameId', async () => {
    const res = makeMockRes();
    await createReview(makeMockReq({ body: { rating: 5 }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve retornar 400 para rating inválido', async () => {
    const res = makeMockRes();
    await createReview(makeMockReq({ body: { gameId: 'g1', rating: 10 }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve retornar 400 para rating < 1', async () => {
    const res = makeMockRes();
    await createReview(makeMockReq({ body: { gameId: 'g1', rating: 0 }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(400);
  });

  it('deve criar review com sucesso', async () => {
    const review = { id: 'r1', rating: 4, gameId: 'g1', userId: 'user-1' };
    prisma.review.create.mockResolvedValue(review);
    const res = makeMockRes();
    await createReview(makeMockReq({ body: { gameId: 'g1', rating: 4, comment: 'Bom' }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(201);
  });

  it('deve retornar 409 se já avaliou o jogo', async () => {
    prisma.review.create.mockRejectedValue({ code: 'P2002' });
    const res = makeMockRes();
    await createReview(makeMockReq({ body: { gameId: 'g1', rating: 4 }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(409);
  });
});

describe('updateReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 404 se review não encontrada', async () => {
    prisma.review.findUnique.mockResolvedValue(null);
    const res = makeMockRes();
    await updateReview(makeMockReq({ params: { id: 'r1' }, body: { rating: 3 }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(404);
  });

  it('deve retornar 403 se não é o dono', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'other-user' });
    const res = makeMockRes();
    await updateReview(makeMockReq({ params: { id: 'r1' }, body: { rating: 3 }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(403);
  });
});

describe('deleteReview', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 403 se não é o dono', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'other' });
    const res = makeMockRes();
    await deleteReview(makeMockReq({ params: { id: 'r1' }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(403);
  });

  it('deve deletar com sucesso', async () => {
    prisma.review.findUnique.mockResolvedValue({ id: 'r1', userId: 'user-1' });
    prisma.review.delete.mockResolvedValue({});
    const res = makeMockRes();
    await deleteReview(makeMockReq({ params: { id: 'r1' }, user: { id: 'user-1' } }), res);
    expect(res._status).toBe(204);
  });
});

describe('getReviewsByUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deve retornar 400 se userId não informado', async () => {
    const res = makeMockRes();
    await getReviewsByUser(makeMockReq({ params: {}, user: null }), res);
    expect(res._status).toBe(400);
    expect(res._body.error).toBe('userId é obrigatório');
  });

  it('deve retornar as avaliações de um usuário com sucesso', async () => {
    const reviews = [{ id: 'r1', rating: 4, comment: 'Divertido!', game: { title: 'Game 1' } }];
    prisma.review.findMany.mockResolvedValue(reviews);
    const res = makeMockRes();
    await getReviewsByUser(makeMockReq({ params: { userId: 'user-1' } }), res);
    expect(res._body.data).toEqual(reviews);
    expect(res._body.total).toBe(1);
  });
});