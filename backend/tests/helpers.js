import { vi } from 'vitest';

export function makeMockRes() {
  const res = {
    _status: 200,
    _body: null,
    status(code) { this._status = code; return this; },
    json(body)   { this._body = body; return this; },
    send()       { return this; },
  };
  return res;
}

export function makePrismaModel() {
  return {
    findMany:   vi.fn(),
    findUnique: vi.fn(),
    create:     vi.fn(),
    update:     vi.fn(),
    delete:     vi.fn(),
  };
}

export function makeMockReq({ body = {}, params = {}, user = null, query = {} } = {}) {
  return { body, params, user, query };
}