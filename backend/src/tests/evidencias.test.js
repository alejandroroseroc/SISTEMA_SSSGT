const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../app');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TS = Date.now();
const TEST_EMAIL = `ev_test_${TS}@sgsst.test`;
const TEST_PASSWORD = 'Test1234!';

let token;
let empresaId;
let evidenciaId;

const PDF_PATH = path.join(__dirname, 'fixtures', 'test.pdf');
const MIN_PDF = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n110\n%%EOF';

beforeAll(async () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });
  if (!fs.existsSync(PDF_PATH)) fs.writeFileSync(PDF_PATH, MIN_PDF);

  const regRes = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'Ev Test User', email: TEST_EMAIL, password: TEST_PASSWORD });
  token = regRes.body.token;

  const empRes = await request(app)
    .post('/api/empresa')
    .set('Authorization', `Bearer ${token}`)
    .send({ nombre: 'Empresa Evidencias', actividadEconomica: 'comercio', trabajadores: 5, ciudad: 'Bogotá' });
  empresaId = empRes.body.empresa?.id;
});

afterAll(async () => {
  await prisma.evidencia.deleteMany({ where: { empresaId } });
  await prisma.empresa.deleteMany({ where: { id: empresaId } });
  await prisma.usuario.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

// ── Autenticación ─────────────────────────────────────────────────────────────
describe('Rutas sin token → 401', () => {
  it('POST /api/evidencias', async () => {
    const res = await request(app).post('/api/evidencias').attach('archivo', PDF_PATH);
    expect(res.status).toBe(401);
  });

  it('GET /api/evidencias', async () => {
    const res = await request(app).get('/api/evidencias');
    expect(res.status).toBe(401);
  });

  it('GET /api/evidencias/estandar/1', async () => {
    const res = await request(app).get('/api/evidencias/estandar/1');
    expect(res.status).toBe(401);
  });

  it('DELETE /api/evidencias/1', async () => {
    const res = await request(app).delete('/api/evidencias/1');
    expect(res.status).toBe(401);
  });
});

// ── Upload ────────────────────────────────────────────────────────────────────
describe('POST /api/evidencias', () => {
  it('rechaza sin archivo → 400', async () => {
    const res = await request(app)
      .post('/api/evidencias')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('rechaza tipo inválido (texto plano) → 400', async () => {
    const buf = Buffer.from('hola mundo');
    const res = await request(app)
      .post('/api/evidencias')
      .set('Authorization', `Bearer ${token}`)
      .attach('archivo', buf, { filename: 'prueba.txt', contentType: 'text/plain' });
    expect(res.status).toBe(400);
  });

  it('sube un PDF correctamente → 201', async () => {
    const res = await request(app)
      .post('/api/evidencias')
      .set('Authorization', `Bearer ${token}`)
      .attach('archivo', PDF_PATH)
      .field('nombre', 'Acta de capacitación')
      .field('estandarId', '1');

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toMatchObject({
      nombre: 'Acta de capacitación',
      mimeType: 'application/pdf',
      estandarId: 1,
    });
    evidenciaId = res.body.data.id;
  });

  it('sube una imagen PNG correctamente → 201', async () => {
    // PNG mínimo de 1x1 px
    const pngBuf = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c48900000013' +
      '4944415478016360f8cfc0c0c0c000000000050001a5f64560000000049454e44ae426082',
      'hex'
    );
    const res = await request(app)
      .post('/api/evidencias')
      .set('Authorization', `Bearer ${token}`)
      .attach('archivo', pngBuf, { filename: 'logo.png', contentType: 'image/png' })
      .field('nombre', 'Logo empresa')
      .field('estandarId', '2');

    expect(res.status).toBe(201);
    expect(res.body.data.mimeType).toBe('image/png');
  });
});

// ── Listar ───────────────────────────────────────────────────────────────────
describe('GET /api/evidencias', () => {
  it('lista todas las evidencias → 200 con array', async () => {
    const res = await request(app)
      .get('/api/evidencias')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('filtra por estandarId via query → solo registros del estándar', async () => {
    const res = await request(app)
      .get('/api/evidencias?estandarId=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((e) => e.estandarId === 1)).toBe(true);
  });
});

// ── Listar por estándar (ruta /estandar/:id) ──────────────────────────────────
describe('GET /api/evidencias/estandar/:id', () => {
  it('devuelve 200 con array para estándar 1', async () => {
    const res = await request(app)
      .get('/api/evidencias/estandar/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('tiene al menos un elemento después de subir', async () => {
    const res = await request(app)
      .get('/api/evidencias/estandar/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('estándar sin evidencias devuelve array vacío', async () => {
    const res = await request(app)
      .get('/api/evidencias/estandar/7')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ── Descargar ─────────────────────────────────────────────────────────────────
describe('GET /api/evidencias/:id/descargar', () => {
  it('descarga el archivo con Content-Disposition attachment', async () => {
    const res = await request(app)
      .get(`/api/evidencias/${evidenciaId}/descargar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });

  it('devuelve 404 para id inexistente', async () => {
    const res = await request(app)
      .get('/api/evidencias/999999/descargar')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ── Eliminar ──────────────────────────────────────────────────────────────────
describe('DELETE /api/evidencias/:id', () => {
  it('elimina la evidencia → 200 + ok:true', async () => {
    const res = await request(app)
      .delete(`/api/evidencias/${evidenciaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('la evidencia ya no aparece en el listado del estándar', async () => {
    const res = await request(app)
      .get('/api/evidencias/estandar/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const ids = res.body.data.map((e) => e.id);
    expect(ids).not.toContain(evidenciaId);
  });

  it('devuelve 404 al eliminar evidencia inexistente', async () => {
    const res = await request(app)
      .delete('/api/evidencias/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
