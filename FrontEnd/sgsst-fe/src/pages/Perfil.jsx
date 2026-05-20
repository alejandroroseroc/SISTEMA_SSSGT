import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Perfil() {
  const { user, loadSession } = useAuth();
  const [form, setForm] = useState({ nombre: user?.nombre || '', email: user?.email || '', password: '', confirmar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password && form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const payload = { nombre: form.nombre, email: form.email };
      if (form.password) payload.password = form.password;

      const { data } = await api.put('/auth/perfil', payload);
      localStorage.setItem('sgsst_user', JSON.stringify(data.user));
      loadSession();
      setSuccess('Perfil actualizado correctamente');
      setForm((f) => ({ ...f, password: '', confirmar: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active">
      <div className="container-sm">
        <h2 className="section-title">Mi perfil</h2>
        <p className="section-sub">Actualiza tu nombre, correo o contraseña.</p>

        {error && (
          <div className="alert alert-rojo mb16">
            <span className="alert-icon">⚠️</span>
            <div>{error}</div>
          </div>
        )}
        {success && (
          <div className="alert alert-verde mb16">
            <span className="alert-icon">✅</span>
            <div>{success}</div>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input id="nombre" name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>

            <hr className="sep" />
            <p className="text-sm text-muted mb16">Deja en blanco si no deseas cambiar la contraseña.</p>

            <div className="form-group">
              <label htmlFor="password">Nueva contraseña</label>
              <input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="confirmar">Confirmar contraseña</label>
              <input id="confirmar" name="confirmar" type="password" placeholder="Repite la contraseña" value={form.confirmar} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
