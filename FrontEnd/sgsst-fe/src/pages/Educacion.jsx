import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Educacion() {
  const { user } = useAuth();

  return (
    <div className="screen active">
      <div className="container" style={{ maxWidth: 700 }}>
        <h2 className="section-title">Antes de empezar 📚</h2>
        <p className="section-sub">
          {user ? `¡Bienvenido/a, ${user.nombre}!` : '¡Bienvenido/a!'} Tómate 2 minutos para entender qué vas a hacer. ¡Vale la pena!
        </p>

        <div className="alert alert-verde mb24">
          <span className="alert-icon">✅</span>
          <div>
            <strong>Sesión activa</strong>
            <br />
            Tu sesión quedó guardada correctamente. Puedes cerrar esta pestaña y regresar sin
            volver a iniciar sesión.
          </div>
        </div>

        <div className="card mb24">
          <h3 className="fw600 mb8">¿Qué es el SG-SST?</h3>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            El Sistema de Gestión de Seguridad y Salud en el Trabajo es un proceso lógico y por
            etapas que toda empresa debe aplicar para identificar los peligros a los que están
            expuestos sus trabajadores, evaluar los riesgos y tomar medidas para prevenirlos.
            En Colombia es obligatorio para todas las empresas.
          </p>
        </div>

        <div className="card mb24">
          <h3 className="fw600 mb8">¿Qué es el nivel de riesgo?</h3>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Las actividades económicas en Colombia se clasifican del{' '}
            <strong>nivel 1 al 5</strong> según el peligro que representan para los trabajadores:
          </p>
          <div className="mt16" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--verde-suave)', borderRadius: 8, padding: 14 }}>
              <div className="badge badge-verde mb8">Riesgo 1 – 3</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)' }}>
                Actividades con menor peligro físico: oficinas, comercio, peluquerías, restaurantes.
              </p>
            </div>
            <div style={{ background: 'var(--rojo-suave)', borderRadius: 8, padding: 14 }}>
              <div className="badge badge-rojo mb8">Riesgo 4 – 5</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)' }}>
                Actividades con mayor peligro: construcción, minería, transporte pesado, industria química.
              </p>
            </div>
          </div>
          <p className="text-muted mt16" style={{ fontSize: '0.88rem' }}>
            💡 <em>Si no sabes tu nivel de riesgo, no te preocupes. Lo estimaremos con base en tu actividad económica.</em>
          </p>
        </div>

        <div className="card mb24">
          <h3 className="fw600 mb8">¿Qué son los "estándares mínimos"?</h3>
          <p className="text-muted" style={{ fontSize: '0.95rem' }}>
            Son los requisitos concretos que debes cumplir. La Resolución 0312 de 2019 los define según dos factores:
          </p>
          <ul style={{ marginTop: 12, paddingLeft: 20, color: 'var(--texto-suave)', fontSize: '0.92rem' }}>
            <li style={{ marginBottom: 6 }}>
              <strong>Número de trabajadores:</strong> hasta 10, entre 11-50, o más de 50.
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>Nivel de riesgo:</strong> entre más alto el riesgo, más estándares se exigen.
            </li>
          </ul>
        </div>

        <div className="card mb24" style={{ borderColor: 'var(--verde)', borderWidth: 2 }}>
          <h3 className="fw600 mb16" style={{ color: 'var(--verde)' }}>📊 Resumen rápido</h3>
          <table className="resumen-tabla">
            <thead>
              <tr>
                <th>Tipo de empresa</th>
                <th>Trabajadores</th>
                <th>Riesgo</th>
                <th>Estándares</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Microempresa básica</strong></td>
                <td>Hasta 10</td>
                <td>1, 2 ó 3</td>
                <td><span className="badge badge-verde">7 estándares</span></td>
              </tr>
              <tr>
                <td><strong>Microempresa riesgo alto</strong></td>
                <td>Hasta 10</td>
                <td>4 ó 5</td>
                <td><span className="badge badge-dorado">Más estándares</span></td>
              </tr>
              <tr>
                <td><strong>Empresa pequeña</strong></td>
                <td>11 – 50</td>
                <td>Cualquiera</td>
                <td><span className="badge badge-rojo">21 estándares</span></td>
              </tr>
            </tbody>
          </table>
          <p className="text-muted mt16 text-sm">
            ⚠️ Esta guía MVP está optimizada para microempresas con hasta 10 trabajadores y riesgo 1–3.
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/dashboard"
            className="btn btn-primary"
            style={{ fontSize: '1.05rem', padding: '15px 40px', textDecoration: 'none' }}
          >
            Continuar → Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
