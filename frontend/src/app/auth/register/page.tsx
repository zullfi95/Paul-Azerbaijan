"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import FeaturesSection from '../../../components/FeaturesSection';
import styles from './RegisterPage.module.css';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  // const [next] = useState<string>('/'); // Не используется
  
  useEffect(() => {
    try {
      // const params = new URLSearchParams(window.location.search); // Не используется
      // const n = params.get('next') || '/'; // Не используется
      // setNext(n); // Не используется в компоненте
    } catch {
      // setNext('/'); // Не используется в компоненте
    }
  }, []);
  
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsletter, setNewsletter] = useState(false);

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { ok } = await register(
      formData.email, 
      formData.password, 
      formData.name, 
      formData.surname,
      formData.phone
    );
    
    setLoading(false);
    if (ok) {
      router.push('/profile');
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.registerPage}>
      <Header />
      
      {/* Background Image */}
      <div className={styles.backgroundImage}>
        <Image
          src="/images/registerBackground.jpg"
          alt="PAUL Bakery Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>


      <main className={styles.mainContent}>
        <h1 className={styles.formTitle}>Create new customer account</h1>
        
        <div className={styles.loginLink}>
          <span>or </span>
          <Link href="/auth/login" className={styles.loginLinkText}>
            Log in
          </Link>
        </div>
        
        <div className={styles.formContainer}>
          <p className={styles.formSubtitle}>Sign up to create your account today.</p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <input
                  type="text"
                  placeholder="Name*"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                />
              </div>
              <div className={styles.formField}>
                <input
                  type="text"
                  placeholder="Surname*"
                  value={formData.surname}
                  onChange={handleInputChange('surname')}
                  required
                />
              </div>
            </div>

            <div className={styles.formField}>
              <input
                type="email"
                placeholder="Email*"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
            </div>

            <div className={styles.formField}>
              <input
                type="tel"
                placeholder="Phone number*"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                required
              />
            </div>

            <div className={styles.formField}>
              <input
                type="password"
                placeholder="Password*"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
              />
            </div>

            <div className={styles.formField}>
              <input
                type="password"
                placeholder="Confirm password*"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
              />
            </div>

            <div className={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="newsletter"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="newsletter" className={styles.checkboxLabel}>
                Sign up to our news and offers
              </label>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
          </form>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.registerButton}
          onClick={handleSubmit}
        >
          {loading ? 'Creating account...' : 'Create an account'}
        </button>
      </main>

      <FeaturesSection />
      <Footer />
    </div>
  );
}
