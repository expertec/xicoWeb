import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const CategoryModal = ({ closeModal }) => {
  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');

  const handleCategoryNameChange = (e) => {
    const name = e.target.value;
    setCategoryName(name);
    const generatedSlug = name.trim().toLowerCase().replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'categories'), {
        name: categoryName,
        slug: slug,
      });
      alert('Categoría creada exitosamente');
      closeModal();
    } catch (error) {
      console.error('Error creando categoría: ', error);
      alert('Hubo un error creando la categoría. Ver consola para más detalles.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="bg-white p-8 rounded shadow-md z-50 w-full max-w-lg">
        <h2 className="text-2xl mb-4">Crear Categoría</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Nombre de la Categoría</label>
            <input
              type="text"
              value={categoryName}
              onChange={handleCategoryNameChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="mt-2 text-sm text-gray-500">Slug: {slug || 'ejemplo-del-slug'}</p>
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

export default CategoryModal;
