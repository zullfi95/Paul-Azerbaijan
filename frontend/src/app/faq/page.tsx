'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';
import { HelpCircle, ChevronDown, ChevronUp, Search, Mail, Phone } from 'lucide-react';
import styles from './FAQPage.module.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "How do I place an order?",
      answer: "You can place an order through our website or mobile app. Simply browse our menu, add items to your cart, and proceed to checkout. You can choose delivery or pickup options.",
      category: "ordering"
    },
    {
      id: 2,
      question: "What are your delivery areas?",
      answer: "We deliver to most areas in Baku. Delivery is available within a 15km radius from our main location. You can check if your address is within our delivery zone during checkout.",
      category: "delivery"
    },
    {
      id: 3,
      question: "How long does delivery take?",
      answer: "Standard delivery takes 30-45 minutes. For larger orders or during peak hours, delivery may take up to 60 minutes. You can track your order in real-time through our app.",
      category: "delivery"
    },
    {
      id: 4,
      question: "What payment methods do you accept?",
      answer: "We accept cash on delivery, credit/debit cards, and bank transfers. Online payments are processed securely through our payment partners.",
      category: "payment"
    },
    {
      id: 5,
      question: "Can I modify or cancel my order?",
      answer: "You can modify or cancel your order within 10 minutes of placing it. After that, please contact our customer service team immediately.",
      category: "ordering"
    },
    {
      id: 6,
      question: "Do you have vegetarian and vegan options?",
      answer: "Yes, we offer a variety of vegetarian and vegan options. Look for the green leaf icon next to items on our menu, or filter by dietary preferences.",
      category: "menu"
    },
    {
      id: 7,
      question: "What are your operating hours?",
      answer: "We're open daily from 8:00 AM to 10:00 PM. Our kitchen closes at 9:30 PM for last orders. Hours may vary on holidays.",
      category: "general"
    },
    {
      id: 8,
      question: "How do I track my order?",
      answer: "You can track your order through our mobile app or website. You'll receive SMS updates and can see the real-time location of your delivery driver.",
      category: "delivery"
    },
    {
      id: 9,
      question: "Do you offer catering services?",
      answer: "Yes, we provide catering services for events, meetings, and special occasions. Please contact us at least 24 hours in advance for catering orders.",
      category: "catering"
    },
    {
      id: 10,
      question: "What if I'm not satisfied with my order?",
      answer: "We want you to be completely satisfied. If you're not happy with your order, please contact us within 2 hours of delivery, and we'll make it right.",
      category: "support"
    },
    {
      id: 11,
      question: "How do I create an account?",
      answer: "Click on 'Sign Up' in the top right corner of our website or app. You'll need to provide your name, email, and phone number. Account creation is free and takes less than a minute.",
      category: "account"
    },
    {
      id: 12,
      question: "Can I save my favorite orders?",
      answer: "Yes! Once you create an account, you can save your favorite items and reorder them quickly. You can also create custom meal combinations.",
      category: "account"
    },
    {
      id: 13,
      question: "Do you have a loyalty program?",
      answer: "Yes, we have a points-based loyalty program. Earn points with every order and redeem them for discounts on future purchases. Sign up is automatic when you create an account.",
      category: "account"
    },
    {
      id: 14,
      question: "What if I have food allergies?",
      answer: "Please inform us of any food allergies when placing your order. We take allergies seriously and will do our best to accommodate your needs. However, we cannot guarantee a completely allergen-free environment.",
      category: "menu"
    },
    {
      id: 15,
      question: "How do I contact customer service?",
      answer: "You can reach our customer service team by phone at +994 12 123 45 67, email at support@paul.az, or through the chat feature on our website and app.",
      category: "support"
    }
  ];

  const categories = [
    { value: 'all', label: 'All Questions' },
    { value: 'ordering', label: 'Ordering' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'payment', label: 'Payment' },
    { value: 'menu', label: 'Menu & Food' },
    { value: 'account', label: 'Account' },
    { value: 'catering', label: 'Catering' },
    { value: 'support', label: 'Support' },
    { value: 'general', label: 'General' }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className={styles.faqPage}>
      <Header />
      
      <main className={styles.faqMain}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h1 className={styles.mainTitle}>Frequently Asked Questions</h1>
          <p className={styles.heroSubtitle}>
            Find answers to common questions about our services, ordering process,<br />
            delivery, and more. Can't find what you're looking for? Contact us!
          </p>
          <div className={styles.heroDivider}></div>
          <div className={styles.heroDividerSecondary}></div>
        </section>

        {/* Search and Filter Section */}
        <section className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.categoryFilter}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.categorySelect}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className={styles.faqContentSection}>
          <div className={styles.faqContentContainer}>
            
            {filteredFAQs.length === 0 ? (
              <div className={styles.noResults}>
                <HelpCircle size={48} />
                <h3>No questions found</h3>
                <p>Try adjusting your search terms or category filter.</p>
              </div>
            ) : (
              <div className={styles.faqList}>
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className={styles.faqItem}>
                    <button
                      className={styles.faqQuestion}
                      onClick={() => toggleExpanded(faq.id)}
                    >
                      <span className={styles.questionText}>{faq.question}</span>
                      <div className={styles.questionIcon}>
                        {expandedItems.includes(faq.id) ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </button>
                    
                    {expandedItems.includes(faq.id) && (
                      <div className={styles.faqAnswer}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Contact Section */}
            <div className={styles.contactSection}>
              <h2 className={styles.contactTitle}>Still Have Questions?</h2>
              <p className={styles.contactDescription}>
                Can't find the answer you're looking for? Our customer service team is here to help!
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
                    <p>support@paul.az</p>
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