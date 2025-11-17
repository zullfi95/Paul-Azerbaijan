"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '../hooks/use-mobile';
import './ArtOfBread.css';

const ArtOfBread: React.FC = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const t = useTranslations('artOfBread');

  const handleShopClick = () => {
    router.push('/bread');
  };

  return (
    <section className={`art-of-bread ${isMobile ? 'art-of-bread-mobile' : ''}`}>
      <div className="art-container">
        {/* Верхняя часть - изображение с наложенным текстом */}
          <div className="art-image-wrapper">
            <Image
              src="/images/artofbread.jpg"
              alt={t('title')}
              fill
              className="art-image"
              priority
            />
          </div>


        {/* Нижняя часть - заголовок, описание и кнопка */}
        <div className="art-content-section">
          <h2 className="art-title">{t('title')}</h2>
          <p className="art-description">
            {t('description')}
          </p>
          <button className="art-button" onClick={handleShopClick}>
            {t('button')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArtOfBread;
