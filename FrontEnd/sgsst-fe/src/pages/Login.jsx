import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sessionExpired = localStorage.getItem('sgsst_session_expired') === '1';
  const [error, setError] = useState(
    sessionExpired ? 'Sesión expirada, inicia sesión nuevamente.' : ''
  );

  // Limpiar flag de sesión expirada al montar
  if (sessionExpired) localStorage.removeItem('sgsst_session_expired');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/educacion');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión. Intenta de nuevo.');
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
        <h2 className="section-title">Iniciar sesión</h2>

        {/* ── Explicación SG-SST ── */}
        <div className="alert alert-verde">
          <span className="alert-icon">🔐</span>
          <div>
            <strong>¿Qué es el SG-SST?</strong>
            <br />
            El <strong>Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)</strong> es el
            conjunto de acciones que toda empresa en Colombia debe llevar a cabo para proteger la
            vida y la salud de sus trabajadores. Está regulado por el Decreto 1072 de 2015 y la
            Resolución 0312 de 2019. Es obligatorio sin importar el tamaño de tu empresa.
          </div>
        </div>

        <div className="card mb24" style={{ background: 'var(--verde-suave)', border: 'none' }}>
          <h4 className="fw600 mb8" style={{ fontSize: '0.95rem' }}>📊 Nivel de riesgo (1 a 5)</h4>
          <p className="text-muted" style={{ fontSize: '0.88rem', marginBottom: 8 }}>
            Las actividades económicas en Colombia se clasifican en <strong>5 niveles de riesgo</strong> según
            el peligro que representan para los trabajadores. Por ejemplo: una oficina es riesgo 1, un
            restaurante es riesgo 2, y la construcción es riesgo 5. Tu nivel de riesgo se determina por
            tu actividad económica registrada ante la ARL.
          </p>
          <p className="text-muted" style={{ fontSize: '0.88rem' }}>
            Los <strong>estándares mínimos</strong> que debes cumplir dependen de dos cosas: tu número
            de trabajadores y tu nivel de riesgo. Una microempresa con riesgo bajo tiene 7 estándares;
            una empresa grande o de riesgo alto puede tener más de 60.
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
              <label htmlFor="login-email">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                placeholder="correo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="btn btn-primary btn-full mt8"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </div>
        </form>

        <p className="text-center mt16 text-sm text-muted">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="link-action">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
