import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SkeletonCard } from '../Components/ui/Skeleton';
import EmptyState from '../Components/ui/EmptyState';

const SEMAFORO = (pct) => {
  if (pct === 100) return { color: 'var(--verde)', label: '✅ Completado' };
  if (pct > 0) return { color: 'var(--dorado)', label: '🟡 En progreso' };
  return { color: '#c0392b', label: '🔴 Sin iniciar' };
};

export default function Estandares() {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [estandares, setEstandares] = useState([]);
  const [progresos, setProgresos] = useState({});
  const [loading, setLoading] = useState(true);
  const [noEmpresa, setNoEmpresa] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [empRes, estRes, dashRes] = await Promise.all([
          api.get('/empresa/mi'),
          api.get('/estandares'),
          api.get('/dashboard'),
        ]);
        setEmpresa(empRes.data.empresa);
        setEstandares(estRes.data.estandares);
        const map = {};
        for (const e of dashRes.data.porEstandar) map[e.id] = e.porcentaje;
        setProgresos(map);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 400) {
          setNoEmpresa(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="screen active">
        <div className="container">
          <div className="card-grid">
            {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (noEmpresa) {
    return (
      <div className="screen active">
        <div className="container">
          <EmptyState
            icon="🏢"
            title="Empresa no configurada"
            description="Para ver los estándares SG-SST y tu progreso, primero debes registrar los datos de tu empresa."
            actionLabel="Configurar empresa"
            onAction={() => navigate('/onboarding')}
          />
        </div>
      </div>
    );
  }

  const esAltoRiesgo = empresa && (empresa.nivelRiesgo >= 4 || empresa.trabajadores > 10);

  return (
    <div className="screen active">
      {empresa && (
        <div className="banner">
          <div className="banner-item"><span className="bl">Empresa</span><span className="bv">{empresa.nombre}</span></div>
          <div className="sep-v" />
          <div className="banner-item"><span className="bl">Nivel de riesgo</span><span className="bv">Riesgo {empresa.nivelRiesgo}</span></div>
          <div className="sep-v" />
          <div className="banner-item"><span className="bl">Trabajadores</span><span className="bv">{empresa.trabajadores}</span></div>
          {empresa.ciudad && (
            <>
              <div className="sep-v" />
              <div className="banner-item"><span className="bl">Ciudad</span><span className="bv">{empresa.ciudad}</span></div>
            </>
          )}
        </div>
      )}

      <div className="container">
        {esAltoRiesgo && (
          <div className="alert alert-dorado mb32">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Atención — riesgo elevado</strong><br />
              Tu empresa tiene un nivel de riesgo alto o más de 10 trabajadores. Te recomendamos priorizar el cumplimiento de todos los estándares y considerar asesoría especializada en SG-SST.
            </div>
          </div>
        )}

        <h2 className="section-title">Tus estándares SG-SST</h2>
        <p className="section-sub">Haz clic en cualquier estándar para ver el checklist detallado y marcar tu avance.</p>

        {estandares.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Sin estándares disponibles"
            description="Aún no hay estándares configurados en el sistema. Contacta al administrador."
          />
        ) : (
          <div className="card-grid">
            {estandares.map((est) => {
              const pct = progresos[est.id] ?? 0;
              const sem = SEMAFORO(pct);
              return (
                <Link key={est.id} to={`/estandares/${est.id}`} style={{ textDecoration: 'none' }}>
                  <div className="std-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="std-num">{est.numero}</div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: sem.color }}>{sem.label}</span>
                    </div>
                    <div className="std-title">{est.titulo}</div>
                    <div className="std-desc">{est.descripcion}</div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="std-progress">{pct}% completado</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--texto-suave)' }}>{est.items?.length ?? 0} ítems</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
