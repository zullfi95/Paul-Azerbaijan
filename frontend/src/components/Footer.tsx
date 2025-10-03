"use client";

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      console.log('Subscribed with email:', email);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Левая секция - Навигационные ссылки */}
          <div className="footer-left">
            <div className="footer-columns">
              {/* Explore PAUL */}
              <div className="footer-column">
                <h3 className="footer-title">Explore PAUL</h3>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">In-Store Menu</a></li>
                  <li><a href="#" className="footer-link">Find a PAUL</a></li>
                  <li><a href="#" className="footer-link">Allergens</a></li>
                </ul>
              </div>

              {/* Cakes */}
              <div className="footer-column">
                <h3 className="footer-title">Cakes</h3>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Birthday</a></li>
                  <li><a href="#" className="footer-link">Personalised</a></li>
                  <li><a href="#" className="footer-link">Celebration</a></li>
                  <li><a href="#" className="footer-link">Traditional</a></li>
                  <li><a href="#" className="footer-link">French</a></li>
                </ul>
              </div>

              {/* Company */}
              <div className="footer-column">
                <h3 className="footer-title">Company</h3>
                <ul className="footer-links">
                  <li><a href="/our-story" className="footer-link">Our Story</a></li>
                  <li><a href="#" className="footer-link">Sustainability</a></li>
                  <li><a href="#" className="footer-link">Franchise</a></li>
                </ul>
              </div>

              {/* Customer */}
              <div className="footer-column">
                <h3 className="footer-title">Customer</h3>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Contact Information</a></li>
                  <li><a href="#" className="footer-link">Delivery Information</a></li>
                  <li><a href="#" className="footer-link">My Account</a></li>
                  <li><a href="#" className="footer-link">FAQ</a></li>
                  <li><a href="#" className="footer-link">Terms & Conditions</a></li>
                  <li><a href="#" className="footer-link">Privacy Policy</a></li>
                  <li><a href="#" className="footer-link">Cookie Policy</a></li>
                </ul>
              </div>
            </div>

            {/* Платежные методы */}
            <div className="footer-payment">
              <div className="payment-logos">
                <Image
                  src="/images/visamaster.png"
                  alt="Visa and Mastercard"
                  width={120}
                  height={40}
                  style={{
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Правая секция - Newsletter и Social Media */}
          <div className="footer-right">
            {/* Newsletter */}
            <div className="newsletter-section">
              <div className="newsletter-header">
                <h3 className="newsletter-title">Join our Newsletter</h3>
                <Mail className="newsletter-icon" size={18} />
              </div>
              <p className="newsletter-description">Be the first to know our latest news</p>
              
              <form className="newsletter-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email here"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-button">
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Media */}
            <div className="social-media">
              <a href="#" className="social-link" aria-label="Instagram">
                <Image
                  src="/images/3463469_instagram_social media_social_network_icon 1.svg"
                  alt="Instagram"
                  width={23}
                  height={23}
                />
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <Image
                  src="/images/3463481_media_network_social_youtube_icon 1.svg"
                  alt="YouTube"
                  width={23}
                  height={23}
                />
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <Image
                  src="/images/3463465_facebook_media_network_social_icon 1.svg"
                  alt="Facebook"
                  width={23}
                  height={23}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;