import React from 'react';

const ProductDrawer = ({ product, closeDrawer }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-end z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={closeDrawer}></div>
      <div className="bg-white p-8 w-full max-w-md shadow-md z-50 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl">Información del Producto</h2>
          <button onClick={closeDrawer} className="text-red-500">&times;</button>
        </div>
        <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover mb-4 rounded" />
        <h2 className="text-lg font-bold mb-2">{product.name}</h2>
        <p className="text-gray-700 mb-2">{product.description}</p>
        {product.discounts && product.discounts.length > 0 ? (
          <div>
            <p className="text-red-500 font-semibold line-through">${parseFloat(product.price).toFixed(2)}</p>
            <p className="text-green-500 font-semibold">${calculateDiscountedPrice(product.price, product.discounts)}</p>
            <div className="mt-2">
              <h4 className="font-bold">Descuentos:</h4>
              <ul className="list-disc list-inside">
                {product.discounts.map((discount, index) => (
                  <li key={index} className="text-gray-700">
                    {discount.concept}: {discount.percentage}%
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-blue-500 font-semibold">${parseFloat(product.price).toFixed(2)}</p>
        )}
        <div className="mt-4">
          <h3 className="font-bold">Información Nutrimental</h3>
          <div className="flex justify-between items-center mt-4">
            <div className="text-center">
              <div className="bg-[#FFC433] text-white rounded-full w-20 h-20 flex items-center justify-center mb-1 mx-auto">
                <span className="text-lg font-bold">{product.infoNutrimental?.servingsPerContainer || '-'}</span>
              </div>
              <p className="text-sm text-gray-700">PORCIONES POR ENVASE</p>
            </div>
            <div className="text-center">
              <div className="bg-[#FF7D33] text-white rounded-full w-20 h-20 flex items-center justify-center mb-1 mx-auto">
                <span className="text-lg font-bold">{product.infoNutrimental?.caloriesPerServing || '-'}</span>
              </div>
              <p className="text-sm text-gray-700">CALORÍAS (KCAL) POR PORCIÓN</p>
            </div>
            <div className="text-center">
              <div className="bg-[#FFED7B] text-white rounded-full w-20 h-20 flex items-center justify-center mb-1 mx-auto">
                <span className="text-lg font-bold">{product.infoNutrimental?.proteinsPerServing || '-'}</span>
              </div>
              <p className="text-sm text-gray-700">PROTEÍNAS (%) POR PORCIÓN</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">*Una porción equivale a {product.infoNutrimental?.servingSize || '-'} g</p>
        </div>
      </div>
    </div>
  );
};

const calculateDiscountedPrice = (price, discounts) => {
  let discountedPrice = parseFloat(price);
  discounts.forEach(discount => {
    discountedPrice -= (discountedPrice * parseFloat(discount.percentage)) / 100;
  });
  return discountedPrice.toFixed(2);
};

export default ProductDrawer;
