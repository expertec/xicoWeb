import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ProductSelectionModal from './ProductSelectionModal';

const CatalogPDFCreator = ({ products, categories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const generatePDF = async (selectedProducts) => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const cardWidth = (pageWidth - 3 * margin) / 2; // Two cards per row with margin
    const cardHeight = 200; // Height of the card
    const padding = 10; // Padding inside the card

    // Set background color
    doc.setFillColor('#E9E9E9');
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    const bannerUrl = 'https://i.imgur.com/G20PmK7.png'; // URL del banner externo
    const banner = await loadImage(bannerUrl);

    const addProduct = async (doc, product, xOffset, yOffset) => {
      // Add card background
      doc.setFillColor('#FFFFFF');
      doc.setDrawColor(0, 0, 0, 0.2); // Light shadow
      doc.roundedRect(xOffset, yOffset, cardWidth, cardHeight, 10, 10, 'FD');

      const imageOffsetX = xOffset + padding;
      const imageOffsetY = yOffset + (cardHeight - 100) / 2; // Center image vertically

      if (product.imageUrl) {
        const image = await loadImage(product.imageUrl);
        if (image) {
          doc.addImage(image, 'JPEG', imageOffsetX, imageOffsetY, 100, 100);
        }
      }

      const textOffsetX = imageOffsetX + 120;
      const textOffsetY = yOffset + 30; // Bajar un poco más los elementos

      // Calculating the total height of the text block
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

        // Estilización del precio especial
        const specialPriceYOffset = currentYOffset + 10;
        doc.setFillColor('#3972B3');
        doc.roundedRect(textOffsetX, specialPriceYOffset, 140, 40, 5, 5, 'F');
        doc.setTextColor('#FFFFFF');
        doc.setFontSize(12);
        doc.text('Precio especial', textOffsetX + 70, specialPriceYOffset + 15, { align: 'center' });
        doc.setFontSize(16);
        doc.text(`$${discountedPrice}`, textOffsetX + 70, specialPriceYOffset + 35, { align: 'center' });
        doc.setTextColor('#000000'); // Reset text color to black
      } else {
        doc.text(`Precio: $${parseFloat(product.price).toFixed(2)}`, textOffsetX, currentYOffset);
      }

      currentYOffset += 60; // Adjust the offset for the next section

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

      return yOffset + cardHeight + margin; // Adjust the offset for the next product
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
        addBannerImage(doc, banner); // Add banner to the first page
      }

      doc.setFontSize(18);
      doc.setTextColor('#333');
      doc.text(category, margin, 160); // Category title

      for (const product of productsByCategory[category]) {
        if (xOffset + cardWidth + margin > pageWidth) { // Check if a new row is needed
          xOffset = margin;
          yOffset += cardHeight + margin;
        }

        if (yOffset + cardHeight + margin > pageHeight) { // A new page if content exceeds page height
          doc.addPage();
          yOffset = margin + 160;
          xOffset = margin;

          // Set background color for new page
          doc.setFillColor('#E9E9E9');
          doc.rect(0, 0, pageWidth, pageHeight, 'F');

          if (banner) {
            addBannerImage(doc, banner); // Add banner to the new page
          }

          doc.setFontSize(18);
          doc.setTextColor('#333');
          doc.text(category, margin, 160); // Category title on new page
        }

        await addProduct(doc, product, xOffset, yOffset);
        xOffset += cardWidth + margin; // Move to the next column
      }

      doc.addPage(); // Add a new page for the next category
    }

    doc.save('catalogo_sugerido.pdf');
  };

  const calculateDiscountedPrice = (price, discounts) => {
    let discountedPrice = parseFloat(price);
    discounts.forEach(discount => {
      discountedPrice -= (discountedPrice * parseFloat(discount.percentage)) / 100;
    });
    return discountedPrice.toFixed(2);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded">
        Crear Catálogo Personalizado
      </button>
      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        categories={categories}
        onGeneratePDF={generatePDF}
      />
      <button onClick={() => generatePDF(products)} className="bg-blue-500 text-white px-4 py-2 rounded">
        Generar Catálogo PDF Completo
      </button>
    </>
  );
};

export default CatalogPDFCreator;
