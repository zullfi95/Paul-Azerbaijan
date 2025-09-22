"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';

export default function ClickCollectPage() {
  const router = useRouter();

  const goToCatering = () => {
    router.push('/catering');
  };

  const goToLocations = () => {
    router.push('/locations');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Breadcrumbs */}
      <div style={{ paddingTop: '80px', paddingBottom: '20px', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
            <span 
              onClick={() => router.push('/')}
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              Home
            </span>
            <span>›</span>
            <span style={{ color: '#1A1A1A', fontWeight: '500' }}>Click & Collect</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1A1A1A 0%, #4A4A4A 100%)',
        color: 'white',
        padding: '60px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            fontFamily: 'Playfair Display, serif'
          }}>
            Click & Collect
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}>
            Order online and collect your fresh PAUL products at your nearest location
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={goToCatering}
              style={{
                backgroundColor: '#EBDCC8',
                color: '#1A1A1A',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D4C4A8';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EBDCC8';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Start Ordering
            </button>
            <button
              onClick={goToLocations}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#1A1A1A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Find Locations
            </button>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div style={{ padding: '80px 0', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '60px',
            fontFamily: 'Playfair Display, serif',
            color: '#1A1A1A'
          }}>
            How Click & Collect Works
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '40px' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#EBDCC8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1A1A1A'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Browse & Order
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Browse our menu online and add your favorite PAUL products to your cart
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#EBDCC8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1A1A1A'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Choose Location
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Select your preferred PAUL location for pickup
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#EBDCC8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1A1A1A'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Collect & Enjoy
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Pick up your order at the scheduled time and enjoy fresh PAUL products
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '60px',
            fontFamily: 'Playfair Display, serif',
            color: '#1A1A1A'
          }}>
            Why Choose Click & Collect?
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '40px' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚡</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Fast & Convenient
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Skip the queue and collect your order at your convenience
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛒</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Easy Ordering
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Browse our full menu online and customize your order
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💰</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                No Delivery Fee
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Save on delivery charges by collecting your order
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🍞</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Fresh Products
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Your products are prepared fresh and ready for pickup
              </p>
            </div>
          </div>
        </div>
      </div>

      <FeaturesSection />
      <Footer />
    </div>
  );
}
