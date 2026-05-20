const estandaresService = require('../services/estandares.service');
const empresaService = require('../services/empresa.service');

exports.listar = async (req, res, next) => {
  try {
    let empresaId = null;
    try {
      const empresa = await empresaService.obtenerEmpresa(req.userId);
      if (empresa) empresaId = empresa.id;
    } catch {
      // sin empresa — se devuelven estandares sin conteos de evidencias
    }
    const estandares = await estandaresService.listarEstandares(empresaId);
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
