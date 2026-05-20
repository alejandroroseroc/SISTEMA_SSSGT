const estandaresService = require('../services/estandares.service');

exports.listar = async (_req, res, next) => {
  try {
    const estandares = await estandaresService.listarEstandares();
    return res.json({ estandares });
  } catch (err) {
    next(err);
  }
};

exports.obtener = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const estandar = await estandaresService.obtenerEstandar(id);
    if (!estandar) return res.status(404).json({ error: 'Estándar no encontrado' });
    return res.json({ estandar });
  } catch (err) {
    next(err);
  }
};
