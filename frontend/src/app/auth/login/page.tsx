"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import FeaturesSection from '../../../components/FeaturesSection';
import styles from './LoginPage.module.css';
import Image from 'next/image';

export default function LoginPage() {
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
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { ok, user } = await login(formData.email, formData.password);
    setLoading(false);
    if (ok) {
      // Если пользователь клиент - редирект на профиль, иначе на дашборд
      if (user?.user_type === 'client') {
        router.push('/profile');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError('Login failed. Check credentials.');
    }
  };

  return (
    <div className={styles.loginPage}>
      <Header />
      
      {/* Background Image */}
      <div className={styles.backgroundImage}>
        <Image
          src="/images/loginBackground.png"
          alt="PAUL Bakery Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      
      <main className={styles.mainContent}>
        <h1 className={styles.formTitle}>Log in</h1>
        
        <div className={styles.createAccountSection}>
          <span className={styles.createAccountText}>Don&apos;t have an account? </span>
          <Link href="/auth/register" className={styles.createAccountLink}>
            Create account
          </Link>
        </div>
        
        <div className={styles.loginContainer}>
          <p className={styles.formSubtitle}>Log in to continue shopping</p>
          
          <form onSubmit={handleSubmit}>
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
                type="password"
                placeholder="Password*"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
              />
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
          className={styles.loginButton}
          onClick={handleSubmit}
        >
          {loading ? 'Signing in...' : 'Log in'}
        </button>
      </main>

      <FeaturesSection />
      <Footer />
    </div>
  );
}
