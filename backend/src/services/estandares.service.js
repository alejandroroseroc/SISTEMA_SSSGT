const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.listarEstandares = async () => {
  return prisma.estandar.findMany({
    orderBy: { numero: 'asc' },
    include: { items: { orderBy: { orden: 'asc' } } },
  });
};

exports.obtenerEstandar = async (id) => {
  return prisma.estandar.findUnique({
    where: { id },
    include: { items: { orderBy: { orden: 'asc' } } },
  });
};

exports._prisma = prisma;
