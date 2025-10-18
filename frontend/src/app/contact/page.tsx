'use client';

import React, { useState } from 'react';
import SimpleHeader from '../../components/SimpleHeader';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
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
      <SimpleHeader />
      
      <main className={styles.contactMain}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h1 className={styles.mainTitle}>Contact Information</h1>
          <p className={styles.heroSubtitle}>
            Get in touch with us for any questions, feedback, or support.<br />
            We're here to help you with your PAUL experience.
          </p>
          <div className={styles.heroDivider}></div>
          <div className={styles.heroDividerSecondary}></div>
        </section>

        {/* Contact Information Grid */}
        <section className={styles.contactInfoSection}>
          <div className={styles.contactInfoGrid}>
            <div className={styles.contactInfoCard}>
              <div className={styles.contactIcon}>
                <MapPin size={24} />
              </div>
              <h3 className={styles.contactTitle}>Address</h3>
              <p className={styles.contactDescription}>
                PAUL Azerbaijan<br />
                28 May Street, Baku 1000<br />
                Azerbaijan
              </p>
            </div>

            <div className={styles.contactInfoCard}>
              <div className={styles.contactIcon}>
                <Phone size={24} />
              </div>
              <h3 className={styles.contactTitle}>Phone</h3>
              <p className={styles.contactDescription}>
                +994 12 123 45 67<br />
                +994 50 123 45 67<br />
                Mon-Fri: 8:00 AM - 8:00 PM
              </p>
            </div>

            <div className={styles.contactInfoCard}>
              <div className={styles.contactIcon}>
                <Mail size={24} />
              </div>
              <h3 className={styles.contactTitle}>Email</h3>
              <p className={styles.contactDescription}>
                info@paul.az<br />
                orders@paul.az<br />
                support@paul.az
              </p>
            </div>

            <div className={styles.contactInfoCard}>
              <div className={styles.contactIcon}>
                <Clock size={24} />
              </div>
              <h3 className={styles.contactTitle}>Business Hours</h3>
              <p className={styles.contactDescription}>
                Monday - Friday: 7:00 AM - 10:00 PM<br />
                Saturday - Sunday: 8:00 AM - 10:00 PM<br />
                Public Holidays: 9:00 AM - 8:00 PM
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className={styles.contactFormSection}>
          <div className={styles.contactFormContainer}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Send us a Message</h2>
              <p className={styles.formSubtitle}>
                Have a question or feedback? We'd love to hear from you. 
                Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.formLabel}>Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                >
                  <option value="">Select a subject</option>
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
                <label htmlFor="message" className={styles.formLabel}>Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  required
                  rows={6}
                  placeholder="Please describe your inquiry in detail..."
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
        </section>

        {/* Additional Information */}
        <section className={styles.additionalInfoSection}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Customer Support</h3>
              <p className={styles.infoDescription}>
                Our customer support team is available Monday through Friday from 8:00 AM to 8:00 PM. 
                We typically respond to inquiries within 24 hours.
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Catering Inquiries</h3>
              <p className={styles.infoDescription}>
                For large orders and catering services, please contact us at least 48 hours in advance. 
                We offer custom menus for special events and corporate functions.
              </p>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Feedback & Suggestions</h3>
              <p className={styles.infoDescription}>
                We value your feedback and suggestions. Your input helps us improve our services 
                and create better experiences for all our customers.
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