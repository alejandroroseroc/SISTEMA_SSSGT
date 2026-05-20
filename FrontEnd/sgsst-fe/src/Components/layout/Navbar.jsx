import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/estandares', label: 'Estándares' },
  { to: '/mis-evidencias', label: 'Evidencias' },
  { to: '/mi-progreso', label: 'Mi progreso' },
  { to: '/reporte-ejecutivo', label: 'Reportes' },
  { to: '/educacion', label: 'Guía' },
];

const navLinkStyle = (isActive) => ({
  color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
  textDecoration: 'none',
  padding: '6px 14px',
  borderRadius: 20,
  background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
  fontSize: '0.88rem',
  fontWeight: 500,
  transition: 'all 0.2s',
  display: 'block',
});

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="topnav" style={{ position: 'relative' }}>
      <div className="logo" aria-label="Guía SG-SST">
        Guía <span>SG-SST</span>
      </div>

      {/* Desktop nav */}
      <nav className="topnav-desktop" aria-label="Navegación principal">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            {label}
          </NavLink>
        ))}
        <NavLink
          to="/perfil"
          style={({ isActive }) => navLinkStyle(isActive)}
          title={user?.nombre}
          aria-label="Mi perfil"
        >
          <span aria-hidden="true">👤</span>
        </NavLink>
        <button onClick={handleLogout} aria-label="Cerrar sesión">Salir</button>
      </nav>

      {/* Hamburger button (mobile) */}
      <button
        className="topnav-hamburger"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        data-cy="hamburger"
      >
        <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          className="topnav-mobile"
          aria-label="Menú móvil"
        >
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...navLinkStyle(isActive),
                padding: '12px 20px',
                borderRadius: 0,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              })}
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/perfil"
            style={({ isActive }) => ({
              ...navLinkStyle(isActive),
              padding: '12px 20px',
              borderRadius: 0,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            })}
          >
            <span aria-hidden="true">👤</span> Mi perfil
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.82)', padding: '12px 20px',
              fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
            }}
          >
            Salir
          </button>
        </nav>
      )}
    </div>
  );
}
