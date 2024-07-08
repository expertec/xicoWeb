import React, { useState } from 'react';
import { storage, db, auth, createUserWithEmailAndPassword, collection, addDoc, signInWithEmailAndPassword } from '../firebase'; // Asegúrate de importar firebase correctamente
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar las funciones necesarias de firebase/storage

const UserModal = ({ closeModal }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [zona, setZona] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [foto, setFoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guardar las credenciales del usuario actual
    const currentUser = auth.currentUser;
    const currentEmail = currentUser.email;
    const currentPassword = prompt("Por favor, ingrese su contraseña para confirmar.");

    if (!currentPassword) {
      alert('Debe ingresar su contraseña para crear un nuevo usuario.');
      return;
    }

    // Crear usuario en Firebase Auth
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Subir foto de perfil a Firebase Storage
      let photoURL = '';
      if (foto) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, foto);
        photoURL = await getDownloadURL(storageRef);
      }

      // Guardar datos del usuario en Firestore
      await addDoc(collection(db, 'users'), {
        nombre,
        apellido,
        telefono,
        zona,
        email,
        role,
        photoURL,
        uid: user.uid,
      });

      // Restaurar sesión del usuario actual
      await signInWithEmailAndPassword(auth, currentEmail, currentPassword);

      // Mostrar alerta
      alert('Usuario creado exitosamente');
      
      // Cerrar modal después de crear el usuario
      closeModal();
    } catch (error) {
      console.error('Error creando usuario:', error);
      alert('Hubo un error creando el usuario. Ver consola para más detalles.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="bg-white p-8 rounded shadow-md z-50 w-full max-w-lg">
        <h2 className="text-2xl mb-4">Crear Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Zona</label>
            <input
              type="text"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccione un rol</option>
              <option value="admin">Admin</option>
              <option value="agente">Agente</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Foto</label>
            <input
              type="file"
              onChange={(e) => setFoto(e.target.files[0])}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={closeModal} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">Cancelar</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
