'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import { Shield, Eye, Lock, Database, Mail, Phone } from 'lucide-react';
import styles from './PrivacyPage.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.privacyPage}>
      <Header />
      
      <main className={styles.privacyMain}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h1 className={styles.mainTitle}>Privacy Policy</h1>
          <p className={styles.heroSubtitle}>
            Your privacy is important to us. This policy explains how we collect,<br />
            use, and protect your personal information when you use our services.
          </p>
          <div className={styles.heroDivider}></div>
          <div className={styles.heroDividerSecondary}></div>
        </section>

        {/* Last Updated */}
        <section className={styles.lastUpdatedSection}>
          <div className={styles.lastUpdatedContainer}>
            <div className={styles.lastUpdatedCard}>
              <Shield size={20} />
              <span>Last updated: January 15, 2024</span>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
        <section className={styles.privacyContentSection}>
          <div className={styles.privacyContentContainer}>
            
            {/* Section 1 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Eye size={24} />
                1. Information We Collect
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  We collect information you provide directly to us, such as when you create an account, 
                  place an order, or contact us for support. This may include:
                </p>
                <ul>
                  <li>Name, email address, and phone number</li>
                  <li>Delivery address and billing information</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Order history and preferences</li>
                  <li>Communications with our customer service team</li>
                </ul>
                <p>
                  We also automatically collect certain information when you use our services, including 
                  device information, IP address, browser type, and usage patterns.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Database size={24} />
                2. How We Use Your Information
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  We use the information we collect to provide, maintain, and improve our services. 
                  This includes:
                </p>
                <ul>
                  <li>Processing and fulfilling your orders</li>
                  <li>Communicating with you about your orders and our services</li>
                  <li>Providing customer support</li>
                  <li>Personalizing your experience</li>
                  <li>Improving our website and mobile application</li>
                  <li>Preventing fraud and ensuring security</li>
                  <li>Complying with legal obligations</li>
                </ul>
                <p>
                  We may also use your information to send you promotional materials, but you can 
                  opt out of these communications at any time.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Lock size={24} />
                3. Information Sharing and Disclosure
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third 
                  parties without your consent, except in the following circumstances:
                </p>
                <ul>
                  <li><strong>Service Providers:</strong> We may share information with trusted 
                  third parties who assist us in operating our website, conducting our business, 
                  or serving our customers.</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when 
                  required by law or to protect our rights, property, or safety.</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, 
                  or sale of assets, your information may be transferred as part of the transaction.</li>
                </ul>
                <p>
                  We require all third parties to respect the security of your personal information 
                  and to treat it in accordance with the law.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Shield size={24} />
                4. Data Security
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  We implement appropriate technical and organizational measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or 
                  destruction. These measures include:
                </p>
                <ul>
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication procedures</li>
                  <li>Employee training on data protection</li>
                  <li>Secure payment processing</li>
                </ul>
                <p>
                  However, no method of transmission over the internet or electronic storage is 
                  100% secure. While we strive to protect your personal information, we cannot 
                  guarantee its absolute security.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Eye size={24} />
                5. Your Rights and Choices
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  You have certain rights regarding your personal information, including:
                </p>
                <ul>
                  <li><strong>Access:</strong> You can request access to the personal information 
                  we hold about you.</li>
                  <li><strong>Correction:</strong> You can request that we correct any inaccurate 
                  or incomplete information.</li>
                  <li><strong>Deletion:</strong> You can request that we delete your personal 
                  information, subject to certain exceptions.</li>
                  <li><strong>Portability:</strong> You can request a copy of your information 
                  in a structured, machine-readable format.</li>
                  <li><strong>Objection:</strong> You can object to certain processing of your 
                  information, such as marketing communications.</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the information provided 
                  in the "Contact Us" section below.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Database size={24} />
                6. Cookies and Tracking Technologies
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience 
                  on our website and mobile application. These technologies help us:
                </p>
                <ul>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze how you use our services</li>
                  <li>Provide personalized content and advertisements</li>
                  <li>Improve our website performance</li>
                </ul>
                <p>
                  You can control cookies through your browser settings, but disabling cookies 
                  may affect the functionality of our services. For more information about 
                  our use of cookies, please see our Cookie Policy.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Lock size={24} />
                7. Data Retention
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  We retain your personal information for as long as necessary to fulfill the 
                  purposes outlined in this Privacy Policy, unless a longer retention period 
                  is required or permitted by law. This includes:
                </p>
                <ul>
                  <li>Account information: Until you delete your account or request deletion</li>
                  <li>Order information: For accounting and legal compliance purposes</li>
                  <li>Marketing communications: Until you opt out</li>
                  <li>Customer service records: For a reasonable period to provide support</li>
                </ul>
                <p>
                  When we no longer need your personal information, we will securely delete 
                  or anonymize it.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Shield size={24} />
                8. International Data Transfers
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  Your personal information may be transferred to and processed in countries 
                  other than your country of residence. These countries may have different 
                  data protection laws than your country.
                </p>
                <p>
                  When we transfer your information internationally, we ensure that appropriate 
                  safeguards are in place to protect your personal information in accordance 
                  with applicable data protection laws.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Eye size={24} />
                9. Children's Privacy
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  Our services are not intended for children under the age of 13. We do not 
                  knowingly collect personal information from children under 13. If we become 
                  aware that we have collected personal information from a child under 13, 
                  we will take steps to delete such information.
                </p>
                <p>
                  If you are a parent or guardian and believe your child has provided us with 
                  personal information, please contact us immediately.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div className={styles.privacySection}>
              <h2 className={styles.privacySectionTitle}>
                <Database size={24} />
                10. Changes to This Privacy Policy
              </h2>
              <div className={styles.privacySectionContent}>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in 
                  our practices or applicable laws. We will notify you of any material changes 
                  by posting the updated policy on our website and updating the "Last updated" 
                  date.
                </p>
                <p>
                  We encourage you to review this Privacy Policy periodically to stay informed 
                  about how we protect your information.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className={styles.contactSection}>
              <h2 className={styles.contactTitle}>Still Have Questions?</h2>
              <p className={styles.contactDescription}>
                If you have any questions about this Privacy Policy or our data practices, our privacy team is here to help!
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
                    <p>privacy@paul.az</p>
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