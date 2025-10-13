'use client';

import React from 'react';
import Image from 'next/image';
import SimpleHeader from '../../components/SimpleHeader';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import './OurStoryPage.css';

export default function OurStoryPage() {
  return (
    <div className="our-story-page">
      <SimpleHeader />
      
      <main className="our-story-main">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="main-title">Our Story</h1>
          <p className="hero-subtitle">
            PAUL is a family company built upon a foundation of time-honored production methods<br />
            passed down for five generations.
          </p>
          <div className="hero-divider"></div>
          <div className="hero-divider-secondary"></div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          {/* 1889 - Horizontal Layout (Year left, Text right) */}
          <div className="timeline-item timeline-1889">
            <div className="timeline-left-block">
              <div className="timeline-year">1889</div>
              <div className="timeline-divider"></div>
            </div>
            <div className="timeline-text">
              <p>
                It all starts in 1889 when Charlemagne Mayot takes over a small bakery in Croix, near Lille in the North of France. His son Edmond Mayot takes over the family business in 1908. Suzanne Mayot, Edmond&apos;s daughter, marries Julien Holder. They move into a bakery on Rue des Sarrazins in Lille.
              </p>
            </div>
          </div>


          {/* 1908 - Big Image Left + Text Right */}
          <div className="timeline-item timeline-1908">
            <div className="timeline-content">
              <div className="timeline-image-block">
                <Image
                  src="/images/1908.png"
                  alt="1908 - Family business continues"
                  width={671}
                  height={447}
                  className="story-image large"
                />
              </div>
              <div className="timeline-text-block">
                <div className="timeline-year">1908</div>
                <div className="timeline-divider"></div>
                <p>
                  His son Edmond-Charlemagne Mayot, born in 1889, took over the family business in 1908 with his wife Victorine. They had a daughter, Suzanne.
                </p>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* 1950s - Text Left + Image Right */}
          <div className="timeline-item timeline-1950s">
            <div className="timeline-content">
              <div className="timeline-text-block">
                <div className="timeline-year">1950s</div>
                <div className="timeline-divider"></div>
                <p>
                  We launch our first cake range in the early 1950s using our own family recipes. More than 60 years later we&apos;re still making wonderful French cakes that taste every bit as good as they look and are hand crafted using only the finest ingredients….
                </p>
              </div>
              <div className="timeline-image-block">
                <Image
                  src="/images/1950.jpg"
                  alt="1950s - First cake range"
                  width={606}
                  height={370}
                  className="story-image medium"
                />
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* 1953 - Vertical Image Left + Text Right */}
          <div className="timeline-item timeline-1953">
            <div className="timeline-content">
              <div className="timeline-image-block">
                <Image
                  src="/images/1953.png"
                  alt="1953 - Francis Holder joins"
                  width={494}
                  height={594}
                  className="story-image vertical"
                />
              </div>
              <div className="timeline-text-block">
                <div className="timeline-year">1953</div>
                <div className="timeline-divider"></div>
                <p>
                  Francis Holder begins working with his parents, who have taken over a well-established local bakery owned by the PAUL family. The PAUL name is retained. Following the death of Julien Holder in 1958, Francis Holder takes over the family bakery, and a second bakery is opened in 1963.
                </p>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* 1972 - Centered Wide Image */}
          <div className="timeline-item timeline-1972">
            <div className="timeline-year">1972</div>
            <div className="timeline-divider"></div>
            <div className="timeline-text">
              <p>
                Francis Holder refurbishes the family bakery in Lille, installing a wood-fired oven and bakery that operates in full view of customers. To Francis this is simple common sense, but it is innovative at the time to see bread being made in the traditional fashion – kneading, shaping, proving and baking.
              </p>
            </div>
            <div className="timeline-image-block">
              <Image
                src="/images/1972.jpg"
                alt="1972 - Bakery refurbishment"
                width={1093}
                height={370}
                className="story-image extra-wide"
              />
            </div>
          </div>

          <div className="section-divider"></div>

          {/* 1985 - Text Left + Big Image Right */}
          <div className="timeline-item timeline-1985">
            <div className="timeline-content">
              <div className="timeline-text-block">
                <div className="timeline-year">1985</div>
                <div className="timeline-divider"></div>
                <p>
                  PAUL opens its first bakery outside France in Barcelona, heralding the start of the company&apos;s international expansion. Two years later, some PAUL bakeries start to incorporate a café or restaurant area.
                </p>
              </div>
              <div className="timeline-image-block">
                <Image
                  src="/images/1985.png"
                  alt="1985 - International expansion"
                  width={680}
                  height={459}
                  className="story-image large"
                />
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* 1993 & 2000 - Double Column with Vertical Divider */}
          <div className="timeline-item timeline-1993">
            <div className="timeline-content">
              <div className="timeline-column">
                <div className="timeline-year">1993</div>
                <div className="timeline-divider"></div>
                <div className="timeline-text">
                  <p>
                    Francis Holder decided to re-energise PAUL and added two new components to the business; the now famous black shop fronts and the development of a rustic line of specialty breads using sustainably produced winter wheat.
                  </p>
                </div>
                <div className="timeline-image-block">
                  <Image
                    src="/images/1993.png"
                    alt="1993 - Black shop fronts"
                    width={454}
                    height={530}
                    className="story-image square"
                  />
                </div>
              </div>
              
              <div className="timeline-vertical-divider"></div>
              
              <div className="timeline-column">
                <div className="timeline-year">2000</div>
                <div className="timeline-divider"></div>
                <div className="timeline-text">
                  <p>
                    PAUL opens its first bakery and restaurant in London, Covent Garden- an instant hit! Encouraged by Londoners&apos; enthusiastic response, PAUL opens further branches in London and beyond, now with 37 UK locations including our PAUL Express branches in St. Pancras and Tottenham Court Road, and two branches of Le Restaurant de PAUL!
                  </p>
                </div>
                <div className="timeline-image-block">
                  <Image
                    src="/images/2000.png"
                    alt="2000 - London expansion"
                    width={530}
                    height={530}
                    className="story-image square"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* 2007 & 2019 - Two Column Grid Layout */}
          <div className="timeline-item timeline-2007-2019">
            {/* Left Column - 2007 */}
            <div className="timeline-2007-column">
              <div className="timeline-year">2007</div>
              <div className="timeline-divider"></div>
              <div className="timeline-text">
                <p>
                  Francis Holder passes the torch to his children, naming Maxime as CEO of PAUL International. With the 5th generation of bread enthusiasts driving our vision, we expand globally while remaining dedicated to our social responsibilities.
                </p>
              </div>
              <div className="timeline-image-block">
                <Image
                  src="/images/2007.png"
                  alt="2007 - New generation"
                  width={365}
                  height={494}
                  className="story-image small-vertical"
                />
              </div>
            </div>

            {/* Right Column - 2019 */}
            <div className="timeline-2019-column">
              <div className="timeline-year">2019</div>
              <div className="timeline-divider"></div>
              <div className="timeline-text">
                <p>
                  PAUL celebrates 130 years of complicity with its customers. Maxime Holder, who for 10 years had devoted himself to international development, takes over as Chairman of Groupe PAUL.
                </p>
              </div>

              <div className="timeline-image-block">
                <div className="timeline-images-row">

                  <Image
                    src="/images/2019.png"
                    alt="2019 - 130 years celebration"
                    width={403}
                    height={369}
                    className="story-image small"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider"></div>

          {/* Today - Centered with Wide Image */}
          <div className="timeline-item timeline-today">
            <div className="timeline-year today">Today</div>
            <div className="timeline-text">
              <p>
                Every year, we create around a hundred new products and introduce fresh ideas like PAUL le café and PAUL express. We also improve accessibility with options like click & collect and online shopping. By working closely with farmers and millers, we aim to build a responsible French wheat sector, showing our dedication to nutrition and the environment. As we grow into new areas, our goal stays the same: to bring joy and connection through our tasty, wholesome, and high-quality offerings.
              </p>
            </div>
            <div className="timeline-image-block">
              <Image
                src="/images/today.png"
                alt="Today - Modern PAUL"
                width={1088}
                height={419}
                className="story-image extra-wide"
              />
            </div>
          </div>

          {/* CTA Button */}
          <div className="cta-section">
            <button className="cta-button">
              DISCOVER PAUL AZERBAIJAN
            </button>
          </div>
        </section>

        {/* Values Section */}
        <section className="values-section">
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">
                <Image
                  src="/images/photo1.png"
                  alt="Quality at Heart"
                  width={80}
                  height={45}
                  className="value-image"
                />
              </div>
              <h3 className="value-title">Quality at Heart</h3>
              <p className="value-description">
                Delivering the highest standard in all we do
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <Image
                  src="/images/photo2.png"
                  alt="Passion for Bread"
                  width={80}
                  height={45}
                  className="value-image"
                />
              </div>
              <h3 className="value-title">Passion for Bread</h3>
              <p className="value-description">
                Freshly baked everyday all year round
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <Image
                  src="/images/photo3.png"
                  alt="French Tradition"
                  width={80}
                  height={45}
                  className="value-image"
                />
              </div>
              <h3 className="value-title">French Tradition</h3>
              <p className="value-description">
                Taste of France at your local bakery
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">
                <Image
                  src="/images/photo4.png"
                  alt="Family-Owned Company"
                  width={80}
                  height={45}
                  className="value-image"
                />
              </div>
              <h3 className="value-title">Family-Owned Company</h3>
              <p className="value-description">
                Established since 1889
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}