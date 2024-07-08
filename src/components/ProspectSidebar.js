import React from 'react';
import { XIcon } from '@heroicons/react/solid';

const ProspectSidebar = ({ prospect, onClose }) => {
  return (
    <div className="fixed inset-y-0 right-0 w-1/3 bg-white shadow-lg overflow-auto z-50">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Detalles del Prospecto</h2>
        <button onClick={onClose}>
          <XIcon className="h-6 w-6 text-gray-500" />
        </button>
      </div>
      <div className="p-4">
        {prospect.logoURL && (
          <div className="mb-4">
            <img src={prospect.logoURL} alt="Logo" className="w-32 h-32 object-cover mx-auto" />
          </div>
        )}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Nombre del Negocio:</h3>
          <p>{prospect.businessName}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Encargado:</h3>
          <p>{prospect.contactPerson}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Agente:</h3>
          <p>{prospect.agent}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Estado:</h3>
          <p>{prospect.state}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">WhatsApp:</h3>
          <p>{prospect.phone}</p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Email:</h3>
          <p>{prospect.email}</p>
        </div>
      </div>
    </div>
  );
};

export default ProspectSidebar;
