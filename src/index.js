import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './components/DashboardPage';
import ProspectList from './components/ProspectList';
import Funnel from './components/Funnel';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProductsPage from './components/ProductsPage'; // Asegúrate de que esta línea esté agregada

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/prospects" element={<ProspectList />} />
            <Route path="/funnel" element={<Funnel />} />
            <Route path="/products" element={<ProductsPage />} /> {/* Agregar esta línea */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
