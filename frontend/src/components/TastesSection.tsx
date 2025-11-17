"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '../hooks/use-mobile';
import './TastesSection.css';

const TastesSection: React.FC = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const t = useTranslations('tastesSection');

  const handleExploreClick = () => {
    router.push('/cakes');
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
                alt={t('seasonalTastes.title')}
                fill
                className="tastes-image"
              />
            </div>
          </div>

          {/* Правая колонка - контент */}
          <div className="tastes-text-column">
            <div className="tastes-text">
              {/* Заголовок */}
              <h2 className="tastes-title">{t('seasonalTastes.title')}</h2>
              
              {/* Описание */}
              <p className="tastes-description">
                {t('seasonalTastes.description')}
              </p>
              
              {/* Кнопка */}
              <button 
                className="tastes-button"
                onClick={handleExploreClick}
              >
                {t('seasonalTastes.button')}
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
              <h2 className="tastes-title">{t('personaliseCake.title')}</h2>
              
              {/* Описание */}
              <p className="tastes-description">
                {t('personaliseCake.description')}
              </p>
              
              {/* Кнопка */}
              <button 
                className="tastes-button"
                onClick={handleExploreClick}
              >
                {t('personaliseCake.button')}
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
