"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedbackButton from '../../components/FeedbackButton';
import FeaturesSection from '../../components/FeaturesSection';
import './locations.css';

export default function LocationsPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      
      <div className="navbar-spacing" style={{ paddingTop: '0px' }}>
        {/* Breadcrumbs */}
        <div style={{
          padding: '1rem 0',
          backgroundColor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div className="container-paul">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <span 
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => router.push('/')}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Home
              </span>
              <span>/</span>
              <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Find a PAUL</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          padding: '2rem 0',
          backgroundColor: '#f9fafb',
          minHeight: 'calc(100vh - 200px)'
        }}>
          <div className="container-paul">
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '600',
                color: '#1A1A1A',
                marginBottom: '1rem'
              }}>
                Find a PAUL
              </h1>
              
              <p style={{
                fontSize: '1.125rem',
                color: '#6b7280',
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem auto',
                lineHeight: '1.6'
              }}>
                Search for a nearest PAUL location and enjoy our unique tastes.
              </p>

              {/* Google Maps */}
              <div style={{
                backgroundColor: 'white',
                padding: '0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                margin: '0 auto 3rem auto',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'relative',
                  aspectRatio: '21/9'
                }}>
                  {/* Google Maps Embed */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3039.5!2d49.8!3d40.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d6bd6211cf9%3A0x343f6b5e7ae56c6b!2sBaku%2C%20Azerbaijan!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{
                      border: 'none',
                      outline: 'none'
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="PAUL Locations in Baku"
                  />
                  
                  {/* Map overlay with PAUL markers info */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#ef4444',
                      borderRadius: '50%'
                    }}></div>
                    <span>PAUL Locations in Baku</span>
                  </div>
                </div>
              </div>

              {/* Location Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1.5rem',
                maxWidth: '1400px',
                margin: '0 auto 3rem auto'
              }}
              className="locations-grid"
              >
                {/* PAUL Port Baku Mall */}
                <div style={{
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    height: '200px',
                    background: 'url("/images/findpole.png") center/cover',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      PAUL
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1A1A1A',
                      marginBottom: '0.5rem'
                    }}>
                      PAUL Port Baku Mall
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem',
                      lineHeight: '1.5'
                    }}>
                      Neftchiler avenue 153, Port Baku, BAKU, Azerbaijan
                    </p>
                    <p style={{
                      color: '#374151',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      📞 (012) 464 07 70
                    </p>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      Mon-Sun. 08:00 - 23:00
                    </p>
                  </div>
                </div>

                {/* PAUL Nizami */}
                <div style={{
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    height: '200px',
                    background: 'url("/images/findpole2.png") center/cover',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      PAUL
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1A1A1A',
                      marginBottom: '0.5rem'
                    }}>
                      PAUL Nizami
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem',
                      lineHeight: '1.5'
                    }}>
                      Nizami Street 123, BAKU, Azerbaijan
                    </p>
                    <p style={{
                      color: '#374151',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      📞 (012) 464 07 71
                    </p>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      Mon-Sun. 08:00 - 23:00
                    </p>
                  </div>
                </div>

                {/* PAUL Crescent Mall */}
                <div style={{
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    height: '200px',
                    background: 'url("/images/findpole3.png") center/cover',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      PAUL
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1A1A1A',
                      marginBottom: '0.5rem'
                    }}>
                      PAUL Le Café (Crescent Mall)
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem',
                      lineHeight: '1.5'
                    }}>
                      Crescent Mall, Baku, Azerbaijan
                    </p>
                    <p style={{
                      color: '#374151',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      📞 (012) 464 07 72
                    </p>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      Mon-Sun. 09:00 - 22:00
                    </p>
                  </div>
                </div>

                {/* PAUL Business Center */}
                <div style={{
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    height: '200px',
                    background: 'url("/images/findpole4.png") center/cover',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      PAUL
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1A1A1A',
                      marginBottom: '0.5rem'
                    }}>
                      PAUL Business Center
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem',
                      lineHeight: '1.5'
                    }}>
                      Business Center, Baku, Azerbaijan
                    </p>
                    <p style={{
                      color: '#374151',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem',
                      fontWeight: '500'
                    }}>
                      📞 (012) 464 07 73
                    </p>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      Mon-Fri. 07:00 - 20:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                maxWidth: '1400px',
                margin: '0 auto'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1A1A1A',
                  marginBottom: '1rem'
                }}>
                  PAUL Bakeries and Cake Shops in your Local Area
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  Discover the delightful PAUL locations scattered across Baku! Each day, we proudly offer a wide array of freshly baked treats, ranging from hearty breakfasts to our renowned signature cakes and pies that are sure to satisfy your cravings.
                </p>
              </div>
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
