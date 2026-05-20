import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DonutChart from '../Components/charts/DonutChart';
import BarChart from '../Components/charts/BarChart';
import LineChart from '../Components/charts/LineChart';
import RadarChart from '../Components/charts/RadarChart';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../Components/ui/Skeleton';

function badgeNivel(pct) {
  if (pct >= 70) return { label: 'Cumplimiento alto', color: 'var(--verde)', bg: 'var(--verde-suave)' };
  if (pct >= 40) return { label: 'Cumplimiento medio', color: '#8a6500', bg: 'var(--dorado-suave)' };
  return { label: 'Cumplimiento bajo', color: 'var(--rojo)', bg: 'var(--rojo-suave)' };
}

function semaforo(pct) {
  if (pct >= 80) return { color: 'var(--verde)', label: 'Alto' };
  if (pct >= 40) return { color: 'var(--dorado)', label: 'Medio' };
  return { color: 'var(--rojo)', label: 'Bajo' };
}

function buildLineData(historial) {
  const now = new Date();
  const days = 30;
  const counts = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    counts[d.toISOString().slice(0, 10)] = 0;
  }
  for (const h of historial) {
    const day = new Date(h.createdAt).toISOString().slice(0, 10);
    if (day in counts && h.accion === 'completado') counts[day]++;
  }
  return Object.entries(counts).map(([fecha, valor]) => ({
    fecha: new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
    valor,
  }));
}

