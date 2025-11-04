"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import styles from '../login/LoginPage.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // TODO: Реализовать API endpoint для сброса пароля
      // const response = await fetch('/api/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // Временная заглушка
      setMessage('Функция восстановления пароля находится в разработке. Пожалуйста, обратитесь к администратору.');
      
    } catch (err) {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <Header />
      
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginCardInner}>
            <h2 className={styles.loginTitle}>Восстановление пароля</h2>
            <p className={styles.loginSubtitle}>
              Введите ваш email для получения инструкций по сбросу пароля
            </p>

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formField}>
                <input
                  type="email"
                  placeholder="Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              {message && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: '0.5rem',
                  color: '#166534',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Отправка...' : 'Восстановить пароль'}
              </button>
            </form>

            <div className={styles.registerSection}>
              <span className={styles.registerText}>Вспомнили пароль? </span>
              <Link href="/auth/login" className={styles.registerLink}>
                Войти
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.loginImageContainer}>
          <div className={styles.loginImageContent}>
            <h3 className={styles.imageTitle}>
              Восстановление доступа
            </h3>
            <p className={styles.imageText}>
              Мы отправим вам инструкции по восстановлению пароля на указанный email
            </p>
            <ul className={styles.featuresList}>
              <li>Безопасная процедура сброса</li>
              <li>Быстрое восстановление доступа</li>
              <li>Поддержка 24/7</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

