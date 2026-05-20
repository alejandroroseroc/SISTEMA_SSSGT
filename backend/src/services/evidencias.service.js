const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

exports.crear = async ({ nombre, nombreArchivo, rutaArchivo, mimeType, tamano, empresaId, usuarioId, estandarId, itemId }) => {
  return prisma.evidencia.create({
    data: {
      nombre,
      nombreArchivo,
      rutaArchivo,
      mimeType: mimeType || 'application/pdf',
      tamano,
      empresaId,
      usuarioId,
      estandarId: estandarId ? parseInt(estandarId) : null,
      itemId: itemId ? parseInt(itemId) : null,
    },
  });
};

exports.listar = async ({ empresaId, estandarId, itemId }) => {
  const where = { empresaId };
  if (estandarId) where.estandarId = parseInt(estandarId);
  if (itemId) where.itemId = parseInt(itemId);

  return prisma.evidencia.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

exports.obtenerPorId = async (id, empresaId) => {
  const ev = await prisma.evidencia.findUnique({ where: { id } });
  if (!ev) throw Object.assign(new Error('NO_ENCONTRADA'), { status: 404 });
  if (ev.empresaId !== empresaId) throw Object.assign(new Error('FORBIDDEN'), { status: 403 });
  return ev;
};

exports.eliminar = async (id, empresaId) => {
  const ev = await exports.obtenerPorId(id, empresaId);
  if (fs.existsSync(ev.rutaArchivo)) fs.unlinkSync(ev.rutaArchivo);
  return prisma.evidencia.delete({ where: { id } });
};

exports.totalPorEstandar = async (empresaId) => {
  const rows = await prisma.evidencia.groupBy({
    by: ['estandarId'],
    where: { empresaId, estandarId: { not: null } },
    _count: { id: true },
  });
  const map = {};
  for (const r of rows) map[r.estandarId] = r._count.id;
  return map;
};

exports._prisma = prisma;
