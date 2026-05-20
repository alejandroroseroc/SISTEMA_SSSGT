const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.listarEstandares = async (empresaId) => {
  const estandares = await prisma.estandar.findMany({
    orderBy: { numero: 'asc' },
    include: { items: { orderBy: { orden: 'asc' } } },
  });

  if (!empresaId) return estandares;

  const evCounts = await prisma.evidencia.groupBy({
    by: ['estandarId'],
    where: { empresaId, estandarId: { not: null } },
    _count: { id: true },
  });
  const evMap = {};
  for (const r of evCounts) evMap[r.estandarId] = r._count.id;

  return estandares.map((e) => ({
    ...e,
    numEvidencias: evMap[e.id] ?? 0,
    tieneEvidencias: (evMap[e.id] ?? 0) > 0,
  }));
};

exports.obtenerEstandar = async (id) => {
  return prisma.estandar.findUnique({
    where: { id },
    include: { items: { orderBy: { orden: 'asc' } } },
  });
};

exports._prisma = prisma;
