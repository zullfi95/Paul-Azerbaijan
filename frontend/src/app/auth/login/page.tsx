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
  const [next, setNext] = useState<string>('/');
  
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const n = params.get('next') || '/';
      setNext(n);
    } catch {
      setNext('/');
    }
  }, []);
  
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      // Редирект на указанную страницу или по умолчанию
      if (next && next !== '/') {
        router.push(next);
      } else {
        // Если пользователь клиент - редирект на профиль, иначе на дашборд
        if (user?.user_type === 'client') {
          router.push('/profile');
        } else {
          router.push('/dashboard');
        }
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
                type={showPassword ? "text" : "password"}
                placeholder="Password*"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '◉' : '○'}
              </button>
            </div>

            <div className={styles.forgotPasswordSection}>
              <Link href="/auth/forgot-password" className={styles.forgotPasswordLink}>
                Forgot password?
              </Link>
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
