import { useState, useEffect } from 'react';
import api from '../services/api';
import BarChart from '../Components/charts/BarChart';
import { SkeletonCard } from '../Components/ui/Skeleton';
import EmptyState from '../Components/ui/EmptyState';

function formatFecha(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildActividadPorDia(items) {
  const now = new Date();
  const days = 14;
  const counts = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    counts[key] = 0;
  }
  for (const h of items) {
    if (h.accion === 'completado') {
      const key = new Date(h.createdAt).toISOString().slice(0, 10);
      if (key in counts) counts[key]++;
    }
  }
  return Object.entries(counts).map(([fecha, total], i) => ({
    id: i,
    numero: i + 1,
    titulo: new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
    porcentaje: total,
  }));
}

function calcularEstadisticas(items) {
  if (items.length === 0) return null;

  const fechas = items.map((h) => new Date(h.createdAt));
  const primera = new Date(Math.min(...fechas));
  const hoy = new Date();
  const diasActivo = Math.max(1, Math.round((hoy - primera) / (1000 * 60 * 60 * 24)));

  // Semana con más actividad
  const porSemana = {};
  for (const h of items) {
    if (h.accion !== 'completado') continue;
    const d = new Date(h.createdAt);
    const semana = `${d.getFullYear()}-S${Math.ceil(d.getDate() / 7)}`;
    porSemana[semana] = (porSemana[semana] || 0) + 1;
  }
  const semanaMasActiva = Object.entries(porSemana).sort((a, b) => b[1] - a[1])[0];

  // Estándar con más avance
  const porEstandar = {};
  for (const h of items) {
    if (h.accion !== 'completado') continue;
    const titulo = h.estandarTitulo || `Estándar ${h.estandarId}`;
    porEstandar[titulo] = (porEstandar[titulo] || 0) + 1;
  }
  const estandarTop = Object.entries(porEstandar).sort((a, b) => b[1] - a[1])[0];

  return { diasActivo, semanaMasActiva, estandarTop, primerRegistro: primera };
}

export default function MiProgreso() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/reportes/historial?limit=100');
        const items = res.data.data?.items ?? res.data.registros ?? [];
        setHistorial(items);
      } catch {
        // sin datos
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="screen active">
        <div className="container">
          <div className="dash-grid">
            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div className="screen active">
        <div className="container">
          <h2 className="section-title">Mi progreso en el SG-SST</h2>
          <EmptyState
            icon="🕐"
            title="Sin actividad registrada"
            description="Aún no has marcado ningún ítem de los estándares SG-SST. Comienza completando los ítems en la sección de Estándares."
          />
        </div>
      </div>
    );
  }

  const stats = calcularEstadisticas(historial);
  const actividadData = buildActividadPorDia(historial);
  const ultimos20 = historial.slice(0, 20);

  return (
    <div className="screen active">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h2 className="section-title" style={{ marginBottom: 4 }}>Mi progreso en el SG-SST</h2>
          {stats && (
            <p style={{ color: 'var(--texto-suave)', fontSize: '0.95rem' }}>
              Inicio del proceso: {stats.primerRegistro.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Estadísticas de actividad */}
        {stats && (
          <div className="dash-grid" style={{ marginBottom: 32 }}>
            <div className="dash-stat">
              <div className="big" style={{ fontSize: '2rem' }}>{stats.diasActivo}</div>
              <div className="label">Días activo</div>
            </div>
            <div className="dash-stat">
              <div className="big" style={{ fontSize: '2rem' }}>{stats.semanaMasActiva?.[1] ?? 0}</div>
              <div className="label">Máx. acciones en 1 semana</div>
            </div>
            <div className="dash-stat">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--verde)', marginBottom: 6, lineHeight: 1.3 }}>
                {stats.estandarTop?.[0] ?? '—'}
              </div>
              <div className="label">Estándar con más avance</div>
            </div>
          </div>
        )}

        {/* Gráfica de actividad por día */}
        <div className="card mb32">
          <BarChart
            data={actividadData}
            title="Actividad diaria (últimos 14 días)"
            height={200}
          />
        </div>

        {/* Línea de tiempo */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 24, color: 'var(--texto)' }}>
            Historial de actividad
          </h3>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {/* Línea vertical */}
            <div style={{
              position: 'absolute', left: 9, top: 0, bottom: 0,
              width: 2, background: 'var(--borde)',
            }} />

            {ultimos20.map((h, i) => {
              const esCompletado = h.accion === 'completado';
              return (
                <div
                  key={h.id}
                  style={{
                    position: 'relative',
                    paddingBottom: i < ultimos20.length - 1 ? 24 : 0,
                    animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                  }}
                >
                  {/* Punto en la línea */}
                  <div style={{
                    position: 'absolute', left: -19, top: 4,
                    width: 12, height: 12, borderRadius: '50%',
                    background: esCompletado ? 'var(--verde)' : '#ccc',
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 2px ' + (esCompletado ? 'var(--verde-medio)' : '#ddd'),
                  }} />

                  {/* Contenido */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', margin: 0, fontWeight: 500 }}>
                        {h.descripcion}
                      </p>
                      {h.estandarTitulo && (
                        <span
                          className="badge badge-verde"
                          style={{ marginTop: 4, display: 'inline-block' }}
                        >
                          {h.estandarTitulo}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--texto-suave)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {formatFecha(h.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {historial.length > 20 && (
            <p style={{ textAlign: 'center', color: 'var(--texto-suave)', fontSize: '0.85rem', marginTop: 24 }}>
              Mostrando los últimos 20 de {historial.length} eventos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
