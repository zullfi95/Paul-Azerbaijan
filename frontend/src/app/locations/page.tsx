"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedbackButton from '../../components/FeedbackButton';
import FeaturesSection from '../../components/FeaturesSection';
import styles from './LocationsPage.module.css';

export default function LocationsPage() {
  const router = useRouter();

  return (
    <div className={styles.locationsPage}>
      <Header />
      
      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.contentWrapper}>
            <h1 className={styles.mainTitle}>
              Find a PAUL
            </h1>
            
            <p className={styles.subtitle}>
              Search for a nearest PAUL location and enjoy our unique tastes.
            </p>

            {/* Main Map Image */}
            <div className={styles.mapContainer}>
              <div className={styles.mapImage}>
                <img
                  src="/images/findpole-main-map.png"
                  alt="PAUL Locations Map"
                  className={styles.mapImg}
                />
              </div>
            </div>

            {/* Location Cards Grid */}
            <div className={styles.locationsGrid}>
              {/* PAUL Port Baku Mall */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole.png"
                    alt="PAUL Port Baku Mall"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Port Baku Mall
                  </h3>
                  <p className={styles.locationAddress}>
                    Neftchiler avenue 153, Port Baku, BAKU, Azerbaijan
                  </p>
                  <p className={styles.locationPhone}>
                    (012) 464 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL Nizami */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole2.png"
                    alt="PAUL Nizami"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Nizami
                  </h3>
                  <p className={styles.locationAddress}>
                    Nizami Street 123, BAKU, Azerbaijan
                  </p>
                  <p className={styles.locationPhone}>
                    (012) 464 07 71
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL Crescent Mall */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole3.png"
                    alt="PAUL Crescent Mall"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Le Café (Crescent Mall)
                  </h3>
                  <p className={styles.locationAddress}>
                    Crescent Mall, Baku, Azerbaijan
                  </p>
                  <p className={styles.locationPhone}>
                    (012) 464 07 72
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 09:00 - 22:00
                  </p>
                </div>
              </div>

              {/* PAUL Business Center */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole4.png"
                    alt="PAUL Business Center"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Business Center
                  </h3>
                  <p className={styles.locationAddress}>
                    Business Center, Baku, Azerbaijan
                  </p>
                  <p className={styles.locationPhone}>
                    (012) 464 07 73
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Fri. 07:00 - 20:00
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className={styles.descriptionSection}>
              <h2 className={styles.descriptionTitle}>
                PAUL Bakeries and Cake Shops in your Local Area
              </h2>
              <p className={styles.descriptionText}>
                Discover the delightful PAUL locations scattered across Baku! Each day, we proudly offer a wide array of freshly baked treats, ranging from hearty breakfasts to our renowned signature cakes and pies that are sure to satisfy your cravings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
      <Footer />
      
      {/* Feedback Button */}
      <FeedbackButton />
    </div>
  );
}