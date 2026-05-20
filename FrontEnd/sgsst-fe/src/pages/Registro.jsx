import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(nombre, email, password);
      navigate('/educacion');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen active">
      <div className="container-sm">
        <Link to="/" className="btn btn-ghost btn-sm mb16" style={{ textDecoration: 'none' }}>
          ← Volver
        </Link>
        <h2 className="section-title">Crear cuenta</h2>

        {/* ── Explicación SG-SST ── */}
        <div className="alert alert-verde">
          <span className="alert-icon">💡</span>
          <div>
            <strong>¿Qué es el SG-SST y por qué importa?</strong>
            <br />
            El <strong>Sistema de Gestión de Seguridad y Salud en el Trabajo</strong> es un proceso
            obligatorio en Colombia (Decreto 1072 de 2015) que toda empresa debe implementar para
            identificar peligros, evaluar riesgos y proteger a sus trabajadores. Sin él, puedes
            recibir multas, suspensiones o problemas legales.
          </div>
        </div>

        <div className="card mb24" style={{ background: 'var(--verde-suave)', border: 'none' }}>
          <h4 className="fw600 mb8" style={{ fontSize: '0.95rem' }}>📊 ¿Qué es el nivel de riesgo?</h4>
          <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: 8 }}>
            Cada actividad económica tiene un <strong>nivel de riesgo del 1 al 5</strong>. El nivel 1
            corresponde a oficinas y servicios administrativos (menor peligro), mientras que el nivel 5
            corresponde a actividades como minería o manejo de explosivos (mayor peligro). Tu nivel de
            riesgo se asigna según tu actividad económica registrada ante la ARL.
          </p>
          <p className="text-muted" style={{ fontSize: '0.88rem' }}>
            Los <strong>estándares mínimos</strong> de la Resolución 0312 de 2019 definen los
            requisitos que debes cumplir. Estos dependen de <strong>dos factores:</strong> tu número de
            trabajadores y tu nivel de riesgo. Microempresas con riesgo bajo tienen requisitos
            simplificados (7 estándares), pero empresas más grandes o de riesgo alto deben cumplir
            muchos más.
          </p>
        </div>

        <div className="card mb24" style={{ background: 'var(--dorado-suave)', border: 'none' }}>
          <h4 className="fw600 mb8" style={{ fontSize: '0.95rem', color: '#7a5800' }}>✅ ¿Qué haremos juntos?</h4>
          <p style={{ fontSize: '0.88rem', color: '#7a5800' }}>
            Según tu actividad económica, nivel de riesgo y número de trabajadores, te mostraremos los
            estándares mínimos que debes cumplir y una guía con checklist para implementarlos paso a paso.
          </p>
        </div>

        {error && (
          <div className="alert alert-rojo">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="form-group">
              <label htmlFor="reg-nombre">Nombre completo</label>
              <input
                id="reg-nombre"
                type="text"
                placeholder="Ej: María García"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Correo electrónico</label>
              <input
                id="reg-email"
                type="email"
                placeholder="correo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="hint">Usa letras y números para mayor seguridad.</p>
            </div>
            <div className="form-group">
              <label htmlFor="reg-confirm">Confirmar contraseña</label>
              <input
                id="reg-confirm"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="btn btn-primary btn-full mt8"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </div>
        </form>

        <p className="text-center mt16 text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="link-action">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
