import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { makeMockRes } from '../helpers.js';
import { authMiddleware, adminOnly } from '../../src/middlewares/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gview-secret-dev';

function makeReqRes(headers = {}, user = null) {
  const req = { headers, user };
  const res = makeMockRes();
  res._status = null;
  const next = vi.fn();
  return { req, res, next };
}

describe('authMiddleware', () => {
  it('deve retornar 401 quando não há token', () => {
    const { req, res, next } = makeReqRes();
    authMiddleware(req, res, next);
    expect(res._status).toBe(401);
    expect(res._body.error).toBeTruthy();
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 para token inválido', () => {
    const { req, res, next } = makeReqRes({ authorization: 'Bearer invalidtoken' });
    authMiddleware(req, res, next);
    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() com token válido e anexar req.user', () => {
    const payload = { id: 'user-1', email: 'test@test.com', role: 'PLAYER' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const { req, res, next } = makeReqRes({ authorization: `Bearer ${token}` });
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 'user-1', email: 'test@test.com', role: 'PLAYER' });
  });

  it('deve retornar 401 para formato de header inválido', () => {
    const { req, res, next } = makeReqRes({ authorization: 'Token abc' });
    authMiddleware(req, res, next);
    expect(res._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('adminOnly', () => {
  it('deve retornar 403 para usuário não-admin', () => {
    const { req, res, next } = makeReqRes({}, { id: '1', role: 'PLAYER' });
    adminOnly(req, res, next);
    expect(res._status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() para usuário ADMIN', () => {
    const { req, res, next } = makeReqRes({}, { id: '1', role: 'ADMIN' });
    adminOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('deve retornar 403 quando req.user é null', () => {
    const { req, res, next } = makeReqRes({}, null);
    adminOnly(req, res, next);
    expect(res._status).toBe(403);
  });
});