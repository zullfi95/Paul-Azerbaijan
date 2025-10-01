"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './ProductCategories.css';

const ProductCategories: React.FC = () => {
  const router = useRouter();

  const categories = [
    {
      id: 'savoury',
      name: 'Savoury',
      description: 'Delicious savory pastries and breads',
      image: '/images/category1.png',
      link: '/bread'
    },
    {
      id: 'sweet',
      name: 'Sweet French pastries',
      description: 'Traditional French sweet treats',
      image: '/images/category2.png',
      link: '/patisserie'
    },
    {
      id: 'pies',
      name: 'Pies and cakes',
      description: 'Artisanal pies and celebration cakes',
      image: '/images/category3.png',
      link: '/cakes'
    },
    {
      id: 'macarons',
      name: 'Macarons',
      description: 'Colorful French macarons',
      image: '/images/category4.png',
      link: '/macarons'
    }
  ];

  const handleCategoryClick = (link: string) => {
    router.push(link);
  };

  return (
    <section className="product-categories">
      <div className="product-categories-container">
        <div className="product-categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="product-category-card"
              onClick={() => handleCategoryClick(category.link)}
            >
              <div className="product-category-image">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={300}
                  height={200}
                  className="product-category-img"
                />
              </div>
              <div className="product-category-content">
                <h3 className="product-category-title">
                  {category.name}
                </h3>
                <p className="product-category-description">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
