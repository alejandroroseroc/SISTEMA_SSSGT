import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import EvidenciasPanel from '../components/evidencias/EvidenciasPanel';

function EvidenciasIndicator({ estandarId }) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    api.get(`/evidencias/estandar/${estandarId}`)
      .then((r) => setCount(r.data.data?.length ?? 0))
      .catch(() => setCount(0));
  }, [estandarId]);
  if (count === null) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>Documentos de evidencia:</span>
      <span style={{
        fontSize: '0.82rem', fontWeight: 700,
        color: count > 0 ? 'var(--dorado)' : 'var(--texto-suave)',
      }}>
        {count > 0 ? `📁 ${count} subidos` : 'Ninguno aún'}
      </span>
    </div>
  );
}

export default function EstandarDetalle() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/progreso/${id}`)
      .then((r) => setData(r.data))
      .catch((err) => {
        if (!err.response) {
          setError('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
        } else {
          setError('No se pudo cargar el estándar. Intenta de nuevo.');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleItem = async (itemId, currentValue) => {
    const updatedItems = data.items.map((it) =>
      it.id === itemId ? { ...it, completado: !currentValue } : it
    );
    const newData = { ...data, items: updatedItems };
    const completados = updatedItems.filter((i) => i.completado).length;
    newData.completados = completados;
    newData.porcentaje = updatedItems.length > 0 ? Math.round((completados / updatedItems.length) * 100) : 0;
    setData(newData);
    setSaved(false);

    setSaving(true);
    try {
      const result = await api.put(`/progreso/${id}`, {
        items: updatedItems.map((it) => ({ itemId: it.id, completado: it.completado })),
      });
      setData(result.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Error al guardar, intenta de nuevo');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><p className="text-muted">Cargando…</p></div>;
  if (error) return <div className="container"><div className="alert alert-rojo">{error}</div></div>;

  const { estandar, items, completados, total, porcentaje } = data;

  // Collect all evidencias from pending items
  const evidenciasPendientes = [...new Set(
    items.filter((i) => !i.completado).flatMap((i) => i.evidencias)
  )];

  return (
    <div className="screen active">
      <div className="container">
        <Link to="/estandares" className="btn btn-ghost btn-sm" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ← Volver a estándares
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div className="std-num">{estandar.numero}</div>
          <h2 className="section-title" style={{ margin: 0 }}>{estandar.titulo}</h2>
        </div>
        <p className="section-sub">{estandar.descripcion}</p>

        <div className="card mb32">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="fw600">Progreso</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {saving && <span className="text-sm text-muted">Guardando…</span>}
              {saved && <span className="text-sm" style={{ color: 'var(--verde)' }}>✓ Guardado</span>}
              <span style={{ fontSize: '1.1rem', color: 'var(--verde)', fontWeight: 700 }}>{porcentaje}%</span>
            </div>
          </div>
          <div
            className="progress-track"
            style={{ height: 14 }}
            role="progressbar"
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progreso del estándar: ${porcentaje}%`}
          >
            <div className="progress-fill" style={{ width: `${porcentaje}%` }} />
          </div>
          <p className="hint mt8">{completados} de {total} ítems completados</p>
          <EvidenciasIndicator estandarId={parseInt(id)} />
        </div>

        <div className="card mb32">
          <h3 style={{ fontSize: '1.05rem', marginBottom: 16, color: 'var(--texto)' }}>Lista de verificación</h3>
          {items.map((item) => (
            <div key={item.id} className="checklist-item">
              <input
                type="checkbox"
                id={`item-${item.id}`}
                checked={item.completado}
                onChange={() => toggleItem(item.id, item.completado)}
              />
              <label htmlFor={`item-${item.id}`}>{item.texto}</label>
            </div>
          ))}
        </div>

        {evidenciasPendientes.length > 0 && (
          <div className="evidencia-box mb32">
            <h4>📎 Evidencia sugerida para los ítems pendientes</h4>
            <ul>
              {evidenciasPendientes.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
          </div>
        )}

        <EvidenciasPanel estandarId={parseInt(id)} />

        {porcentaje === 100 && (
          <div className="alert alert-verde">
            <span className="alert-icon">🎉</span>
            <div><strong>¡Estándar completado!</strong> Has cumplido todos los ítems de este estándar.</div>
          </div>
        )}
      </div>
    </div>
  );
}
