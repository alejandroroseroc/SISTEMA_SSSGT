import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { SkeletonTable } from '../Components/ui/Skeleton';

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MisEvidencias() {
  const [evidencias, setEvidencias] = useState([]);
  const [estandares, setEstandares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstandar, setFiltroEstandar] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [evRes, estRes] = await Promise.all([
          api.get('/evidencias'),
          api.get('/estandares'),
        ]);
        setEvidencias(evRes.data.data || []);
        setEstandares(estRes.data.estandares || []);
      } catch {
        setError('No se pudieron cargar las evidencias.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta evidencia?')) return;
    try {
      await api.delete(`/evidencias/${id}`);
      setEvidencias((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError('No se pudo eliminar la evidencia.');
    }
  };

  const descargar = (id, nombreArchivo) => {
    const token = localStorage.getItem('sgsst_token');
    const url = `${api.defaults.baseURL}/evidencias/${id}/descargar`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = nombreArchivo;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  };

  const estMap = {};
  for (const e of estandares) estMap[e.id] = `${e.numero}. ${e.titulo}`;

  const filtradas = filtroEstandar
    ? evidencias.filter((e) => String(e.estandarId) === filtroEstandar)
    : evidencias;

  return (
    <div className="screen active">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>Mis evidencias documentales</h2>
            <p className="section-sub">Todos los documentos de respaldo subidos al sistema</p>
          </div>
          <Link to="/estandares" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            + Subir desde un estándar
          </Link>
        </div>

        {error && <div className="alert alert-rojo mb32">{error}</div>}

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--texto-suave)' }}>
            {filtradas.length} documento{filtradas.length !== 1 ? 's' : ''}
          </span>
          <select
            className="input"
            style={{ fontSize: '0.88rem', padding: '6px 10px', maxWidth: 280 }}
            value={filtroEstandar}
            onChange={(e) => setFiltroEstandar(e.target.value)}
          >
            <option value="">Todos los estándares</option>
            {estandares.map((e) => (
              <option key={e.id} value={String(e.id)}>{e.numero}. {e.titulo}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <SkeletonTable />
        ) : filtradas.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>
              {filtroEstandar ? 'No hay evidencias para este estándar' : 'No has subido ninguna evidencia aún'}
            </p>
            <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: 20 }}>
              Ve a cada estándar y sube los documentos de respaldo correspondientes.
            </p>
            <Link to="/estandares" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              Ir a estándares
            </Link>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="resumen-tabla">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th className="table-mobile-hide">Estándar</th>
                  <th className="table-mobile-hide">Tamaño</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.1rem' }}>
                          {ev.mimeType?.startsWith('image/') ? '🖼' : '📄'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{ev.nombre}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--texto-suave)' }}>{ev.nombreArchivo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-mobile-hide" style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>
                      {ev.estandarId ? estMap[ev.estandarId] ?? `Estándar ${ev.estandarId}` : '—'}
                    </td>
                    <td className="table-mobile-hide" style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>
                      {formatBytes(ev.tamano)}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--texto-suave)' }}>
                      {new Date(ev.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => descargar(ev.id, ev.nombreArchivo)}
                          title="Descargar"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          ↓
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => eliminar(ev.id)}
                          title="Eliminar"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', color: '#dc2626' }}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
