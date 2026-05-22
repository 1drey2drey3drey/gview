import { describe, it, expect, afterEach } from 'vitest';
const request = require('supertest');
const app = require('../../src/server');
const prisma = require('../../src/lib/prisma');

describe('Auth Integration Tests', () => {
  const testEmail = 'test_user_auth@gview.com';
  const testName = 'Test User Auth';
  const testPassword = 'Password123';

  afterEach(async () => {
    // Cleanup test user
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.name).toBe(testName);
  });

  it('should not register user with duplicate email', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword
      });

    // Try registering again
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: testName + ' 2',
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('E-mail já cadastrado');
  });

  it('should login an existing user', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(testEmail);
  });

  it('should not login with incorrect password', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas');
  });

  it('should fetch profile with valid JWT token', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword
      });

    const token = regRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  it('should update profile name', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword
      });

    const token = regRes.body.token;

    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Updated Name');
  });

  it('should delete own account', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: testName,
        email: testEmail,
        password: testPassword
      });

    const token = regRes.body.token;

    const res = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deleted
    const checkUser = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(checkUser).toBeNull();
  });
});
