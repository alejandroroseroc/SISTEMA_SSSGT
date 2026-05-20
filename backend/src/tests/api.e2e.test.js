const request = require('supertest');
const app = require('../app');
const { _prisma: prisma } = require('../services/auth.service');

const TS = Date.now();
const TEST_EMAIL = `e2e_${TS}@example.com`;
const TEST_PASSWORD = 'e2epassword123';
const TEST_NOMBRE = `E2E Usuario ${TS}`;

let token = null;
let usuarioId = null;
let empresaId = null;
let estandarIds = [];

describe('Flujo E2E completo del API SG-SST', () => {

  // ── FASE 1: AUTENTICACIÓN ──────────────────────────────────────────
  describe('Fase 1 — Autenticación', () => {
    test('Registro de nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nombre: TEST_NOMBRE, email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(TEST_EMAIL);
      token = res.body.token;
      usuarioId = res.body.user.id;
    });

    test('Login con credenciales correctas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      token = res.body.token;
    });

    test('Obtener perfil autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(TEST_EMAIL);
      expect(res.body.user.nombre).toBe(TEST_NOMBRE);
    });
  });

  // ── FASE 2: EMPRESA ────────────────────────────────────────────────
  describe('Fase 2 — Empresa', () => {
    test('Crear empresa con actividad comercio', async () => {
      const res = await request(app)
        .post('/api/empresa')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Empresa E2E Test',
          actividadEconomica: 'comercio',
          trabajadores: 3,
          ciudad: 'Cali',
        });

      expect(res.status).toBe(201);
      expect(res.body.empresa).toBeDefined();
      expect(res.body.empresa.nombre).toBe('Empresa E2E Test');
      empresaId = res.body.empresa.id;
    });

    test('Obtener estándares asignados (7)', async () => {
      const res = await request(app)
        .get('/api/estandares')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.estandares)).toBe(true);
      expect(res.body.estandares.length).toBe(7);
      estandarIds = res.body.estandares.map((e) => e.id);
    });

    test('Actualizar empresa cambiando riesgo', async () => {
      const res = await request(app)
        .put(`/api/empresa/${empresaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nivelRiesgoManual: 3 });

      expect(res.status).toBe(200);
      expect(res.body.empresa.nivelRiesgo).toBe(3);
    });
  });

  // ── FASE 3: CHECKLIST ─────────────────────────────────────────────
  describe('Fase 3 — Checklist y progreso', () => {
    test('Guardar progreso en estándar 1', async () => {
      const estandarId1 = estandarIds[0];

      // Obtener los ítems del estándar
      const detRes = await request(app)
        .get(`/api/progreso/${estandarId1}`)
        .set('Authorization', `Bearer ${token}`);

      expect(detRes.status).toBe(200);
      const items = detRes.body.items;
      expect(items.length).toBeGreaterThan(0);

      // Marcar el primer ítem
      const itemsPayload = items.map((it, i) => ({ itemId: it.id, completado: i === 0 }));

      const res = await request(app)
        .put(`/api/progreso/${estandarId1}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ items: itemsPayload });

      expect(res.status).toBe(200);
      expect(res.body.completados).toBeGreaterThan(0);
    });

    test('Guardar progreso en estándar 2', async () => {
      const estandarId2 = estandarIds[1];

      const detRes = await request(app)
        .get(`/api/progreso/${estandarId2}`)
        .set('Authorization', `Bearer ${token}`);

      const items = detRes.body.items;
      const itemsPayload = items.map((it, i) => ({ itemId: it.id, completado: i < 2 }));

      const res = await request(app)
        .put(`/api/progreso/${estandarId2}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ items: itemsPayload });

      expect(res.status).toBe(200);
    });

    test('Dashboard refleja el progreso', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.porcentajeGlobal).toBeGreaterThan(0);
      expect(Array.isArray(res.body.porEstandar)).toBe(true);
    });
  });

  // ── FASE 4: REPORTES ──────────────────────────────────────────────
  describe('Fase 4 — Reportes', () => {
    test('Historial registra los cambios', async () => {
      const res = await request(app)
        .get('/api/reportes/historial')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    test('Cumplimiento tiene datos de 2 estándares con avance', async () => {
      const res = await request(app)
        .get('/api/reportes/cumplimiento')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const conAvance = res.body.data.filter((e) => e.porcentaje > 0);
      expect(conAvance.length).toBeGreaterThanOrEqual(2);
    });

    test('Reporte ejecutivo tiene estructura correcta', async () => {
      const res = await request(app)
        .get('/api/reportes/ejecutivo')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.empresa).toBeDefined();
      expect(res.body.data.resumen.porcentajeGlobal).toBeGreaterThan(0);
      expect(res.body.data.porEstandar.length).toBe(7);
      expect(res.body.data.fechaGeneracion).toBeDefined();
    });

    test('Generar PDF devuelve application/pdf', async () => {
      const res = await request(app)
        .post('/api/reportes/pdf')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
    });
  });

  // ── FASE 5: NOTIFICACIONES ────────────────────────────────────────
  describe('Fase 5 — Notificaciones', () => {
    test('Notificaciones lista pendientes', async () => {
      const res = await request(app)
        .get('/api/reportes/notificaciones')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.pendientes).toBeDefined();
      expect(Array.isArray(res.body.pendientes)).toBe(true);
    });
  });

  // ── LIMPIEZA ──────────────────────────────────────────────────────
  afterAll(async () => {
    try {
      if (usuarioId) {
        await prisma.historialProgreso.deleteMany({ where: { usuarioId } });
        if (empresaId) {
          const progresos = await prisma.progreso.findMany({ where: { empresaId } });
          for (const p of progresos) {
            await prisma.itemProgreso.deleteMany({ where: { progresoId: p.id } });
          }
          await prisma.progreso.deleteMany({ where: { empresaId } });
          await prisma.empresa.delete({ where: { id: empresaId } });
        }
        await prisma.usuario.delete({ where: { id: usuarioId } });
      }
    } catch (_) {
      // ignorar errores de limpieza
    }
    await prisma.$disconnect();
  });
});
