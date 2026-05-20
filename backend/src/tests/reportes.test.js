const request = require('supertest');
const app = require('../app');
const { _prisma: prisma } = require('../services/auth.service');

const TEST_EMAIL = `reportes_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_NOMBRE = 'Usuario Reportes Test';

let authToken = null;
let testUserId = null;
let testEmpresaId = null;

beforeAll(async () => {
  // Crear usuario de prueba
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({ nombre: TEST_NOMBRE, email: TEST_EMAIL, password: TEST_PASSWORD });

  authToken = regRes.body.token;
  testUserId = regRes.body.user.id;

  // Crear empresa
  const empRes = await request(app)
    .post('/api/empresa')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      nombre: 'Empresa Test Reportes',
      actividadEconomica: 'comercio',
      trabajadores: 5,
      ciudad: 'Bogotá',
    });

  testEmpresaId = empRes.body.empresa?.id;

  // Marcar algunos ítems de progreso
  const estRes = await request(app)
    .get('/api/estandares')
    .set('Authorization', `Bearer ${authToken}`);

  const estandares = estRes.body.estandares || [];
  if (estandares.length > 0) {
    const firstEstandar = estandares[0];
    const items = firstEstandar.items || [];
    if (items.length > 0) {
      const itemsCompletados = { [items[0].id]: true };
      await request(app)
        .put(`/api/progreso/${firstEstandar.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ items: itemsCompletados });
    }
  }
});

afterAll(async () => {
  try {
    if (testUserId) {
      // Limpiar en orden correcto por las relaciones
      await prisma.historialProgreso.deleteMany({ where: { usuarioId: testUserId } });

      if (testEmpresaId) {
        const progresos = await prisma.progreso.findMany({ where: { empresaId: testEmpresaId } });
        for (const p of progresos) {
          await prisma.itemProgreso.deleteMany({ where: { progresoId: p.id } });
        }
        await prisma.progreso.deleteMany({ where: { empresaId: testEmpresaId } });
        await prisma.empresa.delete({ where: { id: testEmpresaId } });
      }

      await prisma.usuario.delete({ where: { id: testUserId } });
    }
  } catch (_) {
    // ignorar errores de limpieza
  }
  await prisma.$disconnect();
});

describe('GET /api/reportes/cumplimiento', () => {
  it('devuelve 200 y datos de cumplimiento con token válido', async () => {
    const res = await request(app)
      .get('/api/reportes/cumplimiento')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('devuelve 401 sin token', async () => {
    const res = await request(app).get('/api/reportes/cumplimiento');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/reportes/historial', () => {
  it('devuelve 200 con estructura de paginación', async () => {
    const res = await request(app)
      .get('/api/reportes/historial')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.items).toBeDefined();
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.paginacion).toBeDefined();
    expect(typeof res.body.data.paginacion.total).toBe('number');
    expect(typeof res.body.data.paginacion.totalPaginas).toBe('number');
    expect(typeof res.body.data.paginacion.tieneSiguiente).toBe('boolean');
    expect(typeof res.body.data.paginacion.tieneAnterior).toBe('boolean');
  });

  it('devuelve la página correcta con ?page=1&limit=5', async () => {
    const res = await request(app)
      .get('/api/reportes/historial?page=1&limit=5')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.paginacion.pagina).toBe(1);
    expect(res.body.data.paginacion.limite).toBe(5);
    expect(res.body.data.items.length).toBeLessThanOrEqual(5);
  });
});

describe('GET /api/reportes/ejecutivo', () => {
  it('devuelve 200 con estructura completa', async () => {
    const res = await request(app)
      .get('/api/reportes/ejecutivo')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.empresa).toBeDefined();
    expect(res.body.data.resumen).toBeDefined();
    expect(typeof res.body.data.resumen.porcentajeGlobal).toBe('number');
    expect(Array.isArray(res.body.data.porEstandar)).toBe(true);
    expect(res.body.data.porEstandar.length).toBe(7);
    expect(res.body.data.fechaGeneracion).toBeDefined();
  });

  it('devuelve 401 sin token', async () => {
    const res = await request(app).get('/api/reportes/ejecutivo');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/reportes/pdf', () => {
  it('devuelve 200 y Content-Type application/pdf', async () => {
    const res = await request(app)
      .post('/api/reportes/pdf')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });
});
