"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '../hooks/use-mobile';
import './MenuSection.css';

const MenuSection: React.FC = () => {
  const isMobile = useIsMobile();
  const t = useTranslations();
  
  return (
    <section className={`menu-section ${isMobile ? 'menu-section-mobile' : ''}`}>
      <div className="menu-container">
        {/* Описание */}
        <div className="menu-description">
          <p>
            {t('menuSection.description')}
          </p>
        </div>

        {/* Разделитель */}
        <div className="menu-divider"></div>

        {/* Карточки категорий */}
        <div className="menu-categories">
          <Link href="/bread" className="menu-card">
            <div className="menu-card-image">
              <Image
                src="/images/bread.jpg"
                alt="Bread"
                fill
                className="menu-card-img"
              />
              <div className="menu-card-overlay">
                <h3>Bread</h3>
              </div>
            </div>
          </Link>

          <Link href="/platters" className="menu-card">
            <div className="menu-card-image">
              <Image
                src="/images/plattes.png"
                alt="Platters"
                fill
                className="menu-card-img"
              />
              <div className="menu-card-overlay">
                <h3>Platters</h3>
              </div>
            </div>
          </Link>

          <Link href="/cakes" className="menu-card">
            <div className="menu-card-image">
              <Image
                src="/images/cakes.jpg"
                alt="Cakes"
                fill
                className="menu-card-img"
              />
              <div className="menu-card-overlay">
                <h3>Cakes</h3>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Разделитель после карточек */}
        <div className="menu-divider menu-divider-bottom"></div>
      </div>
    </section>
  );
};

export default MenuSection;
