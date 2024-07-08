import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { HomeIcon, UsersIcon, ChartBarIcon, CogIcon, PlusIcon, UserAddIcon } from '@heroicons/react/outline';
import { getAuth } from 'firebase/auth';
import '../index.css';
import ProspectModal from './ProspectModal';
import UserModal from './UserModal'; // Asegúrate de tener este componente creado y exportado

const DashboardLayout = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [menuOpen, setMenuOpen] = useState(false);
  const [prospectModalOpen, setProspectModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  const handleProspectModalToggle = () => {
    setProspectModalOpen(!prospectModalOpen);
  };

  const handleUserModalToggle = () => {
    setUserModalOpen(!userModalOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); // Redirigir al login después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white hidden md:block">
        <div className="p-4 text-2xl font-bold">CRM</div>
        <nav className="mt-4">
          <ul>
            <li className="p-4 hover:bg-gray-700">
              <Link to="/dashboard" className="flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Dashboard
              </Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link to="/prospects" className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Prospectos
              </Link>
            </li>
            <li className="p-4 hover:bg-gray-700">
              <Link to="/funnel" className="flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Embudo
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white text-black shadow w-full fixed top-0 left-0 flex justify-between items-center p-4 z-50">
          <div className="flex items-center">
            <span className="text-xl font-bold">Xico CRM</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded" onClick={handleProspectModalToggle}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Prospecto
            </button>
            <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded" onClick={handleUserModalToggle}>
              <UserAddIcon className="h-5 w-5 mr-2" />
              Nuevo Usuario
            </button>
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={handleMenuToggle}
              >
                <span>{user ? user.email : "Usuario"}</span>
                <CogIcon className="h-6 w-6" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-20">
                  <button
                    className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 bg-gray-100 overflow-y-auto mt-16">
          <Outlet />
        </main>
      </div>
      {prospectModalOpen && <ProspectModal closeModal={handleProspectModalToggle} />}
      {userModalOpen && <UserModal closeModal={handleUserModalToggle} />}
    </div>
  );
};

export default DashboardLayout;
