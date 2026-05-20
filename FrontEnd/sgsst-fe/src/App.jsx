import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LayoutAuth from './Components/layout/LayoutAuth';
import LandingPage from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Educacion from './pages/Educacion';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Estandares from './pages/Estandares';
import EstandarDetalle from './pages/EstandarDetalle';
import Reportes from './pages/Reportes';
import Perfil from './pages/Perfil';
import ReporteEjecutivo from './pages/ReporteEjecutivo';
import MiProgreso from './pages/MiProgreso';
import MisEvidencias from './pages/MisEvidencias';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Protected */}
        <Route element={<LayoutAuth />}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/educacion" element={<Educacion />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/estandares" element={<Estandares />} />
          <Route path="/estandares/:id" element={<EstandarDetalle />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/reporte-ejecutivo" element={<ReporteEjecutivo />} />
          <Route path="/mi-progreso" element={<MiProgreso />} />
          <Route path="/mis-evidencias" element={<MisEvidencias />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
