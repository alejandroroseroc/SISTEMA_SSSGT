const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.obtenerDashboard = async (empresaId) => {
  const estandares = await prisma.estandar.findMany({
    orderBy: { numero: 'asc' },
    include: {
      items: true,
      progresos: {
        where: { empresaId },
        include: { itemsProgreso: true },
      },
    },
  });

  let totalItems = 0;
  let totalCompletados = 0;
  let enProgreso = 0;
  let sinIniciar = 0;

  const porEstandar = estandares.map((est) => {
    const progreso = est.progresos[0];
    const total = est.items.length;
    let completados = 0;

    if (progreso) {
      const map = {};
      for (const ip of progreso.itemsProgreso) map[ip.itemId] = ip.completado;
      completados = est.items.filter((i) => map[i.id]).length;
    }

    const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
    totalItems += total;
    totalCompletados += completados;

    if (completados === total && total > 0) {
      // completed — not tracked separately in counts below
    } else if (completados > 0) {
      enProgreso++;
    } else {
      sinIniciar++;
    }

    return { id: est.id, numero: est.numero, titulo: est.titulo, completados, total, porcentaje };
  });

  const porcentajeGlobal = totalItems > 0 ? Math.round((totalCompletados / totalItems) * 100) : 0;
  const completados = estandares.length - enProgreso - sinIniciar;

  return { porcentajeGlobal, totalEstandares: estandares.length, completados, enProgreso, sinIniciar, porEstandar };
};

exports._prisma = prisma;
