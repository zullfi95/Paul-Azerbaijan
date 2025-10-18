'use client';

import React from 'react';
import SimpleHeader from '../../components/SimpleHeader';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import { Truck, Clock, MapPin, CreditCard, Shield, Phone, Mail } from 'lucide-react';
import styles from './DeliveryPage.module.css';

export default function DeliveryInfoPage() {
  return (
    <div className="delivery-page">
      <SimpleHeader />
      
      <main className="delivery-main">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="main-title">Delivery Information</h1>
          <p className="hero-subtitle">
            Fast, reliable delivery service to bring PAUL's delicious products<br />
            directly to your doorstep across Baku.
          </p>
          <div className="hero-divider"></div>
          <div className="hero-divider-secondary"></div>
        </section>

        {/* Delivery Options */}
        <section className="delivery-options-section">
          <div className="delivery-options-grid">
            <div className="delivery-option-card">
              <div className="delivery-icon">
                <Truck size={24} />
              </div>
              <h3 className="delivery-title">Standard Delivery</h3>
              <p className="delivery-description">
                Free delivery for orders over 25 ₼ within Baku city center. 
                Delivery time: 30-60 minutes.
              </p>
              <div className="delivery-price">Free (orders 25+ ₼)</div>
            </div>

            <div className="delivery-option-card">
              <div className="delivery-icon">
                <Clock size={24} />
              </div>
              <h3 className="delivery-title">Express Delivery</h3>
              <p className="delivery-description">
                Fast delivery within 20-30 minutes for urgent orders. 
                Available for orders over 15 ₼.
              </p>
              <div className="delivery-price">5 ₼</div>
            </div>

            <div className="delivery-option-card">
              <div className="delivery-icon">
                <MapPin size={24} />
              </div>
              <h3 className="delivery-title">Scheduled Delivery</h3>
              <p className="delivery-description">
                Plan your delivery in advance. Perfect for events, 
                meetings, or when you need items at a specific time.
              </p>
              <div className="delivery-price">3 ₼</div>
            </div>
          </div>
        </section>

        {/* Delivery Areas */}
        <section className="delivery-areas-section">
          <div className="delivery-areas-container">
            <h2 className="section-title">Delivery Areas</h2>
            <div className="areas-grid">
              <div className="area-card">
                <h3 className="area-title">City Center</h3>
                <p className="area-description">
                  Free delivery for orders over 25 ₼<br />
                  Delivery time: 30-45 minutes
                </p>
                <ul className="area-list">
                  <li>Nizami District</li>
                  <li>Yasamal District</li>
                  <li>Sabail District</li>
                  <li>Narimanov District</li>
                </ul>
              </div>

              <div className="area-card">
                <h3 className="area-title">Extended Areas</h3>
                <p className="area-description">
                  Delivery fee: 3 ₼<br />
                  Delivery time: 45-60 minutes
                </p>
                <ul className="area-list">
                  <li>Khatai District</li>
                  <li>Binagadi District</li>
                  <li>Nasimi District</li>
                  <li>Sabunchu District</li>
                </ul>
              </div>

              <div className="area-card">
                <h3 className="area-title">Outer Areas</h3>
                <p className="area-description">
                  Delivery fee: 5 ₼<br />
                  Delivery time: 60-90 minutes
                </p>
                <ul className="area-list">
                  <li>Garadagh District</li>
                  <li>Khazar District</li>
                  <li>Pirallahi District</li>
                  <li>Nardaran</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Process */}
        <section className="delivery-process-section">
          <div className="delivery-process-container">
            <h2 className="section-title">How It Works</h2>
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3 className="step-title">Place Your Order</h3>
                  <p className="step-description">
                    Browse our menu, add items to cart, and proceed to checkout. 
                    Select your preferred delivery option and time.
                  </p>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3 className="step-title">Order Confirmation</h3>
                  <p className="step-description">
                    Receive instant confirmation via SMS and email. 
                    Track your order status in real-time.
                  </p>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3 className="step-title">Preparation & Dispatch</h3>
                  <p className="step-description">
                    Our team prepares your order with care. 
                    Fresh products are packed and dispatched to your location.
                  </p>
                </div>
              </div>

              <div className="process-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3 className="step-title">Delivery</h3>
                  <p className="step-description">
                    Our delivery partner brings your order to your doorstep. 
                    Contactless delivery options available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment & Policies */}
        <section className="payment-policies-section">
          <div className="payment-policies-container">
            <h2 className="section-title">Payment & Policies</h2>
            <div className="policies-grid">
              <div className="policy-card">
                <div className="policy-icon">
                  <CreditCard size={24} />
                </div>
                <h3 className="policy-title">Payment Methods</h3>
                <ul className="policy-list">
                  <li>Cash on delivery</li>
                  <li>Credit/Debit cards</li>
                  <li>Bank transfers</li>
                  <li>Digital wallets</li>
                </ul>
              </div>

              <div className="policy-card">
                <div className="policy-icon">
                  <Shield size={24} />
                </div>
                <h3 className="policy-title">Quality Guarantee</h3>
                <ul className="policy-list">
                  <li>Fresh products only</li>
                  <li>Temperature-controlled delivery</li>
                  <li>Quality check before dispatch</li>
                  <li>100% satisfaction guarantee</li>
                </ul>
              </div>

              <div className="policy-card">
                <div className="policy-icon">
                  <Phone size={24} />
                </div>
                <h3 className="policy-title">Customer Support</h3>
                <ul className="policy-list">
                  <li>24/7 order tracking</li>
                  <li>Real-time delivery updates</li>
                  <li>Customer service hotline</li>
                  <li>Live chat support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="important-notes-section">
          <div className="important-notes-container">
            <h2 className="section-title">Important Information</h2>
            <div className="notes-grid">
              <div className="note-item">
                <h4 className="note-title">Minimum Order</h4>
                <p className="note-description">
                  Minimum order value is 10 ₼ for delivery. 
                  Free delivery applies to orders over 25 ₼ in city center areas.
                </p>
              </div>

              <div className="note-item">
                <h4 className="note-title">Delivery Hours</h4>
                <p className="note-description">
                  Monday - Friday: 8:00 AM - 10:00 PM<br />
                  Saturday - Sunday: 9:00 AM - 10:00 PM<br />
                  Public holidays: 10:00 AM - 8:00 PM
                </p>
              </div>

              <div className="note-item">
                <h4 className="note-title">Weather Conditions</h4>
                <p className="note-description">
                  Delivery may be delayed during severe weather conditions. 
                  We'll notify you of any delays and provide updated delivery times.
                </p>
              </div>

              <div className="note-item">
                <h4 className="note-title">Still Have Questions?</h4>
                <p className="note-description">
                  If you have any questions about our delivery service, our delivery team is here to help!
                </p>
                <div className="contact-methods">
                  <div className="contact-method">
                    <Phone size={20} />
                    <div>
                      <strong>Call Us:</strong> +994 12 123 45 67<br />
                      <span>Mon-Fri: 9:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                  <div className="contact-method">
                    <Mail size={20} />
                    <div>
                      <strong>Email Us:</strong> delivery@paul.az<br />
                      <span>We'll respond within 24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
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
