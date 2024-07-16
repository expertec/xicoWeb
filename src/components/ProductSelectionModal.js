import React, { useState, useEffect } from 'react';

const ProductSelectionModal = ({ products, categories, isOpen, onClose, onGeneratePDF }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    setFilteredProducts([]);
  }, [products]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.categoryName && product.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.brandName && product.brandName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  const handleProductClick = (product) => {
    if (!selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setFilteredProducts([]);
    setSearchQuery('');
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
  };

  const handleGeneratePDF = () => {
    onGeneratePDF(selectedProducts);
    onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg relative">
        <h2 className="text-2xl mb-4">Seleccionar Productos</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          {searchQuery && filteredProducts.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 flex items-center"
                  onClick={() => handleProductClick(product)}
                >
                  <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover mr-4" />
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <h3 className="text-xl mb-2">Productos Seleccionados</h3>
        <div className="max-h-40 overflow-y-auto mb-4">
          {selectedProducts.map(product => (
            <div key={product.id} className="flex justify-between items-center p-2 border-b border-gray-200">
              <span>{product.name}</span>
              <button
                className="text-red-500"
                onClick={() => handleRemoveProduct(product.id)}
              >
                X
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleGeneratePDF}
          >
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ProductSelectionModal;
