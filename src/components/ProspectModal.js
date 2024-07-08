import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase'; // Asegúrate de importar correctamente storage y db desde firebase.js
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const ProspectModal = ({ closeModal }) => {
  const [businessName, setBusinessName] = useState('');
  const [logo, setLogo] = useState(null);
  const [contactPerson, setContactPerson] = useState('');
  const [agent, setAgent] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState(''); // Estado inicial vacío
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [agents, setAgents] = useState([]); // Estado para almacenar la lista de agentes

  useEffect(() => {
    const fetchAgents = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'agente'));
      const querySnapshot = await getDocs(q);
      const agentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAgents(agentsList);
    };

    fetchAgents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    let logoURL = '';

    if (logo) {
      const logoRef = ref(storage, `logos/${logo.name}`);
      const uploadTask = uploadBytesResumable(logoRef, logo);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error al subir el logo: ', error);
          setIsUploading(false);
        },
        async () => {
          logoURL = await getDownloadURL(uploadTask.snapshot.ref);
          await saveProspect(logoURL);
        }
      );
    } else {
      await saveProspect(logoURL);
    }
  };

  const saveProspect = async (logoURL) => {
    try {
      await addDoc(collection(db, 'prospects'), {
        businessName,
        logoURL,
        contactPerson,
        agent,
        phone,
        email,
        state: state || 'entrante', // Asegura que el estado sea "Entrante" por defecto
      });
      alert('Prospecto creado exitosamente');
      setIsUploading(false);
      closeModal();
    } catch (error) {
      console.error('Error al guardar el prospecto: ', error);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    setLogo(e.target.files[0]);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="bg-white p-8 rounded shadow-md z-50 w-full max-w-lg">
        <h2 className="text-2xl mb-4">Crear Prospecto</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Nombre del negocio</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Persona de contacto</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Agente</label>
            <select
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un agente</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.nombre} {agent.apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Estado</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un estado</option>
              <option value="entrante">Entrante</option>
              <option value="calificado">Prospecto calificado</option>
              <option value="espera">En espera de vista</option>
              <option value="perdido">Perdido</option>
              <option value="ganado">Ganado</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Logo</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isUploading && <progress value={uploadProgress} max="100" className="w-full mt-2" />}
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={closeModal} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">Cancelar</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isUploading}>Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProspectModal;
