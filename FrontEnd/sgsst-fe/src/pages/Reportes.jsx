import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.porcentaje), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 4px' }}>
      {data.map((d) => (
        <div key={d.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--verde)' }}>{d.porcentaje}%</span>
          <div style={{ width: '100%', height: `${(d.porcentaje / max) * 120}px`, background: 'linear-gradient(180deg, var(--verde-claro), var(--verde))', borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.4s' }} />
          <span style={{ fontSize: '0.65rem', color: 'var(--texto-suave)', textAlign: 'center', lineHeight: 1.2 }}>{d.numero}</span>
        </div>
      ))}
    </div>
  );
}

function DonaChart({ data }) {
  const total = data.reduce((s, d) => s + d.porcentaje, 0);
  const promedio = data.length > 0 ? Math.round(total / data.length) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (promedio / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--borde)" strokeWidth="16" />
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--verde)" strokeWidth="16"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="70" y="70" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="700" fill="var(--verde)">{promedio}%</text>
        <text x="70" y="88" textAnchor="middle" fontSize="10" fill="var(--texto-suave)">Global</text>
      </svg>
    </div>
  );
}

export default function Reportes() {
  const [cumplimiento, setCumplimiento] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('graficas');

  useEffect(() => {
    async function load() {
      try {
        const [cumRes, histRes, notRes] = await Promise.all([
          api.get('/reportes/cumplimiento'),
          api.get('/reportes/historial?limit=20'),
          api.get('/reportes/notificaciones'),
        ]);
        setCumplimiento(cumRes.data.data);
        setHistorial(histRes.data.data?.items ?? histRes.data.registros ?? []);
        setNotificaciones(notRes.data.pendientes);
      } catch {
        // empresa no configurada
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const descargarPDF = () => {
    const lines = [
      'REPORTE SG-SST',
      `Generado: ${new Date().toLocaleDateString('es-CO')}`,
      '',
      'CUMPLIMIENTO POR ESTÁNDAR',
      ...cumplimiento.map((e) => `  ${e.numero}. ${e.titulo}: ${e.porcentaje}% (${e.completados}/${e.total})`),
      '',
      `Promedio global: ${cumplimiento.length > 0 ? Math.round(cumplimiento.reduce((s, e) => s + e.porcentaje, 0) / cumplimiento.length) : 0}%`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-sgsst-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><p className="text-muted">Cargando…</p></div>;

  const PRIORIDAD_COLOR = { alta: 'var(--rojo)', media: 'var(--dorado)', baja: 'var(--verde)' };

  return (
    <div className="screen active">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>Reportes SG-SST</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>Visualiza tu progreso y descarga informes.</p>
          </div>
          <button className="btn btn-dorado btn-sm" onClick={descargarPDF}>⬇️ Descargar reporte</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid var(--borde)', paddingBottom: 0 }}>
          {['graficas', 'historial', 'pendientes'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid var(--verde)' : '2px solid transparent', color: tab === t ? 'var(--verde)' : 'var(--texto-suave)', fontWeight: tab === t ? 700 : 400, cursor: 'pointer', marginBottom: -2, fontSize: '0.9rem', fontFamily: 'inherit' }}>
              {t === 'graficas' ? '📊 Gráficas' : t === 'historial' ? '📋 Historial' : '🔔 Pendientes'}
            </button>
          ))}
        </div>

        {tab === 'graficas' && (
          <>
            {cumplimiento.length === 0 ? (
              <div className="alert alert-dorado">
                <span className="alert-icon">ℹ️</span>
                <div>Aún no tienes datos de cumplimiento. <Link to="/estandares" style={{ color: 'inherit' }}>Comienza marcando ítems en tus estándares →</Link></div>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  <div className="card">
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>Cumplimiento global</h3>
                    <DonaChart data={cumplimiento} />
                  </div>
                  <div className="card">
                    <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>Comparativo por estándar</h3>
                    <BarChart data={cumplimiento} />
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>Detalle por estándar</h3>
                  <table className="resumen-tabla">
                    <thead><tr><th>#</th><th>Estándar</th><th>Completados</th><th>Total</th><th>%</th></tr></thead>
                    <tbody>
                      {cumplimiento.map((e) => (
                        <tr key={e.id}>
                          <td>{e.numero}</td>
                          <td>{e.titulo}</td>
                          <td>{e.completados}</td>
                          <td>{e.total}</td>
                          <td><strong style={{ color: e.porcentaje === 100 ? 'var(--verde)' : e.porcentaje > 0 ? 'var(--dorado)' : 'var(--rojo)' }}>{e.porcentaje}%</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {tab === 'historial' && (
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>Últimas acciones registradas</h3>
            {historial.length === 0 ? (
              <p className="text-muted">No hay acciones registradas aún.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {historial.map((h) => (
                  <div key={h.id} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--borde)' }}>
                    <span style={{ fontSize: '1.2rem' }}>{h.accion === 'completado' ? '✅' : '↩️'}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}><strong>{h.estandarTitulo}</strong></p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', margin: '2px 0 0' }}>{h.descripcion}</p>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--texto-suave)', whiteSpace: 'nowrap' }}>
                      {new Date(h.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'pendientes' && (
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', marginBottom: 16 }}>Pendientes prioritarios</h3>
            {notificaciones.length === 0 ? (
              <div className="alert alert-verde">
                <span className="alert-icon">🎉</span>
                <div><strong>¡Excelente!</strong> No tienes estándares pendientes.</div>
              </div>
            ) : (
              notificaciones.map((n) => (
                <Link key={n.estandarId} to={`/estandares/${n.estandarId}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--borde)', cursor: 'pointer' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: PRIORIDAD_COLOR[n.prioridad], flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: 'var(--texto)' }}>{n.estandarNumero}. {n.estandarTitulo}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--texto-suave)', margin: '2px 0 0' }}>{n.completados}/{n.total} ítems — {n.porcentaje}% completado</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: PRIORIDAD_COLOR[n.prioridad] }}>{n.prioridad}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
