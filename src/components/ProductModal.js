import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const ProductModal = ({ closeModal }) => {
  const [name, setName] = useState('');
  const [internalId, setInternalId] = useState(''); // Campo Id interno
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // Campos adicionales para la información nutrimental
  const [servingsPerContainer, setServingsPerContainer] = useState('');
  const [caloriesPerServing, setCaloriesPerServing] = useState('');
  const [proteinsPerServing, setProteinsPerServing] = useState('');
  const [servingSize, setServingSize] = useState('');

  // Campos para descuentos
  const [discounts, setDiscounts] = useState([]);
  const [newDiscountConcept, setNewDiscountConcept] = useState('');
  const [newDiscountPercentage, setNewDiscountPercentage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
    };

    const fetchBrands = async () => {
      const querySnapshot = await getDocs(collection(db, 'brands'));
      const brandsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBrands(brandsList);
    };

    fetchCategories();
    fetchBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    let imageUrl = '';

    if (image) {
      const imageRef = ref(storage, `productImages/${image.name}`);
      const uploadTask = uploadBytesResumable(imageRef, image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error al subir la imagen: ', error);
          setIsUploading(false);
        },
        async () => {
          imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await saveProduct(imageUrl);
        }
      );
    } else {
      await saveProduct(imageUrl);
    }
  };

  const saveProduct = async (imageUrl) => {
    try {
      await addDoc(collection(db, 'products'), {
        name,
        internalId,
        price,
        description,
        imageUrl,
        category: selectedCategory,
        brand: selectedBrand,
        infoNutrimental: {
          servingsPerContainer,
          caloriesPerServing,
          proteinsPerServing,
          servingSize,
        },
        discounts,
        NumPedidos: 0, // Agregamos el campo NumPedidos con un valor inicial de 0
      });
      alert('Producto creado exitosamente');
      setIsUploading(false);
      resetForm();
      closeModal();
    } catch (error) {
      console.error('Error al guardar el producto: ', error);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const resetForm = () => {
    setName('');
    setInternalId(''); // Resetear Id interno
    setPrice('');
    setDescription('');
    setImage(null);
    setUploadProgress(0);
    setSelectedCategory('');
    setSelectedBrand('');
    setServingsPerContainer('');
    setCaloriesPerServing('');
    setProteinsPerServing('');
    setServingSize('');
    setDiscounts([]);
    setNewDiscountConcept('');
    setNewDiscountPercentage('');
  };

  const addDiscount = () => {
    if (newDiscountConcept && newDiscountPercentage) {
      setDiscounts([...discounts, { concept: newDiscountConcept, percentage: newDiscountPercentage }]);
      setNewDiscountConcept('');
      setNewDiscountPercentage('');
    }
  };

  const removeDiscount = (index) => {
    const newDiscounts = discounts.slice();
    newDiscounts.splice(index, 1);
    setDiscounts(newDiscounts);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="bg-white p-8 rounded shadow-md z-50 w-full max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-2xl mb-4">Crear Producto</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Id interno</label>
              <input
                type="text"
                value={internalId}
                onChange={(e) => setInternalId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Marca</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona una marca</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Campos adicionales para la información nutrimental */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Porciones por envase</label>
              <input
                type="number"
                value={servingsPerContainer}
                onChange={(e) => setServingsPerContainer(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Calorías por porción (kcal)</label>
              <input
                type="number"
                value={caloriesPerServing}
                onChange={(e) => setCaloriesPerServing(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Proteínas por porción (%)</label>
              <input
                type="number"
                value={proteinsPerServing}
                onChange={(e) => setProteinsPerServing(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Tamaño de la porción (g)</label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          {/* Campos para descuentos */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Descuentos</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Concepto"
                value={newDiscountConcept}
                onChange={(e) => setNewDiscountConcept(e.target.value)}
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Porcentaje (%)"
                value={newDiscountPercentage}
                onChange={(e) => setNewDiscountPercentage(e.target.value)}
                className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={addDiscount}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            >
              Añadir descuento
            </button>
            {discounts.length > 0 && (
              <div className="mt-4">
                {discounts.map((discount, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <p className="text-sm">{discount.concept} - {discount.percentage}%</p>
                      <span
                        onClick={() => removeDiscount(index)}
                        className="text-red-500 cursor-pointer ml-2"
                      >
                        x
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Imagen</label>
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

export default ProductModal;
