import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, deleteDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const EditProductModal = ({ product, closeModal }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [brand, setBrand] = useState('');
  const [brandName, setBrandName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingBrand, setIsEditingBrand] = useState(false);

  // Campos adicionales para la información nutrimental
  const [servingsPerContainer, setServingsPerContainer] = useState('');
  const [caloriesPerServing, setCaloriesPerServing] = useState('');
  const [proteinsPerServing, setProteinsPerServing] = useState('');
  const [servingSize, setServingSize] = useState('');

  // Descuentos
  const [discounts, setDiscounts] = useState([]);
  const [discountConcept, setDiscountConcept] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setCategory(product.category);
      setBrand(product.brand);
      setImageUrl(product.imageUrl);
      setServingsPerContainer(product.infoNutrimental?.servingsPerContainer || '');
      setCaloriesPerServing(product.infoNutrimental?.caloriesPerServing || '');
      setProteinsPerServing(product.infoNutrimental?.proteinsPerServing || '');
      setServingSize(product.infoNutrimental?.servingSize || '');
      setDiscounts(product.discounts || []);

      // Fetch category and brand names
      const fetchCategoryName = async () => {
        try {
          const categoryDoc = await getDoc(doc(db, 'categories', product.category));
          if (categoryDoc.exists()) {
            setCategoryName(categoryDoc.data().name);
          }
        } catch (error) {
          console.error('Error fetching category:', error);
        }
      };

      const fetchBrandName = async () => {
        try {
          const brandDoc = await getDoc(doc(db, 'brands', product.brand));
          if (brandDoc.exists()) {
            setBrandName(brandDoc.data().name);
          }
        } catch (error) {
          console.error('Error fetching brand:', error);
        }
      };

      fetchCategoryName();
      fetchBrandName();
    }
  }, [product]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchBrands = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'brands'));
        const brandsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBrands(brandsList);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    let updatedImageUrl = imageUrl;

    if (newImage) {
      const imageRef = ref(storage, `productImages/${newImage.name}`);
      const uploadTask = uploadBytesResumable(imageRef, newImage);

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
          updatedImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
          await saveProduct(updatedImageUrl);
        }
      );
    } else {
      await saveProduct(updatedImageUrl);
    }
  };

  const saveProduct = async (imageUrl) => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        name,
        description,
        price,
        category,
        brand,
        imageUrl,
        infoNutrimental: {
          servingsPerContainer,
          caloriesPerServing,
          proteinsPerServing,
          servingSize,
        },
        discounts,
      });
      alert('Producto actualizado exitosamente');
      setIsUploading(false);
      closeModal();
    } catch (error) {
      console.error('Error al actualizar el producto: ', error);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteDoc(doc(db, 'products', product.id));
      alert('Producto eliminado exitosamente');
      closeModal();
    } catch (error) {
      console.error('Error al eliminar el producto: ', error);
    }
  };

  const handleAddDiscount = () => {
    if (discountConcept && discountPercentage) {
      setDiscounts([...discounts, { concept: discountConcept, percentage: discountPercentage }]);
      setDiscountConcept('');
      setDiscountPercentage('');
    }
  };

  const handleRemoveDiscount = (index) => {
    const newDiscounts = discounts.filter((_, i) => i !== index);
    setDiscounts(newDiscounts);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
      <div className="bg-white p-8 rounded shadow-md z-50 w-full max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-2xl mb-4">Editar Producto</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Categoría</label>
              {isEditingCategory ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <p>{categoryName}</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingCategory(true)}
                    className="text-blue-500 underline"
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Marca</label>
              {isEditingBrand ? (
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona una marca</option>
                  {brands.map(br => (
                    <option key={br.id} value={br.id}>
                      {br.name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <p>{brandName}</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingBrand(true)}
                    className="text-blue-500 underline"
                  >
                    Editar
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Imagen del Producto</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isUploading && <progress value={uploadProgress} max="100" className="w-full mt-2" />}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Porciones por Envase</label>
              <input
                type="text"
                value={servingsPerContainer}
                onChange={(e) => setServingsPerContainer(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Calorías por Porción (kcal)</label>
              <input
                type="text"
                value={caloriesPerServing}
                onChange={(e) => setCaloriesPerServing(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Proteínas por Porción (%)</label>
              <input
                type="text"
                value={proteinsPerServing}
                onChange={(e) => setProteinsPerServing(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Tamaño de la Porción (g)</label>
              <input
                type="text"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Descuentos</label>
            <div className="flex items-center">
              <input
                type="text"
                value={discountConcept}
                onChange={(e) => setDiscountConcept(e.target.value)}
                placeholder="Concepto"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
              />
              <input
                type="number"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="%"
                className="w-16 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
              />
              <button type="button" onClick={handleAddDiscount} className="bg-blue-500 text-white px-4 py-2 rounded">Agregar</button>
            </div>
          </div>
          {discounts.length > 0 && (
            <div className="mb-4">
              <ul>
                {discounts.map((discount, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{discount.concept} - {discount.percentage}%</span>
                    <span className="text-red-500 cursor-pointer" onClick={() => handleRemoveDiscount(index)}>x</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-between">
            <button type="button" onClick={handleDeleteProduct} className="bg-red-500 text-white px-4 py-2 rounded">Eliminar</button>
            <div className="flex justify-end">
              <button type="button" onClick={closeModal} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">Cancelar</button>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={isUploading}>Actualizar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
