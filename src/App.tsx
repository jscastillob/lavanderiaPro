import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ordenes from './pages/Ordenes';
import Clientes from './pages/Clientes';
import Servicios from './pages/Servicios';
import Reportes from './pages/Reportes';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ordenes" element={<Ordenes />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
