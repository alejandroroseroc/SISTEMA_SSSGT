import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ACTIVIDADES = [
  { value: 'oficina', label: 'Oficina / Servicios administrativos' },
  { value: 'comercio', label: 'Comercio / Venta al por menor' },
  { value: 'restaurante', label: 'Restaurante / Alimentos y bebidas' },
  { value: 'peluqueria', label: 'Peluquería / Estética' },
  { value: 'educacion', label: 'Educación / Formación' },
  { value: 'salud', label: 'Salud / Servicios médicos' },
  { value: 'agricultura', label: 'Agricultura / Agropecuario' },
  { value: 'industria', label: 'Industria / Manufactura' },
  { value: 'transporte', label: 'Transporte / Logística' },
  { value: 'construccion', label: 'Construcción / Obra civil' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', actividadEconomica: '', trabajadores: '', ciudad: '' });
  const [conoceRiesgo, setConoceRiesgo] = useState(false);
  const [nivelRiesgoManual, setNivelRiesgoManual] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [empresaId, setEmpresaId] = useState(null);

  // Cargar empresa existente si la hay
  useEffect(() => {
    api.get('/empresa/mi')
      .then((res) => {
        const emp = res.data.empresa;
        setEmpresaId(emp.id);
        setEditing(true);
        setForm({
          nombre: emp.nombre ?? '',
          actividadEconomica: emp.actividadEconomica ?? '',
          trabajadores: emp.trabajadores?.toString() ?? '',
          ciudad: emp.ciudad ?? '',
        });
        setNivelRiesgoManual(emp.nivelRiesgo?.toString() ?? '');
        setConoceRiesgo(true);
      })
      .catch(() => {
        // No tiene empresa todavía, modo creación
      })
      .finally(() => setLoadingEmpresa(false));
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        trabajadores: parseInt(form.trabajadores),
        nivelRiesgoManual: conoceRiesgo && nivelRiesgoManual ? parseInt(nivelRiesgoManual) : undefined,
      };

      if (editing && empresaId) {
        await api.put(`/empresa/${empresaId}`, payload);
      } else {
        await api.post('/empresa', payload);
      }
      navigate('/estandares');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la empresa');
    } finally {
      setLoading(false);
    }
  };

  if (loadingEmpresa) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <p className="text-muted">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="screen active">
      <div className="container-sm">
        <h2 className="section-title">
          {editing ? 'Editar empresa' : 'Cuéntanos sobre tu empresa'}
        </h2>
        <p className="section-sub">
          {editing
            ? 'Actualiza los datos de tu empresa. El nivel de riesgo se recalculará automáticamente.'
            : 'Con esta información calcularemos automáticamente los estándares que aplican a tu negocio.'}
        </p>

        {editing && (
          <div className="alert alert-verde mb16">
            <span className="alert-icon">✏️</span>
            <div>Estás editando los datos de tu empresa. Los cambios se guardarán de inmediato.</div>
          </div>
        )}

        {error && (
          <div className="alert alert-rojo mb16" role="alert" aria-live="assertive">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre de la empresa *</label>
              <input
                id="nombre" name="nombre" type="text"
                placeholder="Ej: Tienda Naturales del Valle"
                value={form.nombre} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="actividadEconomica">Actividad económica *</label>
              <select
                id="actividadEconomica" name="actividadEconomica"
                value={form.actividadEconomica} onChange={handleChange} required
              >
                <option value="">— Selecciona una actividad —</option>
                {ACTIVIDADES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
              <p className="hint">Usaremos esto para estimar tu nivel de riesgo laboral automáticamente.</p>
            </div>

            <div className="form-group">
              <label htmlFor="trabajadores">Número de trabajadores *</label>
              <input
                id="trabajadores" name="trabajadores" type="number" min="1"
                placeholder="Ej: 5"
                value={form.trabajadores} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ciudad">Ciudad (opcional)</label>
              <input
                id="ciudad" name="ciudad" type="text"
                placeholder="Ej: Bogotá"
                value={form.ciudad} onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 400 }}>
                <input
                  type="checkbox"
                  checked={conoceRiesgo}
                  onChange={(e) => setConoceRiesgo(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--verde)' }}
                />
                Ya conozco mi nivel de riesgo laboral
              </label>
            </div>

            {conoceRiesgo && (
              <div className="form-group">
                <label htmlFor="nivelRiesgoManual">Nivel de riesgo (1 = Bajo — 5 = Muy alto)</label>
                <select
                  id="nivelRiesgoManual"
                  value={nivelRiesgoManual}
                  onChange={(e) => setNivelRiesgoManual(e.target.value)}
                >
                  <option value="">— Selecciona —</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>Riesgo {n}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Guardando…' : editing ? 'Guardar cambios →' : 'Ver mis estándares →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
