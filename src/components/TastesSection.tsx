"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '../hooks/use-mobile';
import './TastesSection.css';

const TastesSection: React.FC = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleExploreClick = () => {
    router.push('/seasonal-tastes');
  };

  return (
    
    <section className={`tastes-section ${isMobile ? 'tastes-section-mobile' : ''}`}>
      <div className="tastes-container">
        {/* Первый раздел */}
        <div className="tastes-content">
          {/* Левая колонка - изображение */}
          <div className="tastes-image-column">
            <div className="tastes-image-wrapper">
              <Image
                src="/images/testes1.jpg"
                alt="Seasonal Tastes 1"
                fill
                className="tastes-image"
              />
            </div>
          </div>

          {/* Правая колонка - контент */}
          <div className="tastes-text-column">
            <div className="tastes-text">
              {/* Заголовок */}
              <h2 className="tastes-title">Seasonal Tastes</h2>
              
              {/* Описание */}
              <p className="tastes-description">
                Discover the delightful world of our bakery, where every bite is a taste of happiness! 
                From freshly baked bread to scrumptious pastries, we have something for everyone. 
                Come visit us today and treat yourself to a sweet experience!
              </p>
              
              {/* Кнопка */}
              <button 
                className="tastes-button"
                onClick={handleExploreClick}
              >
                Explore more
              </button>
            </div>
          </div>
        </div>

        {/* Второй раздел */}
        <div className="tastes-content tastes-content-reverse">
          {/* Левая колонка - контент */}
          <div className="tastes-text-column">
            <div className="tastes-text">
              {/* Заголовок */}
              <h2 className="tastes-title">Artisan Collection</h2>
              
              {/* Описание */}
              <p className="tastes-description">
                Experience our carefully crafted artisan collection, featuring unique flavors and traditional techniques. 
                Each creation tells a story of passion, quality, and the finest ingredients sourced from local producers.
              </p>
              
              {/* Кнопка */}
              <button 
                className="tastes-button"
                onClick={handleExploreClick}
              >
                Discover more
              </button>
            </div>
          </div>

          {/* Правая колонка - изображение */}
          <div className="tastes-image-column">
            <div className="tastes-image-wrapper">
              <Image
                src="/images/tastes2.jpg"
                alt="Artisan Collection"
                fill
                className="tastes-image"
              />
            </div>
          </div>
        </div>
        
        {/* Разделитель после секции */}
        <div className="tastes-section-divider"></div>
      </div>
    </section>
  );
};

export default TastesSection;
