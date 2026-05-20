const empresaService = require('../services/empresa.service');

exports.crear = async (req, res, next) => {
  try {
    const { nombre, actividadEconomica, trabajadores, ciudad, nivelRiesgoManual } = req.body;
    if (!nombre || !actividadEconomica || !trabajadores) {
      return res.status(400).json({ error: 'nombre, actividadEconomica y trabajadores son obligatorios' });
    }
    const empresa = await empresaService.crearEmpresa({
      nombre, actividadEconomica, trabajadores: parseInt(trabajadores), ciudad, nivelRiesgoManual: nivelRiesgoManual ? parseInt(nivelRiesgoManual) : undefined, usuarioId: req.userId,
    });
    return res.status(201).json({ empresa });
  } catch (err) {
    if (err.message === 'EMPRESA_EXISTS') return res.status(409).json({ error: 'Ya tienes una empresa registrada' });
    next(err);
  }
};

exports.obtenerMia = async (req, res, next) => {
  try {
    const empresa = await empresaService.obtenerEmpresa(req.userId);
    if (!empresa) return res.status(404).json({ error: 'No tienes empresa registrada' });
    return res.json({ empresa });
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { nombre, actividadEconomica, trabajadores, ciudad, nivelRiesgoManual } = req.body;
    const empresa = await empresaService.actualizarEmpresa({
      id, nombre, actividadEconomica, trabajadores: trabajadores ? parseInt(trabajadores) : undefined,
      ciudad, nivelRiesgoManual: nivelRiesgoManual ? parseInt(nivelRiesgoManual) : undefined, usuarioId: req.userId,
    });
    return res.json({ empresa });
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Empresa no encontrada' });
    if (err.message === 'FORBIDDEN') return res.status(403).json({ error: 'Sin permiso' });
    next(err);
  }
};
