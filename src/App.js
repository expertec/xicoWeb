import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Login from './components/Login';
import ProspectsPage from './components/ProspectsPage';
import FunnelPage from './components/FunnelPage';
import ProductsPage from './components/ProductsPage'; // Asegúrate de importar este componente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<h1>Dashboard</h1>} />
          <Route path="prospects" element={<ProspectsPage />} />
          <Route path="funnel" element={<FunnelPage />} />
          <Route path="products" element={<ProductsPage />} /> {/* Añade esta línea */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
