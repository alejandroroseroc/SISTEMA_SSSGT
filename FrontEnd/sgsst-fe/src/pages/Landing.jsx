import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="screen active">
      <div className="hero">
        <div className="hero-logo">
          Guía <span>SG-SST</span>
        </div>
        <p className="hero-sub">
          Te ayudamos a iniciar el Sistema de Gestión de Seguridad y Salud en el Trabajo, paso a paso.
        </p>
        <div className="hero-btns">
          <Link to="/registro" className="btn btn-dorado" style={{ textDecoration: 'none' }}>
            Registrarme gratis
          </Link>
          <Link
            to="/login"
            className="btn btn-secondary"
            style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.6)', color: '#fff', textDecoration: 'none' }}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>

      <div className="container">
        <div className="info-grid">
          <div className="info-section">
            <h3>📋 ¿Qué es el SG-SST?</h3>
            <p>
              El <strong>Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)</strong> es
              un conjunto de acciones que toda empresa en Colombia debe implementar para proteger la
              salud y seguridad de sus trabajadores.
            </p>
            <p>
              Es obligatorio por ley (Decreto 1072 de 2015 y Resolución 0312 de 2019) y aplica para
              todas las empresas, sin importar su tamaño.
            </p>
          </div>
          <div className="info-section">
            <h3>🏪 ¿Por qué es importante en microempresas?</h3>
            <p>
              En microempresas (hasta 10 trabajadores), el SG-SST tiene requisitos simplificados,{' '}
              <strong>pero igual es obligatorio</strong>. Sin él, puedes recibir multas, suspensiones
              o problemas legales.
            </p>
            <p>
              Además, proteger a tus empleados reduce accidentes, ausencias y mejora el ambiente de
              trabajo. Es una inversión, no un gasto.
            </p>
          </div>
        </div>

        <div className="info-section mt32" id="como-funciona">
          <h3>⚙️ ¿Cómo funciona esta guía?</h3>
          <p className="text-muted text-sm mb16">
            Sigue estos 4 pasos para cumplir con el SG-SST sin complicarte.
          </p>
          <div className="steps">
            <div className="step">
              <div className="ico">🏢</div>
              <h4>1. Registra tu empresa</h4>
              <p>Ingresa tu actividad económica y número de trabajadores.</p>
            </div>
            <div className="step">
              <div className="ico">📊</div>
              <h4>2. Estimamos tu riesgo</h4>
              <p>Te asignamos automáticamente el nivel de riesgo según tu actividad.</p>
            </div>
            <div className="step">
              <div className="ico">✅</div>
              <h4>3. Ve tus estándares</h4>
              <p>Te mostramos solo los estándares que aplican para tu caso.</p>
            </div>
            <div className="step">
              <div className="ico">📈</div>
              <h4>4. Completa y avanza</h4>
              <p>Sigue el checklist guiado y lleva control de tu progreso.</p>
            </div>
          </div>
          <div className="text-center mt24">
            <Link to="/registro" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Comenzar ahora → es gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
