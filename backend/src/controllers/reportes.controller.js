const reportesService = require('../services/reportes.service');
const empresaService = require('../services/empresa.service');
const evidenciasService = require('../services/evidencias.service');
const PDFDocument = require('pdfkit');

const COLOR_VERDE = '#1a6b45';
const COLOR_DORADO = '#c89a2e';
const COLOR_GRIS = '#6b7280';
const COLOR_GRIS_CLARO = '#f3f4f6';
const COLOR_TEXTO = '#111827';

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
    const reporte = await reportesService.obtenerReporteEjecutivo(empresaId);
    const [evidenciasPorEstandar, todasEvidencias] = await Promise.all([
      evidenciasService.totalPorEstandar(empresaId),
      evidenciasService.listar({ empresaId }),
    ]);

    const { empresa, resumen, porEstandar, pendientesCriticos, fechaGeneracion } = reporte;
    const fileName = `reporte-sgsst-${new Date().toISOString().slice(0, 10)}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    doc.pipe(res);

    const W = doc.page.width - 100;

    // ── Portada ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 140).fill(COLOR_VERDE);

    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('REPORTE EJECUTIVO SG-SST', 50, 45, { align: 'center' });

    doc
      .fontSize(12)
      .font('Helvetica')
      .text('Sistema de Gestión de Seguridad y Salud en el Trabajo', 50, 78, { align: 'center' });

    doc
      .fontSize(10)
      .text(`Resolución 0312 de 2019 — Estándares Mínimos`, 50, 100, { align: 'center' });

    doc.fillColor(COLOR_TEXTO);

    // Fecha y empresa info bajo la cabecera
    doc.moveDown(3.5);

    const nivelRiesgoTexto = ['', 'Nivel I (Bajo)', 'Nivel II (Medio)', 'Nivel III (Medio-Alto)', 'Nivel IV (Alto)', 'Nivel V (Muy Alto)'];

    _seccion(doc, 'DATOS DE LA EMPRESA', W);
    _filaInfo(doc, 'Razón social', empresa.nombre || 'No registrada', W);
    _filaInfo(doc, 'Actividad económica', empresa.actividad || 'No registrada', W);
    _filaInfo(doc, 'Ciudad', empresa.ciudad || 'No registrada', W);
    _filaInfo(doc, 'N.º de trabajadores', String(empresa.numTrabajadores), W);
    _filaInfo(doc, 'Nivel de riesgo', nivelRiesgoTexto[empresa.nivelRiesgo] || `Nivel ${empresa.nivelRiesgo}`, W);
    _filaInfo(doc, 'Fecha de generación', new Date(fechaGeneracion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }), W);

    doc.moveDown(0.8);

    // ── Resumen ejecutivo ──────────────────────────────────────────────────────
    _seccion(doc, 'RESUMEN EJECUTIVO', W);

    // Caja de porcentaje global
    const startY = doc.y;
    const boxH = 60;
    doc.roundedRect(50, startY, W, boxH, 6).fill(COLOR_GRIS_CLARO);

    const pct = resumen.porcentajeGlobal;
    const semColor = pct >= 86 ? COLOR_VERDE : pct >= 61 ? COLOR_DORADO : '#dc2626';

    doc
      .fillColor(semColor)
      .fontSize(28)
      .font('Helvetica-Bold')
      .text(`${pct}%`, 50, startY + 10, { width: W, align: 'center' });

    doc
      .fillColor(COLOR_GRIS)
      .fontSize(9)
      .font('Helvetica')
      .text('CUMPLIMIENTO GLOBAL', 50, startY + 42, { width: W, align: 'center' });

    doc.moveDown(4);
    doc.fillColor(COLOR_TEXTO);

    _filaInfo(doc, 'Estándares completados', `${resumen.estandaresCompletados} de ${resumen.estandaresTotal}`, W);
    _filaInfo(doc, 'Ítems completados', `${resumen.itemsCompletados} de ${resumen.itemsTotal}`, W);
    _filaInfo(doc, 'Total evidencias subidas', String(todasEvidencias.length), W);

    const clasificacion = pct >= 86 ? 'ACEPTABLE' : pct >= 61 ? 'MODERADAMENTE ACEPTABLE' : 'CRÍTICO';
    _filaInfo(doc, 'Clasificación', clasificacion, W);

    doc.moveDown(0.8);

    // ── Cumplimiento por estándar ──────────────────────────────────────────────
    _seccion(doc, 'CUMPLIMIENTO POR ESTÁNDAR', W);

    // Encabezados tabla
    const cols = { num: 50, titulo: 75, pct: 370, items: 430, ev: 490 };
    _encabezadoTabla(doc, cols, W);

    porEstandar.forEach((est, idx) => {
      if (doc.y > doc.page.height - 120) doc.addPage();

      const rowY = doc.y;
      if (idx % 2 === 0) {
        doc.rect(50, rowY, W, 20).fill(COLOR_GRIS_CLARO);
      }

      const estColor = est.porcentaje >= 86 ? COLOR_VERDE : est.porcentaje >= 61 ? COLOR_DORADO : '#dc2626';
      const evCount = evidenciasPorEstandar[est.id] ?? 0;

      doc.fillColor(COLOR_TEXTO).fontSize(9).font('Helvetica');
      doc.text(String(est.numero), cols.num, rowY + 5, { width: 20, align: 'center' });
      doc.text(est.titulo.length > 38 ? est.titulo.slice(0, 36) + '…' : est.titulo, cols.titulo, rowY + 5, { width: 285 });
      doc.fillColor(estColor).text(`${est.porcentaje}%`, cols.pct, rowY + 5, { width: 55, align: 'center' });
      doc.fillColor(COLOR_TEXTO).text(`${est.itemsCompletados}/${est.itemsTotal}`, cols.items, rowY + 5, { width: 55, align: 'center' });
      doc.fillColor(COLOR_GRIS).text(String(evCount), cols.ev, rowY + 5, { width: 40, align: 'center' });

      doc.moveDown(1.05);
    });

    doc.moveDown(0.5);

    // ── Pendientes críticos ────────────────────────────────────────────────────
    if (doc.y > doc.page.height - 180) doc.addPage();
    _seccion(doc, 'PENDIENTES CRÍTICOS', W);

    if (pendientesCriticos.length === 0) {
      doc
        .fillColor(COLOR_VERDE)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('✓ No hay pendientes críticos. Todos los estándares cumplen al 100%.', { align: 'center' });
    } else {
      pendientesCriticos.forEach((p, idx) => {
        if (doc.y > doc.page.height - 80) doc.addPage();
        const py = doc.y;
        doc.rect(50, py, W, 42).fill('#fef2f2');
        doc
          .fillColor('#dc2626')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`${idx + 1}. ${p.titulo}`, 60, py + 6, { width: W - 20 });
        doc
          .fillColor(COLOR_TEXTO)
          .fontSize(9)
          .font('Helvetica')
          .text(`Cumplimiento: ${p.porcentaje}%  |  Ítems pendientes: ${p.itemsPendientes}`, 60, py + 22, { width: W - 20 });
        doc.moveDown(2.4);
      });
    }

    doc.moveDown(0.5);

    // ── Recomendaciones ────────────────────────────────────────────────────────
    if (doc.y > doc.page.height - 200) doc.addPage();
    _seccion(doc, 'RECOMENDACIONES', W);

    const recs = _generarRecomendaciones(resumen.porcentajeGlobal, pendientesCriticos, empresa.nivelRiesgo);
    recs.forEach((r, i) => {
      doc
        .fillColor(COLOR_TEXTO)
        .fontSize(9)
        .font('Helvetica')
        .text(`${i + 1}. ${r}`, 55, doc.y, { width: W - 10 });
      doc.moveDown(0.4);
    });

    doc.moveDown(0.6);

    // ── Documentos de evidencia ───────────────────────────────────────────────
    if (doc.y > doc.page.height - 120) doc.addPage();
    _seccion(doc, 'DOCUMENTOS DE EVIDENCIA', W);

    if (todasEvidencias.length === 0) {
      doc
        .fillColor(COLOR_GRIS)
        .fontSize(9)
        .font('Helvetica')
        .text('No se han cargado documentos de evidencia en el sistema.', 55, doc.y, { width: W - 10 });
      doc.moveDown(0.5);
    } else {
      // Agrupar por estandarId (Estandar.id)
      const evPorEst = {};
      for (const ev of todasEvidencias) {
        const key = ev.estandarId ?? 0;
        if (!evPorEst[key]) evPorEst[key] = [];
        evPorEst[key].push(ev);
      }

      porEstandar.forEach((est) => {
        if (doc.y > doc.page.height - 80) doc.addPage();
        const evs = evPorEst[est.id] ?? [];

        doc
          .fillColor(COLOR_TEXTO)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(`${est.numero}. ${est.titulo}`, 55, doc.y, { width: W - 10 });

        if (evs.length === 0) {
          doc.fillColor(COLOR_GRIS).font('Helvetica').text('   Sin documentos subidos', { width: W - 10 });
        } else {
          evs.forEach((ev) => {
            const kb = ev.tamano < 1024 * 1024
              ? `${(ev.tamano / 1024).toFixed(1)} KB`
              : `${(ev.tamano / (1024 * 1024)).toFixed(1)} MB`;
            doc
              .fillColor(COLOR_GRIS)
              .font('Helvetica')
              .text(`   📄 ${ev.nombre} (${kb}) — ${new Date(ev.createdAt).toLocaleDateString('es-CO')}`, { width: W - 10 });
          });
        }
        doc.moveDown(0.3);
      });
    }

    doc.moveDown(0.6);

    // ── Nota legal ────────────────────────────────────────────────────────────
    if (doc.y > doc.page.height - 80) doc.addPage();
    const noteY = doc.y;
    doc.rect(50, noteY, W, 36).fill(COLOR_GRIS_CLARO);
    doc
      .fillColor(COLOR_GRIS)
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Este reporte es una guía de apoyo para el seguimiento del SG-SST y no reemplaza la asesoría de un profesional SST habilitado. ' +
        'Generado automáticamente de conformidad con la Resolución 0312 de 2019.',
        58,
        noteY + 6,
        { width: W - 16, align: 'justify' }
      );

    // ── Pie de página con número de página ────────────────────────────────────
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc
        .fillColor(COLOR_GRIS)
        .fontSize(8)
        .text(
          `Página ${i + 1} de ${totalPages}  |  SG-SST — ${empresa.nombre || 'Empresa'}  |  ${new Date(fechaGeneracion).toLocaleDateString('es-CO')}`,
          50,
          doc.page.height - 30,
          { width: W, align: 'center' }
        );
    }

    doc.end();
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

// ── Helpers PDF ───────────────────────────────────────────────────────────────

function _seccion(doc, titulo, W) {
  const y = doc.y;
  doc.rect(50, y, W, 22).fill(COLOR_VERDE);
  doc
    .fillColor('#ffffff')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text(titulo, 58, y + 6, { width: W - 16 });
  doc.fillColor(COLOR_TEXTO).font('Helvetica');
  doc.moveDown(1.6);
}

function _filaInfo(doc, label, valor, W) {
  const y = doc.y;
  doc
    .fillColor(COLOR_GRIS)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(label + ':', 55, y, { width: 160, continued: false });
  doc
    .fillColor(COLOR_TEXTO)
    .font('Helvetica')
    .text(valor, 220, y, { width: W - 170 });
  doc.moveDown(0.15);
}

function _encabezadoTabla(doc, cols, W) {
  const y = doc.y;
  doc.rect(50, y, W, 18).fill(COLOR_DORADO);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
  doc.text('N°', cols.num, y + 4, { width: 20, align: 'center' });
  doc.text('Estándar', cols.titulo, y + 4, { width: 285 });
  doc.text('Cumplim.', cols.pct, y + 4, { width: 55, align: 'center' });
  doc.text('Ítems', cols.items, y + 4, { width: 55, align: 'center' });
  doc.text('Evid.', cols.ev, y + 4, { width: 40, align: 'center' });
  doc.fillColor(COLOR_TEXTO).font('Helvetica');
  doc.moveDown(1.15);
}

function _generarRecomendaciones(pct, pendientes, nivelRiesgo) {
  const recs = [];
  if (pct < 86) {
    recs.push('Establecer un plan de mejora con fechas y responsables para los estándares con menor cumplimiento.');
  }
  if (pendientes.length > 0) {
    recs.push(`Priorizar el cierre de brechas en: ${pendientes.map((p) => p.titulo).join(', ')}.`);
  }
  if (nivelRiesgo >= 4) {
    recs.push('Por el nivel de riesgo de la empresa, se recomienda contratar un profesional SST de tiempo completo.');
  }
  recs.push('Cargar evidencias documentales (actas, registros, certificados) en la plataforma para cada estándar.');
  recs.push('Realizar auditorías internas semestrales del SG-SST y registrar los hallazgos en el sistema.');
  if (pct >= 86) {
    recs.push('Mantener el nivel de cumplimiento con revisiones periódicas para no retroceder en los indicadores.');
  }
  return recs;
}
