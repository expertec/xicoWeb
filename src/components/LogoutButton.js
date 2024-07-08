// src/components/LogoutButton.js
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/login'); // Redirige a la página de login después de cerrar sesión
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
