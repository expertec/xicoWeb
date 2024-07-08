import React from 'react';
import LogoutButton from './LogoutButton';
import '../index.css';

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <LogoutButton />
      {/* Otros contenidos del dashboard */}
    </div>
  );
};

export default Dashboard;
