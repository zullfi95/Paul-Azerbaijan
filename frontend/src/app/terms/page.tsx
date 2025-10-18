'use client';

import React from 'react';
import SimpleHeader from '../../components/SimpleHeader';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import { FileText, Calendar, Shield, AlertCircle, Mail, Phone } from 'lucide-react';
import styles from './TermsPage.module.css';

export default function TermsAndConditionsPage() {
  return (
    <div className={styles.termsPage}>
      <SimpleHeader />
      
      <main className={styles.termsMain}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h1 className={styles.mainTitle}>Terms and Conditions</h1>
          <p className={styles.heroSubtitle}>
            Please read these terms and conditions carefully before using our services.<br />
            By using PAUL Azerbaijan's services, you agree to be bound by these terms.
          </p>
          <div className={styles.heroDivider}></div>
          <div className={styles.heroDividerSecondary}></div>
        </section>

        {/* Last Updated */}
        <section className={styles.lastUpdatedSection}>
          <div className={styles.lastUpdatedContainer}>
            <div className={styles.lastUpdatedCard}>
              <Calendar size={20} />
              <span>Last updated: January 15, 2024</span>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className={styles.termsContentSection}>
          <div className={styles.termsContentContainer}>
            
            {/* Section 1 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <FileText size={24} />
                1. Acceptance of Terms
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  By accessing and using PAUL Azerbaijan's website, mobile application, or services, 
                  you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These terms and conditions apply to all visitors, users, and others who access 
                  or use the service. Your use of our service is at your sole risk.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <Shield size={24} />
                2. Use License
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  Permission is granted to temporarily download one copy of PAUL Azerbaijan's 
                  materials for personal, non-commercial transitory viewing only. This is the 
                  grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul>
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
                <p>
                  This license shall automatically terminate if you violate any of these restrictions 
                  and may be terminated by PAUL Azerbaijan at any time.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <AlertCircle size={24} />
                3. Orders and Payment
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  All orders placed through our website or mobile application are subject to 
                  acceptance and availability. We reserve the right to refuse or cancel any 
                  order for any reason, including but not limited to:
                </p>
                <ul>
                  <li>Product or service availability</li>
                  <li>Errors in the description or price of the product or service</li>
                  <li>Errors in your order</li>
                  <li>Fraudulent or illegal activity</li>
                </ul>
                <p>
                  Payment must be received before order processing begins. We accept various 
                  payment methods including cash on delivery, credit cards, and bank transfers. 
                  All prices are in Azerbaijani Manat (₼) and include applicable taxes.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <FileText size={24} />
                4. Delivery and Returns
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  Delivery times are estimates and may vary depending on location, weather 
                  conditions, and other factors beyond our control. We will make every effort 
                  to deliver within the estimated time frame.
                </p>
                <p>
                  Returns and refunds are subject to our return policy. Fresh food products 
                  cannot be returned unless there is a quality issue. In case of quality 
                  problems, please contact us within 2 hours of delivery.
                </p>
                <p>
                  We reserve the right to refuse delivery to addresses that are difficult 
                  to access or in areas where we do not provide service.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <Shield size={24} />
                5. Privacy and Data Protection
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, 
                  use, and protect your information when you use our service. By using our 
                  service, you agree to the collection and use of information in accordance 
                  with our Privacy Policy.
                </p>
                <p>
                  We may collect personal information such as your name, email address, phone 
                  number, and delivery address. This information is used to process your orders 
                  and provide customer service.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <AlertCircle size={24} />
                6. Limitation of Liability
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  In no event shall PAUL Azerbaijan, nor its directors, employees, partners, 
                  agents, suppliers, or affiliates, be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including without limitation, 
                  loss of profits, data, use, goodwill, or other intangible losses, resulting 
                  from your use of the service.
                </p>
                <p>
                  Our total liability to you for all damages shall not exceed the amount you 
                  paid us for the specific product or service that gave rise to the claim.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <FileText size={24} />
                7. Intellectual Property
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  The service and its original content, features, and functionality are and 
                  will remain the exclusive property of PAUL Azerbaijan and its licensors. 
                  The service is protected by copyright, trademark, and other laws.
                </p>
                <p>
                  Our trademarks and trade dress may not be used in connection with any product 
                  or service without our prior written consent. All other trademarks not owned 
                  by PAUL Azerbaijan that appear on this site are the property of their 
                  respective owners.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <Shield size={24} />
                8. Termination
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  We may terminate or suspend your account and bar access to the service 
                  immediately, without prior notice or liability, under our sole discretion, 
                  for any reason whatsoever and without limitation, including but not limited 
                  to a breach of the Terms.
                </p>
                <p>
                  If you wish to terminate your account, you may simply discontinue using 
                  the service. All provisions of the Terms which by their nature should 
                  survive termination shall survive termination.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <AlertCircle size={24} />
                9. Governing Law
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  These Terms shall be interpreted and governed by the laws of the Republic 
                  of Azerbaijan, without regard to its conflict of law provisions. Our failure 
                  to enforce any right or provision of these Terms will not be considered a 
                  waiver of those rights.
                </p>
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable by 
                  a court, the remaining provisions of these Terms will remain in effect.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div className={styles.termsSection}>
              <h2 className={styles.termsSectionTitle}>
                <FileText size={24} />
                10. Changes to Terms
              </h2>
              <div className={styles.termsSectionContent}>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these 
                  Terms at any time. If a revision is material, we will provide at least 
                  30 days notice prior to any new terms taking effect.
                </p>
                <p>
                  What constitutes a material change will be determined at our sole discretion. 
                  By continuing to access or use our service after those revisions become 
                  effective, you agree to be bound by the revised terms.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className={styles.contactSection}>
              <h2 className={styles.contactTitle}>Still Have Questions?</h2>
              <p className={styles.contactDescription}>
                If you have any questions about these Terms and Conditions, our legal team is here to help!
              </p>
              
              <div className={styles.contactMethods}>
                <div className={styles.contactMethod}>
                  <Phone size={24} />
                  <div>
                    <h4>Call Us</h4>
                    <p>+994 12 123 45 67</p>
                    <span>Mon-Fri: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
                
                <div className={styles.contactMethod}>
                  <Mail size={24} />
                  <div>
                    <h4>Email Us</h4>
                    <p>legal@paul.az</p>
                    <span>We'll respond within 24 hours</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.contactActions}>
                <button className={styles.contactBtn}>
                  <Mail size={20} />
                  Send Message
                </button>
                <button className={styles.contactBtn}>
                  <Phone size={20} />
                  Call Now
                </button>
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