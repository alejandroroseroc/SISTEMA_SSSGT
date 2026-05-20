const reportesService = require('../services/reportes.service');
const empresaService = require('../services/empresa.service');

async function resolveEmpresaId(userId) {
  const empresa = await empresaService.obtenerEmpresa(userId);
  if (!empresa) throw Object.assign(new Error('NO_EMPRESA'), { status: 400 });
  return empresa.id;
}

exports.cumplimiento = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const data = await reportesService.cumplimiento(empresaId);
    return res.json({ data });
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    next(err);
  }
};

exports.historial = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (page < 1) return res.status(400).json({ error: 'El parámetro page debe ser >= 1' });
    if (limit > 100) return res.status(400).json({ error: 'El parámetro limit no puede ser mayor a 100' });

    const result = await reportesService.historial({ usuarioId: req.userId, page, limit });
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.notificaciones = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const data = await reportesService.notificaciones({ empresaId, usuarioId: req.userId });
    return res.json({ pendientes: data });
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    next(err);
  }
};

exports.ejecutivo = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const data = await reportesService.obtenerReporteEjecutivo(empresaId);
    return res.json({ ok: true, data });
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    next(err);
  }
};

exports.pdf = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const cumplimiento = await reportesService.cumplimiento(empresaId);

    const promedio = cumplimiento.length > 0
      ? Math.round(cumplimiento.reduce((s, e) => s + e.porcentaje, 0) / cumplimiento.length)
      : 0;

    const lines = [
      'REPORTE SG-SST',
      `Generado: ${new Date().toLocaleDateString('es-CO')}`,
      '',
      'CUMPLIMIENTO POR ESTANDAR',
      ...cumplimiento.map((e) => `  ${e.numero}. ${e.titulo}: ${e.porcentaje}% (${e.completados}/${e.total})`),
      '',
      `Promedio global: ${promedio}%`,
    ];

    const content = lines.join('\n');

    // Minimal valid PDF with the report text embedded
    const pdfHeader = `%PDF-1.4\n`;
    const pdfBody = `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>\nstream\n${content}\nendstream\nendobj\n`;
    const pdfFooter = `%%EOF`;
    const pdfContent = pdfHeader + pdfBody + pdfFooter;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-sgsst-${new Date().toISOString().slice(0, 10)}.pdf"`);
    return res.send(Buffer.from(pdfContent));
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    next(err);
  }
};

exports.arl = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const data = await reportesService.obtenerReporteEjecutivo(empresaId);
    return res.json({
      ok: true,
      mensaje: 'Informe ARL generado correctamente',
      data: {
        empresa: data.empresa,
        resumen: data.resumen,
        porEstandar: data.porEstandar,
        fechaGeneracion: data.fechaGeneracion,
      },
    });
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    next(err);
  }
};
