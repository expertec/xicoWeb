import React, { useState, useEffect, Fragment } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Dialog, Transition } from '@headlessui/react';
import { FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';

const FunnelPage = () => {
  const [prospects, setProspects] = useState({
    entrante: [],
    calificado: [],
    espera: [],
    perdido: [],
    ganado: []
  });
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWhatsappDrawerOpen, setIsWhatsappDrawerOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const q = collection(db, 'prospects');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = {
        entrante: [],
        calificado: [],
        espera: [],
        perdido: [],
        ganado: []
      };

      querySnapshot.forEach((doc) => {
        const prospect = { id: doc.id, ...doc.data() };
        if (data[prospect.state]) {
          data[prospect.state].push(prospect);
        }
      });

      setProspects(data);
    });

    return () => unsubscribe();
  }, []);

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColumn = Array.from(prospects[source.droppableId]);
    const destColumn = Array.from(prospects[destination.droppableId]);

    const [movedProspect] = sourceColumn.splice(source.index, 1);
    movedProspect.state = destination.droppableId;
    destColumn.splice(destination.index, 0, movedProspect);

    const updatedProspects = {
      ...prospects,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn
    };

    setProspects(updatedProspects);

    const prospectRef = doc(db, 'prospects', movedProspect.id);
    await updateDoc(prospectRef, { state: movedProspect.state });
  };

  const openDrawer = (prospect) => {
    setSelectedProspect(prospect);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const openWhatsappDrawer = (prospect) => {
    setSelectedProspect(prospect);
    setIsWhatsappDrawerOpen(true);
  };

  const closeWhatsappDrawer = () => {
    setIsWhatsappDrawerOpen(false);
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      alert('Por favor ingrese un mensaje');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/send-whatsapp', {
        message,
        to: selectedProspect.phone
      });
      if (response.data.success) {
        alert('Mensaje enviado con éxito');
        setMessage('');
        closeWhatsappDrawer();
      } else {
        alert('Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje');
    }
  };

  const renderColumn = (title, items) => (
    <Droppable droppableId={title} key={title}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="bg-gray-100 p-4 rounded-lg shadow-md w-64 min-h-[500px]"
        >
          <h2 className="text-xl font-bold mb-4">{title.charAt(0).toUpperCase() + title.slice(1)}</h2>
          {items.map((prospect, index) => (
            <Draggable key={prospect.id} draggableId={prospect.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="bg-white p-4 mb-4 rounded-lg shadow-sm cursor-pointer"
                  onClick={() => openDrawer(prospect)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{prospect.businessName}</p>
                      <p className="text-sm text-gray-500">{prospect.contactPerson}</p>
                    </div>
                    <FaWhatsapp
                      className="text-green-500 cursor-pointer"
                      size={24}
                      onClick={(e) => {
                        e.stopPropagation();
                        openWhatsappDrawer(prospect);
                      }}
                    />
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Embudo</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {Object.keys(prospects).map((state) => renderColumn(state, prospects[state]))}
        </div>
      </DragDropContext>

      <Transition.Root show={isDrawerOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={closeDrawer}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
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
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">Información del Cliente</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={closeDrawer}
                          >
                            <span className="sr-only">Close panel</span>
                            <svg
                              className="h-6 w-6"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {selectedProspect && (
                        <div>
                          <p>
                            <strong>Nombre del Negocio:</strong> {selectedProspect.businessName}
                          </p>
                          <p>
                            <strong>Persona de Contacto:</strong> {selectedProspect.contactPerson}
                          </p>
                          <p>
                            <strong>Teléfono:</strong> {selectedProspect.phone}
                          </p>
                          <p>
                            <strong>Email:</strong> {selectedProspect.email}
                          </p>
                          <p>
                            <strong>Estado:</strong> {selectedProspect.state}
                          </p>
                          {/* Agrega más campos según sea necesario */}
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      <Transition.Root show={isWhatsappDrawerOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 overflow-hidden z-50" onClose={closeWhatsappDrawer}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
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
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">Contactar via WhatsApp</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={closeWhatsappDrawer}
                          >
                            <span className="sr-only">Close panel</span>
                            <svg
                              className="h-6 w-6"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {selectedProspect && (
                        <div>
                          <p>
                            <strong>Nombre del Negocio:</strong> {selectedProspect.businessName}
                          </p>
                          <p>
                            <strong>Persona de Contacto:</strong> {selectedProspect.contactPerson}
                          </p>
                          <p>
                            <strong>Teléfono:</strong> {selectedProspect.phone}
                          </p>
                          <div>
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Escribe tu mensaje"
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                            <button
                              onClick={sendMessage}
                              className="mt-2 bg-green-500 text-white py-2 px-4 rounded-md"
                            >
                              Enviar Mensaje
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default FunnelPage;
