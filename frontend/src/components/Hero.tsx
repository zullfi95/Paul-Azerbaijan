"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './Hero.css';

const Hero: React.FC = () => {
  const router = useRouter();

  const handleCateringClick = () => {
    router.push('/catering');
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          {/* Left Column - Image */}
          <div className="hero-image-column">
            <div className="hero-image-wrapper">
              <Image
                src="/images/hero-bread.jpg"
                alt="Fresh artisan bread"
                fill
                className="hero-img"
                priority
              />
              <div className="hero-overlay-label">
                explore more
              </div>
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="hero-text-column">
            <div className="hero-text">
              <h1 className="hero-title">
                Paul Catering
              </h1>
              <p className="hero-description">
                Discover the delightful world of our bakery, where every bite is a taste of happiness!
              </p>
              <div className="hero-buttons">
                <button 
                  className="hero-btn primary"
                  onClick={handleCateringClick}
                >
                  Catering
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;