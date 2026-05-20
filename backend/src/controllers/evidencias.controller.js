const path = require('path');
const fs = require('fs');
const empresaService = require('../services/empresa.service');
const evidenciasService = require('../services/evidencias.service');

async function resolveEmpresaId(userId) {
  const empresa = await empresaService.obtenerEmpresa(userId);
  if (!empresa) throw Object.assign(new Error('NO_EMPRESA'), { status: 400 });
  return empresa.id;
}

exports.subir = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Se requiere un archivo PDF' });

    const empresaId = await resolveEmpresaId(req.userId);
    const { nombre, estandarId, itemId } = req.body;

    const evidencia = await evidenciasService.crear({
      nombre: nombre || req.file.originalname,
      nombreArchivo: req.file.originalname,
      rutaArchivo: req.file.path,
      mimeType: req.file.mimetype,
      tamano: req.file.size,
      empresaId,
      usuarioId: req.userId,
      estandarId: estandarId || null,
      itemId: itemId || null,
    });

    return res.status(201).json({ ok: true, data: evidencia });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    if (err.message === 'TIPO_INVALIDO') return res.status(400).json({ error: 'Solo se permiten PDF, JPG o PNG' });
    next(err);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const { estandarId, itemId } = req.query;
    const data = await evidenciasService.listar({ empresaId, estandarId, itemId });
    return res.json({ ok: true, data });
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    next(err);
  }
};

exports.listarPorEstandar = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const estandarId = req.params.estandarId;
    const data = await evidenciasService.listar({ empresaId, estandarId });
    return res.json({ ok: true, data });
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    next(err);
  }
};

exports.descargar = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const id = parseInt(req.params.id);
    const ev = await evidenciasService.obtenerPorId(id, empresaId);

    if (!fs.existsSync(ev.rutaArchivo)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    res.setHeader('Content-Type', ev.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${ev.nombreArchivo}"`);
    fs.createReadStream(ev.rutaArchivo).pipe(res);
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    if (err.message === 'NO_ENCONTRADA') return res.status(404).json({ error: 'Evidencia no encontrada' });
    if (err.message === 'FORBIDDEN') return res.status(403).json({ error: 'Sin acceso a esta evidencia' });
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const empresaId = await resolveEmpresaId(req.userId);
    const id = parseInt(req.params.id);
    await evidenciasService.eliminar(id, empresaId);
    return res.json({ ok: true, mensaje: 'Evidencia eliminada' });
  } catch (err) {
    if (err.message === 'NO_EMPRESA') return res.status(400).json({ error: 'Debes registrar tu empresa primero' });
    if (err.message === 'NO_ENCONTRADA') return res.status(404).json({ error: 'Evidencia no encontrada' });
    if (err.message === 'FORBIDDEN') return res.status(403).json({ error: 'Sin acceso a esta evidencia' });
    next(err);
  }
};
