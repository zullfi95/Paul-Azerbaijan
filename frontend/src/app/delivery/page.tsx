'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import Breadcrumbs from '../../components/Breadcrumbs';
import FeaturesSection from '../../components/FeaturesSection';
import styles from './DeliveryPage.module.css';

export default function DeliveryInfoPage() {
  return (
    <div className={styles.deliveryPage}>
      <Header />

      <div className={styles.navbarSpacing}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsContainer}>
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Delivery Info', isActive: true }
              ]}
            />
          </div>
        </div>

        {/* Page Title */}
        <div className={styles.pageTitleContainer}>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.pageTitle}>
              Delivery Information
            </h1>
          </div>
        </div>

        {/* Main Content Section */}
        <section className={styles.mainContent}>
          <div className={styles.mainContentWrapper}>
            {/* First Text Block */}
            <div className={styles.textBlock}>
              <p className={styles.mainText}>
                At present, we exclusively provide catering delivery for our clients across Baku city. 
                You can choose items from our Catering Menu or click on Plan an Event, and we will 
                assist you in selecting products that fit your budget.
              </p>
            </div>

            {/* Map Section */}
            <div className={styles.mapContainer}>
              <div className={styles.mapWrapper}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3039.4!2d49.8!3d40.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d6bd6211cf9%3A0x343f6b5e7ae56c6b!2sBaku%2C%20Azerbaijan!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="400"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Baku Delivery Map"
                ></iframe>
              </div>
            </div>

            {/* Second Text Block */}
            <div className={styles.textBlock}>
              <p className={styles.mainText}>
                To ensure your order arrives on time, please place it at least two days in advance. 
                Alternatively, feel free to reach out to our team for assistance in scheduling the 
                perfect timing for your event.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection />
      </div>

      <Footer />

      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}
