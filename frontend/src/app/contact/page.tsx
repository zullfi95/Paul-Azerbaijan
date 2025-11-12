'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import Breadcrumbs from '../../components/Breadcrumbs';
import FeaturesSection from '../../components/FeaturesSection';
import { Send } from 'lucide-react';
import styles from './ContactPage.module.css';

export default function ContactInfoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      <Header />
      
      <div className={styles.navbarSpacing}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsContainer}>
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Contact', isActive: true }
              ]}
            />
          </div>
        </div>

        {/* Page Title */}
        <div className={styles.pageTitleContainer}>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.pageTitle}>
              Contact Us
            </h1>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className={styles.mainContent}>
          <div className={styles.contentWrapper}>
            <div className={styles.twoColumnLayout}>
              {/* Left Column - Contact Image */}
              <div className={styles.leftColumn}>
                <div className={styles.imageContainer}>
                  <Image
                    src="/images/contact.jpg"
                    alt="Contact PAUL"
                    fill
                    className={styles.contactImage}
                    priority
                  />
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div className={styles.rightColumn}>
                <div className={styles.formContainer}>
                  <div className={styles.formHeader}>
                    <h2 className={styles.formTitle}>Get in Touch</h2>
                    <p className={styles.formSubtitle}>
                      Have a question or feedback? We'd love to hear from you. 
                      Send us a message and we'll respond as soon as possible.
                    </p>
                  </div>

                  <form className={styles.contactForm} onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={styles.formInput}
                          required
                          placeholder="Full Name *"
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={styles.formInput}
                          required
                          placeholder="Email Address *"
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className={styles.formSelect}
                        required
                      >
                        <option value="">Subject *</option>
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="delivery">Delivery Question</option>
                        <option value="catering">Catering Services</option>
                        <option value="feedback">Feedback</option>
                        <option value="complaint">Complaint</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={styles.formTextarea}
                        required
                        rows={6}
                        placeholder="Message *"
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <div className={styles.formSuccess}>
                        Thank you for your message! We'll get back to you soon.
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <div className={styles.formError}>
                        Sorry, there was an error sending your message. Please try again.
                      </div>
                    )}

                    <button
                      type="submit"
                      className={styles.formSubmitButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className={styles.loadingSpinner}></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <FeaturesSection />
      </div>
      
      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}