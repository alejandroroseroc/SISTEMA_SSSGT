const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.obtenerProgreso = async ({ empresaId, estandarId }) => {
  const estandar = await prisma.estandar.findUnique({
    where: { id: estandarId },
    include: { items: { orderBy: { orden: 'asc' } } },
  });
  if (!estandar) throw new Error('NOT_FOUND');

  let progreso = await prisma.progreso.findUnique({
    where: { empresaId_estandarId: { empresaId, estandarId } },
    include: { itemsProgreso: true },
  });

  // Build a map of completado state
  const completadoMap = {};
  if (progreso) {
    for (const ip of progreso.itemsProgreso) {
      completadoMap[ip.itemId] = ip.completado;
    }
  }

  const items = estandar.items.map((item) => ({
    id: item.id,
    texto: item.texto,
    evidencias: item.evidencias,
    orden: item.orden,
    completado: completadoMap[item.id] ?? false,
  }));

  const completados = items.filter((i) => i.completado).length;
  const porcentaje = items.length > 0 ? Math.round((completados / items.length) * 100) : 0;

  return { estandar: { id: estandar.id, numero: estandar.numero, titulo: estandar.titulo, descripcion: estandar.descripcion }, items, completados, total: items.length, porcentaje };
};

exports.guardarProgreso = async ({ empresaId, estandarId, items, usuarioId }) => {
  // Validate items belong to this estandar
  const validItems = await prisma.item.findMany({ where: { estandarId }, select: { id: true } });
  const validItemIds = new Set(validItems.map((i) => i.id));
  const invalid = items.filter(({ itemId }) => !validItemIds.has(itemId));
  if (invalid.length > 0) throw Object.assign(new Error('ITEMS_INVALID'), { status: 400 });

  // Upsert Progreso record
  let progreso = await prisma.progreso.upsert({
    where: { empresaId_estandarId: { empresaId, estandarId } },
    update: {},
    create: { empresaId, estandarId },
  });

  // Upsert each ItemProgreso
  for (const { itemId, completado } of items) {
    const existing = await prisma.itemProgreso.findUnique({
      where: { progresoId_itemId: { progresoId: progreso.id, itemId } },
    });

    if (existing) {
      if (existing.completado !== completado) {
        await prisma.itemProgreso.update({
          where: { id: existing.id },
          data: { completado },
        });

        // Log to history
        const item = await prisma.item.findUnique({ where: { id: itemId } });
        await prisma.historialProgreso.create({
          data: {
            usuarioId,
            estandarId,
            itemId,
            accion: completado ? 'completado' : 'desmarcado',
            descripcion: item?.texto ?? '',
          },
        });
      }
    } else {
      await prisma.itemProgreso.create({
        data: { progresoId: progreso.id, itemId, completado },
      });
      if (completado) {
        const item = await prisma.item.findUnique({ where: { id: itemId } });
        await prisma.historialProgreso.create({
          data: {
            usuarioId,
            estandarId,
            itemId,
            accion: 'completado',
            descripcion: item?.texto ?? '',
          },
        });
      }
    }
  }

  return exports.obtenerProgreso({ empresaId, estandarId });
};

exports._prisma = prisma;
