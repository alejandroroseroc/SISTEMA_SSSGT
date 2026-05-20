const progresoService = require('../services/progreso.service');
const empresaService = require('../services/empresa.service');

async function resolveEmpresaId(userId) {
  const empresa = await empresaService.obtenerEmpresa(userId);
  if (!empresa) throw Object.assign(new Error('NO_EMPRESA'), { status: 400 });
  return empresa.id;
}

exports.obtener = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const estandarId = parseInt(req.params.estandarId);
    const data = await progresoService.obtenerProgreso({ empresaId, estandarId });
    return res.json(data);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Estándar no encontrado' });
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    next(err);
  }
};

exports.guardar = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const estandarId = parseInt(req.params.estandarId);
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items debe ser un arreglo' });
    const data = await progresoService.guardarProgreso({ empresaId, estandarId, items, usuarioId: req.userId });
    return res.json(data);
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    if (err.message === 'ITEMS_INVALID') return res.status(400).json({ error: 'Algunos ítems no pertenecen a este estándar' });
    next(err);
  }
};
