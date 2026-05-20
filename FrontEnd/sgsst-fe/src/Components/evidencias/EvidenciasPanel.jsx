import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

function ImageThumb({ id, onOpen }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('sgsst_token');
    const url = `${api.defaults.baseURL}/evidencias/${id}/descargar`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => setSrc(URL.createObjectURL(blob)))
      .catch(() => setSrc(null));
    return () => { if (src) URL.revokeObjectURL(src); };
  }, [id]);

  if (!src) return <span style={{ fontSize: '1.1rem' }}>🖼</span>;

  return (
    <img
      src={src}
      alt="miniatura"
      onClick={onOpen}
      style={{
        width: 60, height: 60, objectFit: 'cover',
        borderRadius: 4, cursor: 'pointer', flexShrink: 0,
        border: '1px solid var(--borde)',
      }}
    />
  );
}

export default function EvidenciasPanel({ estandarId }) {
  const [evidencias, setEvidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nombre, setNombre] = useState('');
  const fileRef = useRef(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/evidencias', { params: { estandarId } });
      setEvidencias(res.data.data || []);
    } catch {
      setError('No se pudieron cargar las evidencias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [estandarId]);

  const subir = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) return setError('Selecciona un archivo.');
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return setError('Solo se permiten PDF, JPG o PNG.');
    if (file.size > 10 * 1024 * 1024) return setError('El archivo no puede superar 10 MB.');

    setError('');
    setSuccess('');
    setUploading(true);

    const fd = new FormData();
    fd.append('archivo', file);
    fd.append('nombre', nombre || file.name);
    fd.append('estandarId', String(estandarId));

    try {
      await api.post('/evidencias', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Evidencia subida correctamente.');
      setNombre('');
      if (fileRef.current) fileRef.current.value = '';
      await cargar();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir la evidencia.');
    } finally {
      setUploading(false);
    }
  };

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

  const abrirImagen = (id) => {
    const token = localStorage.getItem('sgsst_token');
    const url = `${api.defaults.baseURL}/evidencias/${id}/descargar`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      });
  };

  const esImagen = (mimeType) => mimeType?.startsWith('image/');

  const formatBytes = (b) => {
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="card mb32" style={{ borderTop: '3px solid var(--dorado)' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: 14, color: 'var(--texto)' }}>
        📎 Evidencias documentales
      </h3>

      {error && (
        <div className="alert alert-rojo" style={{ marginBottom: 12, padding: '8px 12px', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-verde" style={{ marginBottom: 12, padding: '8px 12px', fontSize: '0.88rem' }}>
          ✓ {success}
        </div>
      )}

      <form onSubmit={subir} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            className="input"
            placeholder="Nombre de la evidencia (opcional)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              style={{ flex: 1, fontSize: '0.85rem', minWidth: 0 }}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={uploading}
              style={{ whiteSpace: 'nowrap' }}
            >
              {uploading ? 'Subiendo…' : '⬆ Subir PDF'}
            </button>
          </div>
          <p className="hint">PDF, JPG o PNG · máx. 10 MB</p>
        </div>
      </form>

      {loading ? (
        <p className="text-muted" style={{ fontSize: '0.88rem' }}>Cargando evidencias…</p>
      ) : evidencias.length === 0 ? (
        <p className="text-muted" style={{ fontSize: '0.88rem', textAlign: 'center', padding: '12px 0' }}>
          No hay evidencias subidas para este estándar.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {evidencias.map((ev) => (
            <li
              key={ev.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'var(--fondo)',
                borderRadius: 6,
                border: '1px solid var(--borde)',
                flexWrap: 'wrap',
              }}
            >
              {esImagen(ev.mimeType) ? (
                <ImageThumb id={ev.id} onOpen={() => abrirImagen(ev.id)} />
              ) : (
                <span style={{ fontSize: '1.1rem' }}>📄</span>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--texto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.nombre}
                </p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--texto-secundario)' }}>
                  {formatBytes(ev.tamano)} · {new Date(ev.createdAt).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => descargar(ev.id, ev.nombreArchivo)}
                  title="Descargar"
                  style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                >
                  ↓
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => eliminar(ev.id)}
                  title="Eliminar"
                  style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#dc2626' }}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
