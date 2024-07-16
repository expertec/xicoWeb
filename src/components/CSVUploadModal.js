import React, { useState } from 'react';
import Papa from 'papaparse';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const CSVUploadModal = ({ closeModal }) => {
  const [csvFile, setCsvFile] = useState(null);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!csvFile) {
      alert('Por favor selecciona un archivo CSV');
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const products = results.data;
        const collectionRef = collection(db, 'products');

        for (const product of products) {
          try {
            await addDoc(collectionRef, {
              name: product.name,
              description: product.description,
              price: product.price,
              imageUrl: product.imageUrl
            });
          } catch (error) {
            console.error('Error adding document: ', error);
          }
        }

        alert('Productos cargados exitosamente');
        closeModal();
      },
      error: (error) => {
        console.error('Error parsing CSV: ', error);
        alert('Error al parsear el archivo CSV. Por favor revisa el formato del archivo.');
      }
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="bg-white p-8 rounded shadow-md z-50 w-full max-w-lg">
        <h2 className="text-2xl mb-4">Cargar Productos desde CSV</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Archivo CSV</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={closeModal} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">Cancelar</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Cargar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CSVUploadModal;
