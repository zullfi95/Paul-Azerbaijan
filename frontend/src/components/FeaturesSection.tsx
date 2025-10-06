"use client";

import React from 'react';
import Image from 'next/image';
import { useIsMobile } from '../hooks/use-mobile';
import './FeaturesSection.css';

const FeaturesSection: React.FC = () => {
  const isMobile = useIsMobile();
  
  const features = [
    {
      id: 1,
      image: "/images/photo1.png",
      title: "Quality at Heart",
      description: "Delivering the highest standard in all we do"
    },
    {
      id: 2,
      image: "/images/photo2.png",
      title: "Passion for Bread",
      description: "Freshly baked everyday all year round"
    },
    {
      id: 3,
      image: "/images/photo3.png",
      title: "French Tradition",
      description: "Taste of France at your local bakery"
    },
    {
      id: 4,
      image: "/images/photo4.png",
      title: "Family-Owned Company",
      description: "Established since 1889"
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
