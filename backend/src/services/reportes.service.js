const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.cumplimiento = async (empresaId) => {
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

  return estandares.map((est) => {
    const progreso = est.progresos[0];
    const total = est.items.length;
    let completados = 0;
    if (progreso) {
      const map = {};
      for (const ip of progreso.itemsProgreso) map[ip.itemId] = ip.completado;
      completados = est.items.filter((i) => map[i.id]).length;
    }
    return {
      id: est.id,
      numero: est.numero,
      titulo: est.titulo,
      completados,
      total,
      porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0,
    };
  });
};

exports.historial = async ({ usuarioId, page = 1, limit = 20 }) => {
  const pageSafe = Math.max(1, parseInt(page) || 1);
  const limitSafe = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageSafe - 1) * limitSafe;

  const [total, registros] = await Promise.all([
    prisma.historialProgreso.count({ where: { usuarioId } }),
    prisma.historialProgreso.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitSafe,
      include: { usuario: { select: { nombre: true } } },
    }),
  ]);

  const estandarIds = [...new Set(registros.map((r) => r.estandarId))];
  const estandares = await prisma.estandar.findMany({ where: { id: { in: estandarIds } } });
  const estMap = {};
  for (const e of estandares) estMap[e.id] = e.titulo;

  const totalPaginas = Math.ceil(total / limitSafe);

  return {
    ok: true,
    data: {
      items: registros.map((r) => ({ ...r, estandarTitulo: estMap[r.estandarId] ?? '' })),
      paginacion: {
        total,
        pagina: pageSafe,
        limite: limitSafe,
        totalPaginas,
        tieneSiguiente: pageSafe < totalPaginas,
        tieneAnterior: pageSafe > 1,
      },
    },
  };
};

exports.notificaciones = async ({ empresaId, usuarioId }) => {
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

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  const pendientes = [];

  for (const est of estandares) {
    const progreso = est.progresos[0];
    const total = est.items.length;
    let completados = 0;
    const completadoMap = {};

    if (progreso) {
      for (const ip of progreso.itemsProgreso) completadoMap[ip.itemId] = ip.completado;
      completados = est.items.filter((i) => completadoMap[i.id]).length;
    }

    if (completados < total) {
      const prioridad = empresa?.nivelRiesgo >= 4 ? 'alta' : completados === 0 ? 'media' : 'baja';
      pendientes.push({
        estandarId: est.id,
        estandarNumero: est.numero,
        estandarTitulo: est.titulo,
        completados,
        total,
        porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0,
        prioridad,
      });
    }
  }

  pendientes.sort((a, b) => {
    const orden = { alta: 0, media: 1, baja: 2 };
    return orden[a.prioridad] - orden[b.prioridad];
  });

  return pendientes;
};

exports.obtenerReporteEjecutivo = async (empresaId) => {
  const [empresa, estandares] = await Promise.all([
    prisma.empresa.findUnique({ where: { id: empresaId } }),
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
  ]);

  let itemsCompletadosTotal = 0;
  let itemsTotalGlobal = 0;
  let estandaresCompletados = 0;

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
    const estado = porcentaje === 100 ? 'completado' : completados > 0 ? 'en_progreso' : 'sin_iniciar';

    itemsCompletadosTotal += completados;
    itemsTotalGlobal += total;
    if (porcentaje === 100) estandaresCompletados++;

    return {
      numero: est.numero,
      titulo: est.titulo,
      itemsCompletados: completados,
      itemsTotal: total,
      porcentaje,
      estado,
    };
  });

  const porcentajeGlobal =
    porEstandar.length > 0
      ? Math.round(porEstandar.reduce((s, e) => s + e.porcentaje, 0) / porEstandar.length)
      : 0;

  const pendientesCriticos = [...porEstandar]
    .filter((e) => e.porcentaje < 100)
    .sort((a, b) => a.porcentaje - b.porcentaje)
    .slice(0, 3)
    .map((e) => ({
      numero: e.numero,
      titulo: e.titulo,
      porcentaje: e.porcentaje,
      itemsPendientes: e.itemsTotal - e.itemsCompletados,
    }));

  return {
    empresa: {
      nombre: empresa?.nombre ?? '',
      actividad: empresa?.actividadEconomica ?? '',
      nivelRiesgo: empresa?.nivelRiesgo ?? 1,
      numTrabajadores: empresa?.trabajadores ?? 0,
      ciudad: empresa?.ciudad ?? '',
    },
    resumen: {
      porcentajeGlobal,
      estandaresCompletados,
      estandaresTotal: 7,
      itemsCompletados: itemsCompletadosTotal,
      itemsTotal: itemsTotalGlobal,
    },
    porEstandar,
    pendientesCriticos,
    fechaGeneracion: new Date().toISOString(),
  };
};

exports._prisma = prisma;