export default function ReporteEjecutivo() {
  const navigate = useNavigate();
  const [reporte, setReporte] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargandoArl, setDescargandoArl] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [repRes, histRes, evRes] = await Promise.all([
          api.get('/reportes/ejecutivo'),
          api.get('/reportes/historial?limit=100'),
          api.get('/evidencias').catch(() => ({ data: { data: [] } })),
        ]);
        setReporte(repRes.data.data);
        const items = histRes.data.data?.items ?? histRes.data.registros ?? [];
        setHistorial(items);
        setEvidencias(evRes.data.data || []);
      } catch {
        // empresa no configurada
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const descargarPDF = useCallback(async () => {
    try {
      const res = await api.post('/reportes/pdf', {}, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ejecutivo-sgsst-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al generar el PDF. Inténtalo de nuevo.');
    }
  }, []);

  const descargarArl = useCallback(async () => {
    setDescargandoArl(true);
    try {
      const res = await api.post('/reportes/arl');
      const lines = [
        'INFORME ARL - SG-SST',
        `Empresa: ${res.data.data?.empresa?.nombre ?? ''}`,
        `Generado: ${new Date().toLocaleDateString('es-CO')}`,
        '',
        `Cumplimiento global: ${res.data.data?.resumen?.porcentajeGlobal ?? 0}%`,
        `Ítems completados: ${res.data.data?.resumen?.itemsCompletados ?? 0}/${res.data.data?.resumen?.itemsTotal ?? 0}`,
        '',
        'DETALLE POR ESTÁNDAR:',
        ...(res.data.data?.porEstandar ?? []).map(
          (e) => `  ${e.numero}. ${e.titulo}: ${e.porcentaje}% (${e.itemsCompletados}/${e.itemsTotal})`
        ),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe-arl-sgsst-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al generar el informe ARL.');
    } finally {
      setDescargandoArl(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="screen active">
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
          <SkeletonTable />
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SkeletonChart height={280} />
            <SkeletonChart height={280} />
            <SkeletonChart height={280} />
            <SkeletonChart height={280} />
          </div>
        </div>
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="screen active">
        <div className="container">
          <div className="alert alert-dorado">
            <span className="alert-icon">🏢</span>
            <div>
              Debes registrar tu empresa antes de ver el reporte ejecutivo.{' '}
              <button className="link-action" onClick={() => navigate('/onboarding')}>
                Configurar empresa →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { empresa, resumen, porEstandar, pendientesCriticos, fechaGeneracion } = reporte;
  const nivelBadge = badgeNivel(resumen.porcentajeGlobal);
  const lineData = buildLineData(historial);
  const radarData = porEstandar.map((e) => ({ estandar: e.titulo, porcentaje: e.porcentaje }));

  // Build evidence counts by estandarId
  const evPorEstandar = {};
  for (const ev of evidencias) {
    if (ev.estandarId) evPorEstandar[ev.estandarId] = (evPorEstandar[ev.estandarId] || 0) + 1;
  }

  const donutData = porEstandar.map((e) => ({
    numero: e.numero,
    titulo: e.titulo,
    porcentaje: e.porcentaje,
  }));

  const accionesPendientes = [...porEstandar]
    .filter((e) => e.porcentaje < 100)
    .sort((a, b) => a.porcentaje - b.porcentaje)
    .slice(0, 5)
    .map((e) => ({
      ...e,
      prioridad: e.porcentaje < 40 ? 'Alta' : 'Media',
    }));

  return (
    <div className="screen active">
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>Reporte Ejecutivo SG-SST</h2>
            <p style={{ color: 'var(--texto-suave)', fontSize: '0.95rem', marginBottom: 8 }}>
              {empresa.nombre} · {new Date(fechaGeneracion).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <span
              className="badge"
              style={{ background: nivelBadge.bg, color: nivelBadge.color, border: `1px solid ${nivelBadge.color}33` }}
            >
              {nivelBadge.label}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={descargarArl} disabled={descargandoArl}>
              {descargandoArl ? 'Generando…' : '📄 Informe ARL'}
            </button>
            <button className="btn btn-dorado" onClick={descargarPDF}>
              ⬇️ Descargar PDF
            </button>
          </div>
        </div>

        {/* Resumen ejecutivo — 4 métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {/* Cumplimiento global */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Cumplimiento global
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 700, color: nivelBadge.color, fontFamily: 'DM Serif Display, serif', lineHeight: 1 }}>
              {resumen.porcentajeGlobal}%
            </div>
          </div>

          {/* Estándares completados */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Estándares
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 700, color: 'var(--verde)', fontFamily: 'DM Serif Display, serif', lineHeight: 1 }}>
              {resumen.estandaresCompletados}/{resumen.estandaresTotal}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--texto-suave)', marginTop: 4 }}>completados</div>
          </div>

          {/* Ítems */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Ítems cumplidos
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 700, color: 'var(--verde)', fontFamily: 'DM Serif Display, serif', lineHeight: 1 }}>
              {resumen.itemsCompletados}/{resumen.itemsTotal}
            </div>
          </div>

          {/* Evidencias */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Evidencias
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 700, color: 'var(--dorado)', fontFamily: 'DM Serif Display, serif', lineHeight: 1 }}>
              {evidencias.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--texto-suave)', marginTop: 4 }}>documentos subidos</div>
          </div>
        </div>

        {/* Tabla de cumplimiento */}
        <div className="card mb32">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 16, color: 'var(--texto)' }}>Cumplimiento por estándar</h3>
          <table className="resumen-tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Estándar</th>
                <th>Completados</th>
                <th className="table-mobile-hide">Total</th>
                <th>%</th>
                <th className="table-mobile-hide">Evidencias</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {porEstandar.map((e) => {
                const sem = semaforo(e.porcentaje);
                const evCount = evPorEstandar[e.numero] ?? 0;
                return (
                  <tr key={e.numero}>
                    <td><strong>{e.numero}</strong></td>
                    <td>{e.titulo}</td>
                    <td>{e.itemsCompletados}</td>
                    <td className="table-mobile-hide">{e.itemsTotal}</td>
                    <td><strong style={{ color: sem.color }}>{e.porcentaje}%</strong></td>
                    <td className="table-mobile-hide">
                      <span style={{ fontSize: '0.82rem', color: evCount > 0 ? 'var(--dorado)' : 'var(--texto-suave)' }}>
                        {evCount > 0 ? `📎 ${evCount}` : '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: sem.color === 'var(--verde)' ? 'var(--verde-suave)' : sem.color === 'var(--dorado)' ? 'var(--dorado-suave)' : 'var(--rojo-suave)',
                          color: sem.color,
                          border: 'none',
                        }}
                      >
                        {sem.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Gráficas 2x2 */}
        <div className="charts-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <div className="card">
            <DonutChart data={donutData} title="Distribución de cumplimiento" height={280} />
          </div>
          <div className="card">
            <BarChart data={porEstandar} title="Cumplimiento por estándar" height={280} horizontal />
          </div>
          <div className="card">
            <LineChart data={lineData} title="Evolución del progreso (últimos 30 días)" height={230} />
          </div>
          <div className="card">
            <RadarChart data={radarData} title="Nivel de cumplimiento por área" height={280} />
          </div>
        </div>

        {/* Acciones pendientes críticas */}
        {accionesPendientes.length > 0 && (
          <div className="card mb32">
            <h3 style={{ fontSize: '1.05rem', marginBottom: 16, color: 'var(--texto)' }}>Acciones pendientes críticas</h3>
            <table className="resumen-tabla">
              <thead>
                <tr>
                  <th>Prioridad</th>
                  <th>Estándar</th>
                  <th>Avance</th>
                  <th>Ítems pendientes</th>
                </tr>
              </thead>
              <tbody>
                {accionesPendientes.map((e) => (
                  <tr key={e.numero}>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: e.prioridad === 'Alta' ? 'var(--rojo-suave)' : 'var(--dorado-suave)',
                          color: e.prioridad === 'Alta' ? 'var(--rojo)' : '#8a6500',
                          border: 'none',
                        }}
                      >
                        {e.prioridad}
                      </span>
                    </td>
                    <td>{e.numero}. {e.titulo}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-track" style={{ flex: 1, height: 8 }}>
                          <div className="progress-fill" style={{ width: `${e.porcentaje}%` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--texto-suave)', whiteSpace: 'nowrap' }}>
                          {e.porcentaje}%
                        </span>
                      </div>
                    </td>
                    <td>{e.itemsTotal - e.itemsCompletados} ítems</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Evidencias documentales */}
        <div className="card mb32" style={{ borderTop: '3px solid var(--dorado)' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: 4, color: 'var(--texto)' }}>
            📎 Evidencias documentales
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--texto-suave)', marginBottom: 16 }}>
            Documentos PDF cargados como soporte de cumplimiento
          </p>
          {evidencias.length === 0 ? (
            <div className="alert alert-dorado" style={{ marginBottom: 0 }}>
              <span className="alert-icon">💡</span>
              <div>
                No hay evidencias cargadas. Ve a cada estándar para subir los documentos de soporte.
              </div>
            </div>
          ) : (
            <table className="resumen-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th className="table-mobile-hide">Estándar</th>
                  <th>Tamaño</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {evidencias.slice(0, 10).map((ev) => {
                  const est = porEstandar.find((e) => e.numero === ev.estandarId);
                  const kb = ev.tamano < 1024 * 1024
                    ? `${(ev.tamano / 1024).toFixed(1)} KB`
                    : `${(ev.tamano / (1024 * 1024)).toFixed(1)} MB`;
                  return (
                    <tr key={ev.id}>
                      <td>📄 {ev.nombre}</td>
                      <td className="table-mobile-hide">{est ? `${est.numero}. ${est.titulo}` : '—'}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>{kb}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>
                        {new Date(ev.createdAt).toLocaleDateString('es-CO')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {evidencias.length > 10 && (
            <p className="hint" style={{ marginTop: 8, textAlign: 'right' }}>
              Mostrando 10 de {evidencias.length} evidencias
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
