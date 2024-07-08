import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc, getDoc, getDocs, where } from 'firebase/firestore';
import { PencilIcon, TrashIcon, CheckIcon, DotsVerticalIcon, XIcon } from '@heroicons/react/solid';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const ProspectList = ({ userRole }) => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProspect, setEditingProspect] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    agent: '',
    phone: '',
    email: '',
    state: '',
  });
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [agents, setAgents] = useState({});

  useEffect(() => {
    const fetchAgents = async () => {
      const agentsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'agente')));
      const agentsData = {};
      agentsSnapshot.forEach(doc => {
        agentsData[doc.id] = doc.data();
      });
      setAgents(agentsData);
    };

    const q = query(collection(db, 'prospects'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const prospectsData = await Promise.all(querySnapshot.docs.map(async (prospectDoc) => {
        const prospectData = prospectDoc.data();
        const agentRef = doc(db, 'users', prospectData.agent);
        const agentDoc = await getDoc(agentRef);
        const agentData = agentDoc.exists() ? agentDoc.data() : { nombre: 'N/A', apellido: 'N/A' };
        return {
          id: prospectDoc.id,
          ...prospectData,
          agentData,
        };
      }));
      setProspects(prospectsData);
      setLoading(false);
    });

    fetchAgents();

    return () => unsubscribe();
  }, []);

  const handleEditClick = (prospect) => {
    setEditingProspect(prospect.id);
    setFormData(prospect);
  };

  const handleSaveClick = async (id) => {
    try {
      const prospectRef = doc(db, 'prospects', id);
      await updateDoc(prospectRef, formData);
      setEditingProspect(null);
      setMenuVisible(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleCancelClick = () => {
    setEditingProspect(null);
    setMenuVisible(null);
  };

  const handleDeleteClick = async (id) => {
    try {
      const prospectRef = doc(db, 'prospects', id);
      await deleteDoc(prospectRef);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRowClick = async (prospect) => {
    if (editingProspect) return;

    const prospectDoc = doc(db, 'prospects', prospect.id);
    const docSnapshot = await getDoc(prospectDoc);
    if (docSnapshot.exists()) {
      const prospectData = docSnapshot.data();
      const agentRef = doc(db, 'users', prospectData.agent);
      const agentDoc = await getDoc(agentRef);
      const agentData = agentDoc.exists() ? agentDoc.data() : { nombre: 'N/A', apellido: 'N/A' };
      setSelectedProspect({ id: docSnapshot.id, ...prospectData, agentData });
      setIsOpen(true);
    }
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setSelectedProspect(null);
  };

  const toggleMenu = (id) => {
    setMenuVisible(menuVisible === id ? null : id);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider"></th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Nombre del Negocio</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Encargado</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Agente</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">Estado</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider">WhatsApp</th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left leading-4 text-blue-500 tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {prospects.map(prospect => (
              <tr key={prospect.id} className="hover:bg-gray-100" onClick={() => handleRowClick(prospect)}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {prospect.logoURL ? (
                    <img src={prospect.logoURL} alt="Logo" className="w-10 h-10 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200"></div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {editingProspect === prospect.id ? (
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    prospect.businessName
                  )}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {editingProspect === prospect.id ? (
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    prospect.contactPerson
                  )}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {editingProspect === prospect.id ? (
                    <input
                      type="text"
                      name="agent"
                      value={formData.agent}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    agents[prospect.agent]?.nombre && agents[prospect.agent]?.apellido ? 
                      `${agents[prospect.agent]?.nombre} ${agents[prospect.agent]?.apellido}` : 'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {editingProspect === prospect.id ? (
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border rounded"
                    >
                      <option value="entrante">Entrante</option>
                      <option value="calificado">Prospecto calificado</option>
                      <option value="espera">En espera de visita</option>
                      <option value="perdido">Perdido</option>
                      <option value="ganado">Ganado</option>
                    </select>
                  ) : (
                    prospect.state
                  )}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {editingProspect === prospect.id ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    prospect.phone
                  )}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500 relative">
                  <div
                    className="relative inline-block text-left"
                    onClick={(e) => {
                      e.stopPropagation(); // Previene la activación de handleRowClick
                      toggleMenu(prospect.id);
                    }}
                  >
                    {editingProspect === prospect.id ? (
                      <CheckIcon className="h-6 w-6 text-green-500 cursor-pointer" onClick={() => handleSaveClick(prospect.id)} />
                    ) : (
                      <DotsVerticalIcon className="h-6 w-6 text-gray-500 cursor-pointer" />
                    )}
                    {menuVisible === prospect.id && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="menu-button"
                      >
                        <div className="py-1" role="none">
                          {userRole !== 'auditor' && (
                            <>
                              {editingProspect === prospect.id ? (
                                <button
                                  onClick={() => handleSaveClick(prospect.id)}
                                  className="text-gray-700 block px-4 py-2 text-sm"
                                  role="menuitem"
                                >
                                  <CheckIcon className="h-5 w-5 text-green-500 inline-block" /> Guardar
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEditClick(prospect)}
                                  className="text-gray-700 block px-4 py-2 text-sm"
                                  role="menuitem"
                                >
                                  <PencilIcon className="h-5 w-5 text-blue-500 inline-block" /> Editar
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteClick(prospect.id)}
                                className="text-gray-700 block px-4 py-2 text-sm"
                                role="menuitem"
                              >
                                <TrashIcon className="h-5 w-5 text-red-500 inline-block" /> Borrar
                              </button>
                            </>
                          )}
                          {editingProspect === prospect.id && (
                            <button
                              onClick={handleCancelClick}
                              className="text-gray-700 block px-4 py-2 text-sm"
                              role="menuitem"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeDrawer}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6 flex justify-between items-start">
                        <Dialog.Title className="text-lg font-medium text-gray-900">Información del Cliente</Dialog.Title>
                        <div className="ml-3 h-7 flex items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={closeDrawer}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="space-y-6">
                          {selectedProspect && (
                            <>
                              <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Nombre del Negocio</h3>
                                <p className="mt-1 text-sm text-gray-600">{selectedProspect.businessName}</p>
                              </div>
                              <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Encargado</h3>
                                <p className="mt-1 text-sm text-gray-600">{selectedProspect.contactPerson}</p>
                              </div>
                              <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Agente</h3>
                                <p className="mt-1 text-sm text-gray-600">{selectedProspect.agentData?.nombre} {selectedProspect.agentData?.apellido}</p>
                              </div>
                              <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Estado</h3>
                                <p className="mt-1 text-sm text-gray-600">{selectedProspect.state}</p>
                              </div>
                              <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">WhatsApp</h3>
                                <p className="mt-1 text-sm text-gray-600">{selectedProspect.phone}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default ProspectList;
