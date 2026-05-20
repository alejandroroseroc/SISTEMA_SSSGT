const dashboardService = require('../services/dashboard.service');
const empresaService = require('../services/empresa.service');

exports.obtener = async (req, res, next) => {
  try {
    const empresa = await empresaService.obtenerEmpresa(req.userId);
    if (!empresa) return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    const data = await dashboardService.obtenerDashboard(empresa.id);
    return res.json(data);
  } catch (err) {
    next(err);
  }
};
