import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { SkeletonCard } from '../Components/ui/Skeleton';

function saludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function badgeEstado(pct) {
  if (pct >= 90) return { label: 'Casi completo', color: '#1a6b45', bg: '#e6f5ee' };
  if (pct >= 60) return { label: 'Avanzado', color: '#2a9060', bg: '#d4f0e4' };
  if (pct > 0) return { label: 'En progreso', color: '#8a6500', bg: '#fdf5e0' };
  return { label: 'Inicio', color: '#888', bg: '#f0f0f0' };
}

function semaforoColor(pct) {
  if (pct >= 80) return 'var(--verde)';
  if (pct >= 40) return 'var(--dorado)';
  return 'var(--rojo)';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dash, setDash] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [empRes, dashRes] = await Promise.all([
          api.get('/empresa/mi').catch(() => null),
          api.get('/dashboard').catch(() => null),
        ]);
        if (empRes) setEmpresa(empRes.data.empresa);
        if (dashRes) setDash(dashRes.data);

        if (empRes) {
          const notRes = await api.get('/reportes/notificaciones').catch(() => null);
          if (notRes) setNotificaciones(notRes.data.pendientes ?? []);
        }
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
          <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const porcentaje = dash?.porcentajeGlobal ?? 0;
  const estado = badgeEstado(porcentaje);
  const enProgreso = dash?.enProgreso ?? 0;
  const sinIniciar = dash?.sinIniciar ?? 7;
  const completados = 7 - enProgreso - sinIniciar;
  const completitud = dash?.completitudSgsst ?? null;

  // Estándar con avance parcial más reciente
  const continuarEstandar = dash?.porEstandar?.find((e) => e.porcentaje > 0 && e.porcentaje < 100) ?? null;

  return (
    <div className="screen active">
      <div className="container">
        {/* Header personalizado */}
        <div style={{ marginBottom: 28 }}>
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            {saludo()}, {user?.nombre?.split(' ')[0] || 'Usuario'} 👋
          </h2>
          {empresa ? (
            <p style={{ color: 'var(--texto-suave)', fontSize: '0.97rem' }}>
              {empresa.nombre} · Riesgo nivel {empresa.nivelRiesgo} · {empresa.trabajadores} trabajadores
            </p>
          ) : (
            <p style={{ color: 'var(--texto-suave)', fontSize: '0.97rem' }}>
              Configura tu empresa para ver tu progreso real.
            </p>
          )}
        </div>

        {!empresa ? (
          <div className="alert alert-dorado mb32">
            <span className="alert-icon">🏢</span>
            <div>
              <strong>Configura tu empresa</strong><br />
              Para ver tu progreso real, primero registra los datos de tu empresa.
              <br /><br />
              <Link to="/onboarding" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Registrar empresa →
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Barra de progreso general prominente */}
            <div className="card mb32" style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: '3rem', fontWeight: 700, color: semaforoColor(porcentaje), fontFamily: 'DM Serif Display, serif', lineHeight: 1 }}>
                    {porcentaje}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--texto-suave)', marginTop: 2 }}>
                    de cumplimiento del SG-SST
                  </div>
                </div>
                <span
                  className="badge"
                  style={{ background: estado.bg, color: estado.color, fontSize: '0.85rem', padding: '6px 16px' }}
                >
                  {estado.label}
                </span>
              </div>
              <div className="progress-track" style={{ height: 16 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${porcentaje}%`, background: `linear-gradient(90deg, var(--verde), var(--verde-claro))` }}
                />
              </div>
            </div>

            {/* Grid de 4 estadísticas */}
            <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 32 }}>
              <div className="dash-stat">
                <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>📋</div>
                <div className="big">7</div>
                <div className="label">Total estándares</div>
              </div>
              <div className="dash-stat">
                <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>✅</div>
                <div className="big" style={{ color: 'var(--verde)' }}>{completados}</div>
                <div className="label">Completados</div>
              </div>
              <div className="dash-stat">
                <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>⏳</div>
                <div className="big" style={{ color: 'var(--dorado)' }}>{enProgreso}</div>
                <div className="label">En progreso</div>
              </div>
              <div className="dash-stat">
                <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>⭕</div>
                <div className="big" style={{ color: '#888' }}>{sinIniciar}</div>
                <div className="label">Sin iniciar</div>
              </div>
            </div>

            {/* Estado de preparación para inspección */}
            {completitud && (
              <div className="card mb32" style={{
                borderLeft: `4px solid ${completitud.listo ? 'var(--verde)' : 'var(--dorado)'}`,
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: completitud.listo ? 'var(--verde)' : 'var(--dorado)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Estado de preparación para inspección
                </div>
                {completitud.listo ? (
                  <div>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✅ <strong>¡Tu SG-SST está completo!</strong></div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--texto-suave)', marginBottom: 12 }}>
                      Has completado todos los estándares y tienes evidencias de respaldo. Puedes descargar tu reporte ejecutivo para presentar ante la ARL.
                    </p>
                    <Link to="/reporte-ejecutivo" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                      Descargar reporte completo →
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.1rem' }}>{completitud.checklistCompletado ? '✅' : '⬜'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                            Checklist: todos los ítems completados
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
                            {completitud.estandaresConChecklist}/{completitud.totalEstandares} estándares al 100%
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.1rem' }}>{completitud.tieneEvidenciasTodas ? '✅' : '⬜'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                            Evidencias: documentos subidos en todos los estándares
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
                            {completitud.estandaresConEvidencia}/{completitud.totalEstandares} estándares con documentos
                          </div>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--texto-suave)', margin: 0 }}>
                      💡 Estás a {completitud.totalEstandares - Math.min(completitud.estandaresConChecklist, completitud.estandaresConEvidencia)} pasos de tener tu SG-SST completo
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Continúa donde quedaste */}
            {continuarEstandar && (
              <div className="card mb32" style={{ borderLeft: '4px solid var(--verde)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--verde)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Continúa donde quedaste
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>
                      {continuarEstandar.numero}. {continuarEstandar.titulo}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div className="progress-track" style={{ flex: 1, height: 8 }}>
                        <div className="progress-fill" style={{ width: `${continuarEstandar.porcentaje}%` }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--verde)', whiteSpace: 'nowrap' }}>
                        {continuarEstandar.porcentaje}%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>
                      {continuarEstandar.total - continuarEstandar.completados} ítems pendientes
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/estandares/${continuarEstandar.id}`)}
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* Grid de progreso por estándar */}
            {dash?.porEstandar?.length > 0 && (
              <div className="card mb32">
                <h3 style={{ fontSize: '1.05rem', marginBottom: 16, color: 'var(--texto)' }}>Avance por estándar</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {dash.porEstandar.map((est) => (
                    <div
                      key={est.id}
                      onClick={() => navigate(`/estandares/${est.id}`)}
                      style={{
                        padding: '14px 16px',
                        border: `1.5px solid ${semaforoColor(est.porcentaje)}33`,
                        borderRadius: 'var(--radio-sm)',
                        cursor: 'pointer',
                        background: est.porcentaje === 100 ? 'var(--verde-suave)' : 'var(--blanco)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--sombra-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: semaforoColor(est.porcentaje),
                          color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {est.numero}
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--texto)', lineHeight: 1.3 }}>
                          {est.titulo}
                        </span>
                      </div>
                      <div className="progress-track" style={{ height: 6, marginBottom: 4 }}>
                        <div className="progress-fill" style={{ width: `${est.porcentaje}%` }} />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--texto-suave)', fontWeight: 600 }}>
                        {est.porcentaje}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pendientes urgentes */}
            {notificaciones.length > 0 && (
              <div className="card mb32">
                <h3 style={{ fontSize: '1.05rem', marginBottom: 16, color: 'var(--texto)' }}>Pendientes urgentes</h3>
                {notificaciones.slice(0, 3).map((n) => {
                  const prioColor = n.prioridad === 'alta' ? 'var(--rojo)' : n.prioridad === 'media' ? 'var(--dorado)' : 'var(--verde)';
                  return (
                    <div
                      key={n.estandarId}
                      onClick={() => navigate(`/estandares/${n.estandarId}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--borde)', cursor: 'pointer' }}
                    >
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: prioColor, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{n.estandarNumero}. {n.estandarTitulo}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>{n.completados}/{n.total} ítems · {n.porcentaje}%</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: prioColor, textTransform: 'uppercase' }}>{n.prioridad}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link to="/estandares" className="btn btn-primary" style={{ textDecoration: 'none' }}>📋 Ver estándares</Link>
          <Link to="/reporte-ejecutivo" className="btn btn-secondary" style={{ textDecoration: 'none' }}>📊 Reportes</Link>
          <Link to="/educacion" className="btn btn-ghost" style={{ textDecoration: 'none' }}>📚 Guía educativa</Link>
        </div>
      </div>

      {/* Botón flotante reporte ejecutivo */}
      <Link
        to="/reporte-ejecutivo"
        style={{
          position: 'fixed', bottom: 28, right: 28,
          background: 'var(--verde)', color: '#fff',
          padding: '12px 22px', borderRadius: '50px',
          textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
          boxShadow: '0 6px 24px rgba(26,107,69,0.35)',
          display: 'flex', alignItems: 'center', gap: 8,
          zIndex: 50,
          transition: 'all 0.2s',
        }}
      >
        📊 Ver reporte ejecutivo →
      </Link>
    </div>
  );
}
