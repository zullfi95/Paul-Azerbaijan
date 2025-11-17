"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '../hooks/use-mobile';
import './FeaturesSection.css';

const FeaturesSection: React.FC = () => {
  const isMobile = useIsMobile();
  const t = useTranslations('featuresSection');
  
  const features = [
    {
      id: 1,
      image: "/images/photo1.png",
      title: t('qualityAtHeart.title'),
      description: t('qualityAtHeart.description')
    },
    {
      id: 2,
      image: "/images/photo2.png",
      title: t('passionForBread.title'),
      description: t('passionForBread.description')
    },
    {
      id: 3,
      image: "/images/photo3.png",
      title: t('frenchTradition.title'),
      description: t('frenchTradition.description')
    },
    {
      id: 4,
      image: "/images/photo4.png",
      title: t('familyOwned.title'),
      description: t('familyOwned.description')
    }
  ];

  return (
    <section className={`features-section ${isMobile ? 'features-section-mobile' : ''}`}>
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-image-wrapper">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
