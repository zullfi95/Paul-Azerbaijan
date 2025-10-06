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
                <div className={styles.mapPlaceholder}>
                  <div className={styles.mapIcon}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <h3 className={styles.mapTitle}>PAUL Locations Map</h3>
                  <p className={styles.mapDescription}>
                    Interactive map showing all PAUL locations in Azerbaijan
                  </p>
                  <p className={styles.mapNote}>
                    Google Maps integration coming soon
                  </p>
                </div>
              </div>
            </div>

            {/* Location Cards Grid */}
            <div className={styles.locationsGrid}>
              {/* PAUL Port Baku */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole.png"
                    alt="PAUL Port Baku"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Port Baku
                  </h3>
                  <p className={styles.locationAddress}>
                    Neftchilar Avenue, 123
                  </p>
                  <p className={styles.locationPhone}>
                    050 464 07 70<br />
                    055 464 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL Cinema Plus */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole2.png"
                    alt="PAUL Cinema Plus"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Cinema Plus
                  </h3>
                  <p className={styles.locationAddress}>
                    Mammad Amin Razulzadeh Street, 8-10
                  </p>
                  <p className={styles.locationPhone}>
                    050 899 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL Caspian Plaza */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole3.png"
                    alt="PAUL Caspian Plaza"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Caspian Plaza
                  </h3>
                  <p className={styles.locationAddress}>
                    Jafar Jabbarli Street, 44
                  </p>
                  <p className={styles.locationPhone}>
                    050 890 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL Demirchi Tower */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole4.png"
                    alt="PAUL Demirchi Tower"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Demirchi Tower
                  </h3>
                  <p className={styles.locationAddress}>
                    Khojali Avenue, 37
                  </p>
                  <p className={styles.locationPhone}>
                    051 225 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL Chinar Plaza */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole.png"
                    alt="PAUL Chinar Plaza"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Chinar Plaza
                  </h3>
                  <p className={styles.locationAddress}>
                    Heydar Aliyev Avenue, 106A
                  </p>
                  <p className={styles.locationPhone}>
                    051 335 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL 28 Mall */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole2.png"
                    alt="PAUL 28 Mall"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL 28 Mall
                  </h3>
                  <p className={styles.locationAddress}>
                    Azadliq Avenue, 15a/4
                  </p>
                  <p className={styles.locationPhone}>
                    050 772 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL BEGOC */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole3.png"
                    alt="PAUL BEGOC"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL BEGOC
                  </h3>
                  <p className={styles.locationAddress}>
                    Zarifa Aliyeva Street, 93
                  </p>
                  <p className={styles.locationPhone}>
                    051 206 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL Ministry of Economy */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole4.png"
                    alt="PAUL Ministry of Economy"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Ministry of Economy
                  </h3>
                  <p className={styles.locationAddress}>
                    Heydar Aliyev Avenue, 155
                  </p>
                  <p className={styles.locationPhone}>
                    050 698 07 70
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
                    src="/images/findpole.png"
                    alt="PAUL Crescent Mall"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL Crescent Mall
                  </h3>
                  <p className={styles.locationAddress}>
                    Neftchilar avenue 66, 68 (Aypara Palace and Town)
                  </p>
                  <p className={styles.locationPhone}>
                    010 324 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
                  </p>
                </div>
              </div>

              {/* PAUL ADA */}
              <div className={styles.locationCard}>
                <div className={styles.locationImage}>
                  <img
                    src="/images/findpole2.png"
                    alt="PAUL ADA"
                    className={styles.locationImg}
                  />
                </div>
                <div className={styles.locationInfo}>
                  <h3 className={styles.locationName}>
                    PAUL ADA
                  </h3>
                  <p className={styles.locationAddress}>
                    Ahmadbey Aghaoghlu str. 61
                  </p>
                  <p className={styles.locationPhone}>
                    010 321 07 70
                  </p>
                  <p className={styles.locationHours}>
                    Mon-Sun. 08:00 - 23:00
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