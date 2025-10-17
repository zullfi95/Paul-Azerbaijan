"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '../hooks/use-mobile';
import './ArtOfBread.css';

const ArtOfBread: React.FC = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleShopClick = () => {
    router.push('/shop');
  };

  return (
    <section className={`art-of-bread ${isMobile ? 'art-of-bread-mobile' : ''}`}>
      <div className="art-container">
        {/* Верхняя часть - изображение с наложенным текстом */}
          <div className="art-image-wrapper">
            <Image
              src="/images/artofbread.jpg"
              alt="The art of making bread"
              fill
              className="art-image"
              priority
            />
          </div>


        {/* Нижняя часть - заголовок, описание и кнопка */}
        <div className="art-content-section">
          <h2 className="art-title">From sourdough to baguettes</h2>
          <p className="art-description">
            Discover the delightful world of our bakery, where every bite is a taste of happiness! 
            From freshly baked bread to scrumptious pastries, we have something for everyone. 
            Come visit us today and treat yourself to a sweet experience!
          </p>
          <button className="art-button" onClick={handleShopClick}>
            Shop now
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArtOfBread;
