const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const RIESGO_MAP = {
  oficina: 1,
  comercio: 2, restaurante: 2, peluqueria: 2, educacion: 2,
  salud: 3, agricultura: 3, industria: 3,
  transporte: 4,
  construccion: 5,
};

function estimarRiesgo(actividad) {
  return RIESGO_MAP[actividad.toLowerCase()] || 2;
}

exports.crearEmpresa = async ({ nombre, actividadEconomica, trabajadores, ciudad, nivelRiesgoManual, usuarioId }) => {
  const existing = await prisma.empresa.findUnique({ where: { usuarioId } });
  if (existing) throw new Error('EMPRESA_EXISTS');

  const nivelRiesgo = nivelRiesgoManual ?? estimarRiesgo(actividadEconomica);

  const empresa = await prisma.empresa.create({
    data: { nombre, actividadEconomica, trabajadores, ciudad, nivelRiesgo, usuarioId },
  });
  return empresa;
};

exports.obtenerEmpresa = async (usuarioId) => {
  return prisma.empresa.findUnique({ where: { usuarioId } });
};

exports.actualizarEmpresa = async ({ id, nombre, actividadEconomica, trabajadores, ciudad, nivelRiesgoManual, usuarioId }) => {
  const empresa = await prisma.empresa.findUnique({ where: { id } });
  if (!empresa) throw new Error('NOT_FOUND');
  if (empresa.usuarioId !== usuarioId) throw new Error('FORBIDDEN');

  const nivelRiesgo = nivelRiesgoManual ?? estimarRiesgo(actividadEconomica ?? empresa.actividadEconomica);

  return prisma.empresa.update({
    where: { id },
    data: {
      nombre: nombre ?? empresa.nombre,
      actividadEconomica: actividadEconomica ?? empresa.actividadEconomica,
      trabajadores: trabajadores ?? empresa.trabajadores,
      ciudad: ciudad ?? empresa.ciudad,
      nivelRiesgo,
    },
  });
};

exports._prisma = prisma;
exports.estimarRiesgo = estimarRiesgo;
