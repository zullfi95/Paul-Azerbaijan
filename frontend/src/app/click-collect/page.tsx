"use client";

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturesSection from '@/components/FeaturesSection';
import FeedbackModal from '@/components/FeedbackModal';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ClickCollectPage() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFCF8' }}>
      <Header />
      
      {/* Main Content */}
      <div style={{ paddingTop: isMobile ? '20px' : '30px', paddingBottom: isMobile ? '30px' : '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 20px' : '0 40px' }}>
          
          {/* Title and Description */}
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '30px' }}>
            <h1 style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: '700',
              marginBottom: isMobile ? '8px' : '12px',
              color: '#1A1A1A',
              fontFamily: 'serif',
              letterSpacing: '-0.5px'
            }}>
              Click & Collect
            </h1>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              color: '#000',
              marginBottom: isMobile ? '12px' : '16px',
              fontWeight: '500'
            }}>
              Order Online for Delivery
            </p>
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: '#000',
              lineHeight: '1.6',
              maxWidth: '900px',
              margin: '0 auto',
              fontWeight: '500'
            }}>
              {isMobile ? (
                <>
                  With Click & Collect services, you can place your order on<br />
                  our website and pick it up at the nearest PAUL location. Be<br />
                  sure to place your order in advance.<br />
                  You can find all the PAUL restaurants in Baku<br />
                  on the{' '}
                  <a 
                    href="/locations" 
                    style={{ 
                      color: '#000', 
                      textDecoration: 'underline',
                      fontWeight: '500'
                    }}
                  >
                    Find a PAUL
                  </a>{' '}
                  page.<br />
                  If you have any questions, feel free to{' '}
                  <a 
                    href="/contact" 
                    style={{ 
                      color: '#000', 
                      textDecoration: 'underline',
                      fontWeight: '500'
                    }}
                  >
                    contact us
                  </a>.
                </>
              ) : (
                <>
                  With Click & Collect services, you can place your order on our website and<br />
                  pick it up at the nearest PAUL location. Be sure to place your order in advance.<br />
                  You can find all the PAUL restaurants in Baku on the{' '}
                  <a 
                    href="/locations" 
                    style={{ 
                      color: '#000', 
                      textDecoration: 'underline',
                      fontWeight: '500'
                    }}
                  >
                    &apos;Find a PAUL&apos;
                  </a>{' '}
                  page.<br />
                  If you have any questions, feel free to{' '}
                  <a 
                    href="/contact" 
                    style={{ 
                      color: '#000', 
                      textDecoration: 'underline',
                      fontWeight: '500'
                    }}
                  >
                    contact us
                  </a>.
                </>
              )}
            </p>
          </div>

          {/* Hero Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? '250px' : '500px',
            borderRadius: isMobile ? '6px' : '8px',
            overflow: 'hidden',
            marginBottom: '0'
          }}>
            <Image
              src="/images/Click_and_Collect.png"
              alt="Click & Collect"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>

        </div>
      </div>

      <FeaturesSection />
      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}