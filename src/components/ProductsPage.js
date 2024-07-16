import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ProductModal from './ProductModal';
import CSVUploadModal from './CSVUploadModal';
import CategoryModal from './CategoryModal';
import BrandModal from './BrandModal';
import EditProductModal from './EditProductModal';
import ProductDrawer from './ProductDrawer';
import GlobalDiscountModal from './GlobalDiscountModal';
import CatalogPDFCreator from './CatalogPDFCreator';
import ProductSelectionModal from './ProductSelectionModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ProductsPage = () => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isGlobalDiscountModalOpen, setIsGlobalDiscountModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isPDFDropdownOpen, setIsPDFDropdownOpen] = useState(false);
  const [isProductSelectionModalOpen, setIsProductSelectionModalOpen] = useState(false);

  const openProductModal = () => setIsProductModalOpen(true);
  const closeProductModal = () => setIsProductModalOpen(false);

  const openCSVModal = () => setIsCSVModalOpen(true);
  const closeCSVModal = () => setIsCSVModalOpen(false);

  const openCategoryModal = () => setIsCategoryModalOpen(true);
  const closeCategoryModal = () => setIsCategoryModalOpen(false);

  const openBrandModal = () => setIsBrandModalOpen(true);
  const closeBrandModal = () => setIsBrandModalOpen(false);

  const openEditProductModal = (product) => {
    setSelectedProduct(product);
    setIsEditProductModalOpen(true);
  };
  const closeEditProductModal = () => {
    setSelectedProduct(null);
    setIsEditProductModalOpen(false);
  };

  const openProductDrawer = (product) => {
    setSelectedProduct(product);
    setIsProductDrawerOpen(true);
  };
  const closeProductDrawer = () => {
    setSelectedProduct(null);
    setIsProductDrawerOpen(false);
  };

  const openGlobalDiscountModal = () => setIsGlobalDiscountModalOpen(true);
  const closeGlobalDiscountModal = () => setIsGlobalDiscountModalOpen(false);

  const handleMoreDropdownClick = () => {
    setIsMoreDropdownOpen(!isMoreDropdownOpen);
  };

  const handlePDFDropdownClick = () => {
    setIsPDFDropdownOpen(!isPDFDropdownOpen);
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('.dropdown')) {
      setIsMoreDropdownOpen(false);
      setIsPDFDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isMoreDropdownOpen || isPDFDropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isMoreDropdownOpen, isPDFDropdownOpen]);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsList);
      setFilteredProducts(productsList);
    });

    const unsubscribeCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesList);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  useEffect(() => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.categoryName && product.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.brandName && product.brandName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const calculateDiscountedPrice = (price, discounts) => {
    let discountedPrice = parseFloat(price);
    discounts.forEach(discount => {
      discountedPrice -= (discountedPrice * parseFloat(discount.percentage)) / 100;
    });
    return discountedPrice.toFixed(2);
  };

  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = url;
    });
  };

  const handleGenerateFullCatalogPDF = async (products) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const cardWidth = (pageWidth - 3 * margin) / 2;
    const cardHeight = 200;
    const padding = 10;

    doc.setFillColor('#E9E9E9');
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    const bannerUrl = 'https://i.imgur.com/G20PmK7.png';
    const banner = await loadImage(bannerUrl);

    const addProduct = async (doc, product, xOffset, yOffset) => {
      doc.setFillColor('#FFFFFF');
      doc.setDrawColor(0, 0, 0, 0.2);
      doc.roundedRect(xOffset, yOffset, cardWidth, cardHeight, 10, 10, 'FD');

      const imageOffsetX = xOffset + padding;
      const imageOffsetY = yOffset + (cardHeight - 100) / 2;

      if (product.imageUrl) {
        const image = await loadImage(product.imageUrl);
        if (image) {
          doc.addImage(image, 'JPEG', imageOffsetX, imageOffsetY, 100, 100);
        }
      }

      const textOffsetX = imageOffsetX + 120;
      const textOffsetY = yOffset + 30;

      const textBlockHeight = 20 + 20 + 10 + (product.discounts && product.discounts.length > 0 ? 50 : 10);
      const adjustedYOffset = textOffsetY + (cardHeight - textBlockHeight - 40) / 2;

      doc.setFontSize(16);
      doc.text(product.name, textOffsetX, adjustedYOffset);
      doc.setFontSize(12);
      doc.text(product.description, textOffsetX, adjustedYOffset + 20, { maxWidth: cardWidth - 130 - padding });

      let currentYOffset = adjustedYOffset + 40;
      doc.setFontSize(10);
      if (product.discounts && product.discounts.length > 0) {
        doc.text(`Precio original: $${parseFloat(product.price).toFixed(2)}`, textOffsetX, currentYOffset, null, null, 'left', { 'text-decoration': 'line-through' });
        const discountedPrice = calculateDiscountedPrice(product.price, product.discounts);

        const specialPriceYOffset = currentYOffset + 10;
        doc.setFillColor('#3972B3');
        doc.roundedRect(textOffsetX, specialPriceYOffset, 140, 40, 5, 5, 'F');
        doc.setTextColor('#FFFFFF');
        doc.setFontSize(12);
        doc.text('Precio especial', textOffsetX + 70, specialPriceYOffset + 15, { align: 'center' });
        doc.setFontSize(16);
        doc.text(`$${discountedPrice}`, textOffsetX + 70, specialPriceYOffset + 35, { align: 'center' });
        doc.setTextColor('#000000');
      } else {
        doc.text(`Precio: $${parseFloat(product.price).toFixed(2)}`, textOffsetX, currentYOffset);
      }

      currentYOffset += 60;

      if (product.nutritionalInfo) {
        doc.setFontSize(12);
        doc.text('Información Nutricional', textOffsetX, currentYOffset);
        currentYOffset += 20;

        const circleYOffset = currentYOffset + 10;
        const circleXOffset = textOffsetX + 20;
        const circleRadius = 30;

        product.nutritionalInfo.forEach((info, index) => {
          doc.setFillColor(info.color || '#FFD700');
          doc.circle(circleXOffset + (index * 100), circleYOffset, circleRadius, 'F');
          doc.setTextColor('#FFFFFF');
          doc.setFontSize(16);
          doc.text(`${info.value}`, circleXOffset + (index * 100), circleYOffset + 5, { align: 'center' });
          doc.setTextColor('#000000');
          doc.setFontSize(10);
          doc.text(`${info.name}`, circleXOffset + (index * 100), circleYOffset + 20, { align: 'center' });
        });

        currentYOffset += 2 * circleRadius + 30;
      }

      return yOffset + cardHeight + margin;
    };

    const addBannerImage = (doc, banner) => {
      const aspectRatio = banner.width / banner.height;
      const bannerHeight = pageWidth / aspectRatio;
      doc.addImage(banner, 'JPEG', 0, 0, pageWidth, bannerHeight);
    };

    const productsByCategory = products.reduce((acc, product) => {
      const category = categories.find(cat => cat.id === product.category)?.name || 'Sin categoría';
      acc[category] = acc[category] || [];
      acc[category].push(product);
      return acc;
    }, {});

    for (const category in productsByCategory) {
      let yOffset = margin + 160;
      let xOffset = margin;
      if (banner) {
        addBannerImage(doc, banner);
      }

      doc.setFontSize(18);
      doc.setTextColor('#333');
      doc.text(category, margin, 160);

      for (const product of productsByCategory[category]) {
        if (xOffset + cardWidth + margin > pageWidth) {
          xOffset = margin;
          yOffset += cardHeight + margin;
        }

        if (yOffset + cardHeight + margin > pageHeight) {
          doc.addPage();
          yOffset = margin + 160;
          xOffset = margin;

          doc.setFillColor('#E9E9E9');
          doc.rect(0, 0, pageWidth, pageHeight, 'F');

          if (banner) {
            addBannerImage(doc, banner);
          }

          doc.setFontSize(18);
          doc.setTextColor('#333');
          doc.text(category, margin, 160);
        }

        await addProduct(doc, product, xOffset, yOffset);
        xOffset += cardWidth + margin;
      }

      doc.addPage();
    }

    doc.save('catalogo_sugerido.pdf');
  };

  const handleGenerateCustomCatalogPDF = async (selectedProducts) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const cardWidth = (pageWidth - 3 * margin) / 2;
    const cardHeight = 200;
    const padding = 10;

    doc.setFillColor('#E9E9E9');
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    const bannerUrl = 'https://i.imgur.com/G20PmK7.png';
    const banner = await loadImage(bannerUrl);

    const addProduct = async (doc, product, xOffset, yOffset) => {
      doc.setFillColor('#FFFFFF');
      doc.setDrawColor(0, 0, 0, 0.2);
      doc.roundedRect(xOffset, yOffset, cardWidth, cardHeight, 10, 10, 'FD');

      const imageOffsetX = xOffset + padding;
      const imageOffsetY = yOffset + (cardHeight - 100) / 2;

      if (product.imageUrl) {
        const image = await loadImage(product.imageUrl);
        if (image) {
          doc.addImage(image, 'JPEG', imageOffsetX, imageOffsetY, 100, 100);
        }
      }

      const textOffsetX = imageOffsetX + 120;
      const textOffsetY = yOffset + 30;

      const textBlockHeight = 20 + 20 + 10 + (product.discounts && product.discounts.length > 0 ? 50 : 10);
      const adjustedYOffset = textOffsetY + (cardHeight - textBlockHeight - 40) / 2;

      doc.setFontSize(16);
      doc.text(product.name, textOffsetX, adjustedYOffset);
      doc.setFontSize(12);
      doc.text(product.description, textOffsetX, adjustedYOffset + 20, { maxWidth: cardWidth - 130 - padding });

      let currentYOffset = adjustedYOffset + 40;
      doc.setFontSize(10);
      if (product.discounts && product.discounts.length > 0) {
        doc.text(`Precio original: $${parseFloat(product.price).toFixed(2)}`, textOffsetX, currentYOffset, null, null, 'left', { 'text-decoration': 'line-through' });
        const discountedPrice = calculateDiscountedPrice(product.price, product.discounts);

        const specialPriceYOffset = currentYOffset + 10;
        doc.setFillColor('#3972B3');
        doc.roundedRect(textOffsetX, specialPriceYOffset, 140, 40, 5, 5, 'F');
        doc.setTextColor('#FFFFFF');
        doc.setFontSize(12);
        doc.text('Precio especial', textOffsetX + 70, specialPriceYOffset + 15, { align: 'center' });
        doc.setFontSize(16);
        doc.text(`$${discountedPrice}`, textOffsetX + 70, specialPriceYOffset + 35, { align: 'center' });
        doc.setTextColor('#000000');
      } else {
        doc.text(`Precio: $${parseFloat(product.price).toFixed(2)}`, textOffsetX, currentYOffset);
      }

      currentYOffset += 60;

      if (product.nutritionalInfo) {
        doc.setFontSize(12);
        doc.text('Información Nutricional', textOffsetX, currentYOffset);
        currentYOffset += 20;

        const circleYOffset = currentYOffset + 10;
        const circleXOffset = textOffsetX + 20;
        const circleRadius = 30;

        product.nutritionalInfo.forEach((info, index) => {
          doc.setFillColor(info.color || '#FFD700');
          doc.circle(circleXOffset + (index * 100), circleYOffset, circleRadius, 'F');
          doc.setTextColor('#FFFFFF');
          doc.setFontSize(16);
          doc.text(`${info.value}`, circleXOffset + (index * 100), circleYOffset + 5, { align: 'center' });
          doc.setTextColor('#000000');
          doc.setFontSize(10);
          doc.text(`${info.name}`, circleXOffset + (index * 100), circleYOffset + 20, { align: 'center' });
        });

        currentYOffset += 2 * circleRadius + 30;
      }

      return yOffset + cardHeight + margin;
    };

    const addBannerImage = (doc, banner) => {
      const aspectRatio = banner.width / banner.height;
      const bannerHeight = pageWidth / aspectRatio;
      doc.addImage(banner, 'JPEG', 0, 0, pageWidth, bannerHeight);
    };

    const productsByCategory = selectedProducts.reduce((acc, product) => {
      const category = categories.find(cat => cat.id === product.category)?.name || 'Sin categoría';
      acc[category] = acc[category] || [];
      acc[category].push(product);
      return acc;
    }, {});

    for (const category in productsByCategory) {
      let yOffset = margin + 160;
      let xOffset = margin;
      if (banner) {
        addBannerImage(doc, banner);
      }

      doc.setFontSize(18);
      doc.setTextColor('#333');
      doc.text(category, margin, 160);

      for (const product of productsByCategory[category]) {
        if (xOffset + cardWidth + margin > pageWidth) {
          xOffset = margin;
          yOffset += cardHeight + margin;
        }

        if (yOffset + cardHeight + margin > pageHeight) {
          doc.addPage();
          yOffset = margin + 160;
          xOffset = margin;

          doc.setFillColor('#E9E9E9');
          doc.rect(0, 0, pageWidth, pageHeight, 'F');

          if (banner) {
            addBannerImage(doc, banner);
          }

          doc.setFontSize(18);
          doc.setTextColor('#333');
          doc.text(category, margin, 160);
        }

        await addProduct(doc, product, xOffset, yOffset);
        xOffset += cardWidth + margin;
      }

      doc.addPage();
    }

    doc.save('catalogo_personalizado.pdf');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Productos</h1>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-full mr-2"
            onClick={handlePDFDropdownClick}
          >
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884l-.716.698a1 1 0 00.014 1.418L10 16.003l8.699-8.002a1 1 0 00.015-1.418l-.716-.698a1 1 0 00-1.418-.014L10 12.586 3.42 5.87a1 1 0 00-1.417.014z" />
            </svg>
          </button>
          {isPDFDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg dropdown z-50">
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => handleGenerateFullCatalogPDF(products)}
              >
                Descargar Catálogo Completo
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsProductSelectionModalOpen(true)}
              >
                Crear Catálogo Personalizado
              </button>
            </div>
          )}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
            onClick={handleMoreDropdownClick}
          >
            +
          </button>
          {isMoreDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg dropdown z-50">
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={openProductModal}
              >
                Crear Producto
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={openCSVModal}
              >
                Cargar CSV
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={openCategoryModal}
              >
                Crear Categoría
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={openBrandModal}
              >
                Crear Marca
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={openGlobalDiscountModal}
              >
                Enviar Descuento Global
              </button>
            </div>
          )}
        </div>
      </div>
      {isProductModalOpen && <ProductModal closeModal={closeProductModal} />}
      {isCSVModalOpen && <CSVUploadModal closeModal={closeCSVModal} />}
      {isCategoryModalOpen && <CategoryModal closeModal={closeCategoryModal} />}
      {isBrandModalOpen && <BrandModal closeModal={closeBrandModal} />}
      {isEditProductModalOpen && <EditProductModal product={selectedProduct} closeModal={closeEditProductModal} />}
      {isProductDrawerOpen && <ProductDrawer product={selectedProduct} closeDrawer={closeProductDrawer} />}
      {isGlobalDiscountModalOpen && <GlobalDiscountModal closeModal={closeGlobalDiscountModal} categories={categories} products={products} />}
      {isProductSelectionModalOpen && <ProductSelectionModal 
        products={products}
        categories={categories}
        isOpen={isProductSelectionModalOpen}
        onClose={() => setIsProductSelectionModalOpen(false)}
        onGeneratePDF={handleGenerateCustomCatalogPDF}
      />}
      <CatalogPDFCreator products={filteredProducts} categories={categories} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const discountedPrice = product.discounts ? calculateDiscountedPrice(product.price, product.discounts) : product.price;
          return (
            <div
              key={product.id}
              className="bg-white p-4 rounded shadow-md cursor-pointer relative"
              onClick={() => openProductDrawer(product)}
            >
              <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover mb-4 rounded" />
              <h2 className="text-lg font-bold mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-2">{product.description}</p>
              {product.discounts && product.discounts.length > 0 ? (
                <div>
                  <p className="text-red-500 font-semibold line-through">${parseFloat(product.price).toFixed(2)}</p>
                  <p className="text-green-500 font-semibold">${discountedPrice}</p>
                </div>
              ) : (
                <p className="text-blue-500 font-semibold">${parseFloat(product.price).toFixed(2)}</p>
              )}
              <button
                className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditProductModal(product);
                }}
              >
                <svg className="h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 010 2.828L7.414 15.414a2 2 0 01-.828.47l-4 1a1 1 0 01-1.213-1.212l1-4a2 2 0 01.47-.828l10-10a2 2 0 012.828 0zM14.828 4L16 5.172 6.828 14.344 5.656 13.172 14.828 4zM4 14v2h2l10-10-2-2L4 14z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsPage;
