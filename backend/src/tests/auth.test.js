const request = require('supertest');
const app = require('../app');
const { _prisma: prisma } = require('../services/auth.service');

// Unique email for each test run to avoid collisions
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_NOMBRE = 'Usuario Test';

let authToken = null;

afterAll(async () => {
  // Cleanup: delete test user
  try {
    await prisma.usuario.deleteMany({ where: { email: TEST_EMAIL } });
  } catch (_) {
    // ignore
  }
  await prisma.$disconnect();
});

describe('GET /api/health', () => {
  it('should return ok: true', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: TEST_NOMBRE, email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user.nombre).toBe(TEST_NOMBRE);
    expect(res.body.user.password).toBeUndefined(); // password should not leak

    authToken = res.body.token;
  });

  it('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: TEST_NOMBRE, email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(409);
  });

  it('should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL });

    expect(res.status).toBe(400);
  });

  it('should reject short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'X', email: 'short@test.com', password: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(TEST_EMAIL);

    authToken = res.body.token;
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('should reject non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: TEST_PASSWORD });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me (protected)', () => {
  it('should return user when token is valid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user.nombre).toBe(TEST_NOMBRE);
    expect(res.body.user.password).toBeUndefined();
  });

  it('should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
  });
});
