import React, { useState } from 'react';
import { storage, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const BrandModal = ({ closeModal }) => {
  const [brandName, setBrandName] = useState('');
  const [logo, setLogo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    setLogo(e.target.files[0]);
  };

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
          await saveBrand(logoURL);
        }
      );
    } else {
      await saveBrand(logoURL);
    }
  };

  const saveBrand = async (logoURL) => {
    try {
      await addDoc(collection(db, 'brands'), {
        name: brandName,
        logoURL,
      });
      alert('Marca creada exitosamente');
      setIsUploading(false);
      closeModal();
    } catch (error) {
      console.error('Error creando marca: ', error);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="bg-white p-8 rounded shadow-md z-50 w-full max-w-lg">
        <h2 className="text-2xl mb-4">Crear Marca</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Nombre de la Marca</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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

export default BrandModal;
