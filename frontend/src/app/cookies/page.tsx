'use client';

import React, { useState } from 'react';
import SimpleHeader from '../../components/SimpleHeader';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import { Cookie, Settings, Check, X, Info, Mail, Phone } from 'lucide-react';
import styles from './CookiesPage.module.css';

export default function CookiePolicyPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always required
    performance: false,
    functional: false,
    marketing: false,
  });

  const handlePreferenceChange = (type: keyof typeof cookiePreferences) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const savePreferences = () => {
    // Save preferences to localStorage or send to server
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Cookie preferences saved successfully!');
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      performance: true,
      functional: true,
      marketing: true,
    };
    setCookiePreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    alert('All cookies accepted!');
  };

  const rejectAll = () => {
    const onlyEssential = {
      essential: true,
      performance: false,
      functional: false,
      marketing: false,
    };
    setCookiePreferences(onlyEssential);
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyEssential));
    alert('Only essential cookies accepted!');
  };

  return (
    <div className={styles.cookiesPage}>
      <SimpleHeader />
      
      <main className={styles.cookiesMain}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h1 className={styles.mainTitle}>Cookie Policy</h1>
          <p className={styles.heroSubtitle}>
            Learn about how we use cookies and similar technologies to enhance<br />
            your experience on our website and mobile application.
          </p>
          <div className={styles.heroDivider}></div>
          <div className={styles.heroDividerSecondary}></div>
        </section>

        {/* Last Updated */}
        <section className={styles.lastUpdatedSection}>
          <div className={styles.lastUpdatedContainer}>
            <div className={styles.lastUpdatedCard}>
              <Cookie size={20} />
              <span>Last updated: January 15, 2024</span>
            </div>
          </div>
        </section>

        {/* Cookie Content */}
        <section className={styles.cookiesContentSection}>
          <div className={styles.cookiesContentContainer}>
            
            {/* Section 1 */}
            <div className={styles.cookiesSection}>
              <h2 className={styles.cookiesSectionTitle}>
                <Cookie size={24} />
                1. What Are Cookies?
              </h2>
              <div className={styles.cookiesSectionContent}>
                <p>
                  Cookies are small text files that are placed on your computer or mobile device 
                  when you visit a website. They are widely used to make websites work more 
                  efficiently and to provide information to website owners.
                </p>
                <p>
                  Cookies allow a website to recognize a user's device and remember information 
                  about their visit, such as their preferred language and other settings. This 
                  can make your next visit easier and the site more useful to you.
                </p>
                <p>
                  We use both session cookies (which expire when you close your browser) and 
                  persistent cookies (which remain on your device for a set period of time).
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className={styles.cookiesSection}>
              <h2 className={styles.cookiesSectionTitle}>
                <Settings size={24} />
                2. Types of Cookies We Use
              </h2>
              <div className={styles.cookiesSectionContent}>
                <div className={styles.cookieType}>
                  <h3>Essential Cookies</h3>
                  <p>
                    These cookies are necessary for the website to function properly. They enable 
                    basic functions like page navigation, access to secure areas, and remembering 
                    your login status. The website cannot function properly without these cookies.
                  </p>
                  <div className={styles.cookieExamples}>
                    <strong>Examples:</strong> Authentication, shopping cart, security preferences
                  </div>
                </div>

                <div className={styles.cookieType}>
                  <h3>Performance Cookies</h3>
                  <p>
                    These cookies collect information about how visitors use our website, such as 
                    which pages are visited most often and if visitors get error messages. This 
                    helps us improve how our website works.
                  </p>
                  <div className={styles.cookieExamples}>
                    <strong>Examples:</strong> Google Analytics, page load times, error tracking
                  </div>
                </div>

                <div className={styles.cookieType}>
                  <h3>Functional Cookies</h3>
                  <p>
                    These cookies enable the website to provide enhanced functionality and 
                    personalization. They may be set by us or by third-party providers whose 
                    services we have added to our pages.
                  </p>
                  <div className={styles.cookieExamples}>
                    <strong>Examples:</strong> Language preferences, region settings, user interface customization
                  </div>
                </div>

                <div className={styles.cookieType}>
                  <h3>Marketing Cookies</h3>
                  <p>
                    These cookies are used to track visitors across websites. The intention is 
                    to display ads that are relevant and engaging for individual users and 
                    thereby more valuable for publishers and third-party advertisers.
                  </p>
                  <div className={styles.cookieExamples}>
                    <strong>Examples:</strong> Social media integration, advertising networks, remarketing
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className={styles.cookiesSection}>
              <h2 className={styles.cookiesSectionTitle}>
                <Info size={24} />
                3. How We Use Cookies
              </h2>
              <div className={styles.cookiesSectionContent}>
                <p>
                  We use cookies for various purposes to improve your experience on our website:
                </p>
                <ul>
                  <li><strong>Authentication:</strong> To keep you logged in and secure your account</li>
                  <li><strong>Shopping Cart:</strong> To remember items you've added to your cart</li>
                  <li><strong>Preferences:</strong> To remember your language, region, and other settings</li>
                  <li><strong>Analytics:</strong> To understand how you use our website and improve it</li>
                  <li><strong>Marketing:</strong> To show you relevant advertisements and promotions</li>
                  <li><strong>Security:</strong> To protect against fraud and ensure website security</li>
                </ul>
                <p>
                  We may also use cookies to personalize content and advertisements, provide 
                  social media features, and analyze our traffic. We may share information 
                  about your use of our site with our social media, advertising, and analytics 
                  partners.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className={styles.cookiesSection}>
              <h2 className={styles.cookiesSectionTitle}>
                <Settings size={24} />
                4. Managing Your Cookie Preferences
              </h2>
              <div className={styles.cookiesSectionContent}>
                <p>
                  You have the right to choose which cookies you accept. You can manage your 
                  cookie preferences using the controls below:
                </p>

                <div className={styles.cookieControls}>
                  <div className={styles.cookieControl}>
                    <div className={styles.cookieControlHeader}>
                      <h4>Essential Cookies</h4>
                      <div className={styles.cookieToggle}>
                        <input
                          type="checkbox"
                          checked={cookiePreferences.essential}
                          disabled
                          readOnly
                        />
                        <span className={styles.toggleLabel}>Always Active</span>
                      </div>
                    </div>
                    <p>These cookies are necessary for the website to function and cannot be switched off.</p>
                  </div>

                  <div className={styles.cookieControl}>
                    <div className={styles.cookieControlHeader}>
                      <h4>Performance Cookies</h4>
                      <div className={styles.cookieToggle}>
                        <input
                          type="checkbox"
                          checked={cookiePreferences.performance}
                          onChange={() => handlePreferenceChange('performance')}
                        />
                        <span className={styles.toggleLabel}>
                          {cookiePreferences.performance ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p>These cookies help us understand how visitors interact with our website.</p>
                  </div>

                  <div className={styles.cookieControl}>
                    <div className={styles.cookieControlHeader}>
                      <h4>Functional Cookies</h4>
                      <div className={styles.cookieToggle}>
                        <input
                          type="checkbox"
                          checked={cookiePreferences.functional}
                          onChange={() => handlePreferenceChange('functional')}
                        />
                        <span className={styles.toggleLabel}>
                          {cookiePreferences.functional ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p>These cookies enable enhanced functionality and personalization.</p>
                  </div>

                  <div className={styles.cookieControl}>
                    <div className={styles.cookieControlHeader}>
                      <h4>Marketing Cookies</h4>
                      <div className={styles.cookieToggle}>
                        <input
                          type="checkbox"
                          checked={cookiePreferences.marketing}
                          onChange={() => handlePreferenceChange('marketing')}
                        />
                        <span className={styles.toggleLabel}>
                          {cookiePreferences.marketing ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <p>These cookies are used to deliver advertisements more relevant to you.</p>
                  </div>
                </div>

                <div className={styles.cookieActions}>
                  <button onClick={acceptAll} className={styles.acceptAllBtn}>
                    <Check size={20} />
                    Accept All
                  </button>
                  <button onClick={rejectAll} className={styles.rejectAllBtn}>
                    <X size={20} />
                    Reject All
                  </button>
                  <button onClick={savePreferences} className={styles.saveBtn}>
                    <Settings size={20} />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className={styles.cookiesSection}>
              <h2 className={styles.cookiesSectionTitle}>
                <Info size={24} />
                5. Browser Settings
              </h2>
              <div className={styles.cookiesSectionContent}>
                <p>
                  You can also control cookies through your browser settings. Most browsers 
                  allow you to refuse cookies or delete them. However, if you disable cookies, 
                  some parts of our website may not function properly.
                </p>
                <p>
                  Here's how to manage cookies in popular browsers:
                </p>
                <ul>
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
                <p>
                  For more information about cookies and how to manage them, visit 
                  <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">
                    www.allaboutcookies.org
                  </a>.
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className={styles.cookiesSection}>
              <h2 className={styles.cookiesSectionTitle}>
                <Cookie size={24} />
                6. Third-Party Cookies
              </h2>
              <div className={styles.cookiesSectionContent}>
                <p>
                  Some cookies on our website are set by third-party services. These include:
                </p>
                <ul>
                  <li><strong>Google Analytics:</strong> To analyze website usage and performance</li>
                  <li><strong>Social Media Platforms:</strong> For social sharing and login features</li>
                  <li><strong>Payment Processors:</strong> To process secure payments</li>
                  <li><strong>Advertising Networks:</strong> To deliver relevant advertisements</li>
                </ul>
                <p>
                  These third parties have their own privacy policies and cookie practices. 
                  We recommend reviewing their policies to understand how they use cookies 
                  and your information.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className={styles.cookiesSection}>
              <h2 className={styles.cookiesSectionTitle}>
                <Settings size={24} />
                7. Updates to This Policy
              </h2>
              <div className={styles.cookiesSectionContent}>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in 
                  our practices or applicable laws. We will notify you of any material changes 
                  by posting the updated policy on our website and updating the "Last updated" 
                  date.
                </p>
                <p>
                  We encourage you to review this Cookie Policy periodically to stay informed 
                  about our use of cookies and similar technologies.
                </p>
              </div>
            </div>

            {/* Contact Section */}
            <div className={styles.contactSection}>
              <h2 className={styles.contactTitle}>Still Have Questions?</h2>
              <p className={styles.contactDescription}>
                If you have any questions about our use of cookies, our privacy team is here to help!
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
