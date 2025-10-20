"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from '@/components/ui/accordion';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import './Footer.css';

interface FooterLink {
  label: string;
  href: string;
  target?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

// Кастомный триггер аккордеона для футера
const FooterAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className="footer-accordion-trigger"
      {...props}
    >
      {children}
      <div className="footer-accordion-icon">
        <ChevronDown className="footer-accordion-chevron" size={14} />
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
FooterAccordionTrigger.displayName = "FooterAccordionTrigger";

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const isMobile = useIsMobile();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmail('');
    }
  };

  const footerSections: FooterSection[] = [
    {
      title: 'Explore PAUL',
      links: [
        { label: 'In-Store Menu', href: '/cakes', target: '_self' },
        { label: 'Find a PAUL', href: '/locations' },
      ],
    },
    {
      title: 'Menu',
      links: [
        { label: 'Lunch Menu', href: '/catering#lunch' },
        { label: 'Brunch Menu', href: '/catering#brunch' },
        { label: 'Coffee Breaks\n& Afternoon Teas', href: '/catering#coffee-breaks' },
        { label: 'Catering Menu', href: '/catering' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Our Story', href: '/our-story' },
      ],
    },
    {
      title: 'Customer',
      links: [
        { label: 'My Account', href: '/profile' },
        { label: 'Contact info', href: '/contact' },
        { label: 'Delivery info', href: '/delivery' },
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Privacy policy', href: '/privacy' },
        { label: 'Cookie policy', href: '/cookies' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {isMobile ? (
            // Мобильная версия
            <div className="footer-mobile">
              {/* Аккордеоны */}
              <Accordion type="multiple" className="footer-accordion">
                {footerSections.map((section, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="footer-accordion-item">
                    <FooterAccordionTrigger>
                      {section.title}
                    </FooterAccordionTrigger>
                    <AccordionContent className="footer-accordion-content">
                      <ul className="footer-links">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <a 
                              href={link.href} 
                              className="footer-link"
                              target={link.target || '_self'}
                              rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Newsletter */}
              <div className="newsletter-section">
                <div className="newsletter-header">
                  <h3 className="newsletter-title">Join our Newsletter</h3>
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

              {/* Горизонтальная линия */}
              <div className="footer-divider"></div>

              {/* Social Media */}
              <div className="social-media">
                <a href="https://instagram.com/paulbakery" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/3463469_instagram_social media_social_network_icon 1.svg"
                    alt="Instagram"
                    width={23}
                    height={23}
                  />
                </a>
                <a href="https://youtube.com/paulbakery" className="social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/3463481_media_network_social_youtube_icon 1.svg"
                    alt="YouTube"
                    width={23}
                    height={23}
                  />
                </a>
                <a href="https://facebook.com/paulbakery" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/3463465_facebook_media_network_social_icon 1.svg"
                    alt="Facebook"
                    width={23}
                    height={23}
                  />
                </a>
              </div>

              {/* Платежные методы */}
              <div className="footer-payment">
                <div className="payment-logos">
                  <Image
                    src="/images/visa.png"
                    alt="Visa"
                    width={100}
                    height={44}
                    style={{
                      objectFit: 'contain',
                      marginRight: '10px'
                    }}
                  />
                  <Image
                    src="/images/mastercart.svg"
                    alt="Mastercard"
                    width={40}
                    height={25}
                    style={{
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            // Десктопная версия
            <>
              <div className="footer-left">
                <div className="footer-columns">
                  {footerSections.map((section, index) => (
                    <div key={index} className="footer-column">
                      <h3 className="footer-title">{section.title}</h3>
                      <ul className="footer-links">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex}>
                            <a 
                              href={link.href} 
                              className="footer-link"
                              target={link.target || '_self'}
                              rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Платежные методы */}
                <div className="footer-payment">
                  <div className="payment-logos">
                    <Image
                      src="/images/visa.png"
                      alt="Visa"
                      width={100}
                      height={44}
                      style={{
                        objectFit: 'contain',
                        marginRight: '10px'
                      }}
                    />
                    <Image
                      src="/images/mastercart.svg"
                      alt="Mastercard"
                      width={50}
                      height={35}
                      style={{
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Разделительная линия между навигацией и Newsletter */}
              <div className="footer-divider"></div>

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
                  <a href="https://instagram.com/paulbakery" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                    <Image
                      src="/images/3463469_instagram_social media_social_network_icon 1.svg"
                      alt="Instagram"
                      width={23}
                      height={23}
                    />
                  </a>
                  <a href="https://youtube.com/paulbakery" className="social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                    <Image
                      src="/images/3463481_media_network_social_youtube_icon 1.svg"
                      alt="YouTube"
                      width={23}
                      height={23}
                    />
                  </a>
                  <a href="https://facebook.com/paulbakery" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                    <Image
                      src="/images/3463465_facebook_media_network_social_icon 1.svg"
                      alt="Facebook"
                      width={23}
                      height={23}
                    />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;