const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.obtenerDashboard = async (empresaId) => {
  const [estandares, evCounts] = await Promise.all([
    prisma.estandar.findMany({
      orderBy: { numero: 'asc' },
      include: {
        items: true,
        progresos: {
          where: { empresaId },
          include: { itemsProgreso: true },
        },
      },
    }),
    prisma.evidencia.groupBy({
      by: ['estandarId'],
      where: { empresaId, estandarId: { not: null } },
      _count: { id: true },
    }),
  ]);

  const evMap = {};
  for (const r of evCounts) evMap[r.estandarId] = r._count.id;

  let totalItems = 0;
  let totalCompletados = 0;
  let enProgreso = 0;
  let sinIniciar = 0;
  let estandaresConChecklist100 = 0;
  let estandaresConEvidencia = 0;

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
    const numEvidencias = evMap[est.id] ?? 0;

    totalItems += total;
    totalCompletados += completados;

    if (porcentaje === 100) estandaresConChecklist100++;
    if (numEvidencias > 0) estandaresConEvidencia++;

    if (completados === total && total > 0) {
      // completado
    } else if (completados > 0) {
      enProgreso++;
    } else {
      sinIniciar++;
    }

    return {
      id: est.id,
      numero: est.numero,
      titulo: est.titulo,
      completados,
      total,
      porcentaje,
      numEvidencias,
      tieneEvidencias: numEvidencias > 0,
    };
  });

  const porcentajeGlobal = totalItems > 0 ? Math.round((totalCompletados / totalItems) * 100) : 0;
  const completados = estandares.length - enProgreso - sinIniciar;

  const totalEstandares = estandares.length;
  const checklistCompletado = estandaresConChecklist100 === totalEstandares;
  const tieneEvidenciasTodas = estandaresConEvidencia === totalEstandares;
  const pctChecklist = totalEstandares > 0 ? Math.round((estandaresConChecklist100 / totalEstandares) * 100) : 0;
  const pctEvidencias = totalEstandares > 0 ? Math.round((estandaresConEvidencia / totalEstandares) * 100) : 0;

  return {
    porcentajeGlobal,
    totalEstandares,
    completados,
    enProgreso,
    sinIniciar,
    porEstandar,
    completitudSgsst: {
      checklistCompletado,
      tieneEvidenciasTodas,
      listo: checklistCompletado && tieneEvidenciasTodas,
      porcentajeCompletitud: Math.round((pctChecklist + pctEvidencias) / 2),
      estandaresConChecklist: estandaresConChecklist100,
      estandaresConEvidencia,
      totalEstandares,
    },
  };
};

exports._prisma = prisma;
