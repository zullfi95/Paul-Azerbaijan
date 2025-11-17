"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import './Hero.css';

const Hero: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('hero');
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      id: 1,
      title: t('catering.title'),
      titleBold: "PAUL",
      titleNormal: t('catering.title').replace('PAUL ', ''),
      description: t('catering.description'),
      image: "/images/hero-bread.jpg",
      imageAlt: "Fresh artisan bread",
      buttonText: t('catering.button'),
      buttonLink: "/catering"
    },
    {
      id: 2,
      title: t('bakery.title'),
      titleBold: "PAUL",
      titleNormal: t('bakery.title').replace('PAUL ', ''),
      description: t('bakery.description'),
      image: "/images/cakeHero.jpg",
      imageAlt: "Delicious French pastries",
      buttonText: t('bakery.button'),
      buttonLink: "/cakes"
    },
    {
      id: 3,
      title: t('stores.title'),
      titleBold: "PAUL",
      titleNormal: t('stores.title').replace('PAUL ', ''),
      description: t('stores.description'),
      image: "/images/cakes.jpg",
      imageAlt: "PAUL bakery store interior",
      buttonText: t('stores.button'),
      buttonLink: "/locations"
    }
  ];

  const currentSlideData = slides[currentSlide];

  const handleCateringClick = () => {
    router.push(currentSlideData.buttonLink);
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsAutoPlaying(false);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsAutoPlaying(false);
    
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };


  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsTransitioning(false), 50);
      }, 300);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isTransitioning]);

  return (
    <section 
      className={`hero ${isTransitioning ? 'transitioning' : ''} ${isMobile ? 'hero-mobile' : ''}`}
      role="region" 
      aria-label="Hero slider"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="hero-container">
        <div className="hero-content">
          {/* Image Column */}
          <div className="hero-image-column">
            <div className="hero-image-wrapper">
              <Image
                src={currentSlideData.image || '/images/placeholder-food.svg'}
                alt={currentSlideData.imageAlt}
                fill
                className={`hero-img ${isTransitioning ? 'fade-out' : 'fade-in'}`}
                priority={currentSlide === 0}
                loading={currentSlide === 0 ? "eager" : "lazy"}
              />
              <div className="hero-overlay-label">
                {t('hero.exploreMore')}
              </div>
              
              {/* Navigation Arrows - Mobile */}
              {isMobile && (
                <div className="hero-navigation">
                  <button 
                    className="hero-nav-btn"
                    onClick={handlePrevious}
                    aria-label="Previous slide"
                    disabled={slides.length <= 1 || isTransitioning}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    className="hero-nav-btn"
                    onClick={handleNext}
                    aria-label="Next slide"
                    disabled={slides.length <= 1 || isTransitioning}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Text Column */}
          <div className="hero-text-column">
            <div className="hero-text">
              <h1 className={`hero-title ${isTransitioning ? 'slide-out-left' : 'slide-in-right'}`}>
                <span className="hero-title-bold">{currentSlideData.titleBold}</span>{" "}
                <span className="hero-title-normal">{currentSlideData.titleNormal}</span>
              </h1>
              <p className={`hero-description ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                {currentSlideData.description}
              </p>
              <div className="hero-buttons">
                <button 
                  className={`hero-btn primary ${isTransitioning ? 'scale-out' : 'scale-in'}`}
                  onClick={handleCateringClick}
                  aria-label={`Go to ${currentSlideData.buttonText} page`}
                >
                  {currentSlideData.buttonText}
                </button>
              </div>
            </div>
            
            {/* Navigation Arrows - Desktop */}
            {!isMobile && (
              <div className="hero-navigation">
                <button 
                  className="hero-nav-btn"
                  onClick={handlePrevious}
                  aria-label="Previous slide"
                  disabled={slides.length <= 1 || isTransitioning}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="hero-nav-btn"
                  onClick={handleNext}
                  aria-label="Next slide"
                  disabled={slides.length <= 1 || isTransitioning}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;