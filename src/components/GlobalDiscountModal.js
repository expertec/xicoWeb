import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const GlobalDiscountModal = ({ closeModal, categories, products }) => {
  const [excludedCategory, setExcludedCategory] = useState('');
  const [excludedProductQuery, setExcludedProductQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [excludedProducts, setExcludedProducts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (excludedProductQuery) {
      const lowerCaseQuery = excludedProductQuery.toLowerCase();
      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(lowerCaseQuery)
      );
      setSearchResults(filteredProducts);
      setIsDropdownOpen(true);
    } else {
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  }, [excludedProductQuery, products]);

  const handleAddExcludedProduct = (product) => {
    setExcludedProducts([...excludedProducts, product]);
    setExcludedProductQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  const handleRemoveExcludedProduct = (productId) => {
    setExcludedProducts(excludedProducts.filter(product => product.id !== productId));
  };

  const applyGlobalDiscount = async (discount) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      querySnapshot.forEach(async (doc) => {
        const productRef = doc.ref;
        const productData = doc.data();
        if (productData.category !== excludedCategory && !excludedProducts.some(product => product.id === doc.id)) {
          const updatedDiscounts = [...productData.discounts || [], discount];
          await updateDoc(productRef, {
            discounts: updatedDiscounts,
          });
        }
      });
      alert('Descuento global aplicado a todos los productos');
      closeModal();
    } catch (error) {
      console.error('Error aplicando descuento global:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="bg-white p-8 rounded shadow-md z-50 w-full max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-2xl mb-4">Enviar Descuento Global</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const discount = {
            concept: e.target.concept.value,
            percentage: e.target.percentage.value,
          };
          applyGlobalDiscount(discount);
        }}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Concepto</label>
            <input
              type="text"
              name="concept"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Porcentaje (%)</label>
            <input
              type="number"
              name="percentage"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Excluir Categoría</label>
            <select
              value={excludedCategory}
              onChange={(e) => setExcludedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4 relative">
            <label className="block mb-2 text-sm font-medium text-gray-700">Excluir Producto</label>
            <input
              type="text"
              value={excludedProductQuery}
              onChange={(e) => setExcludedProductQuery(e.target.value)}
              placeholder="Buscar producto"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 border border-gray-300 rounded bg-white z-10">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="flex items-center p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleAddExcludedProduct(product)}
                  >
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded mr-2" />
                    <span>{product.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {excludedProducts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700">Productos Excluidos:</h4>
              <ul className="list-disc list-inside">
                {excludedProducts.map(product => (
                  <li key={product.id} className="flex items-center justify-between">
                    <span>{product.name}</span>
                    <button
                      className="text-red-500 ml-2"
                      onClick={() => handleRemoveExcludedProduct(product.id)}
                    >
                      x
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={closeModal} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">Cancelar</button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GlobalDiscountModal;
