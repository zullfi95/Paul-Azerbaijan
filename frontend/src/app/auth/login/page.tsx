"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import FeaturesSection from '../../../components/FeaturesSection';

export default function LoginPage() {
  const router = useRouter();
  const [next, setNext] = useState<string>('/');
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const n = params.get('next') || '/';
      setNext(n);
    } catch (_err) {
      setNext('/');
    }
  }, []);
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      // Redirect back to `next`
      router.push(next);
    } else {
      setError('Login failed. Check credentials.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff'
    }}>
      <Header />
      
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 'normal',
            marginBottom: '0.5rem',
            fontFamily: 'Times New Roman, serif',
            color: '#000'
          }}>
            Log in
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            margin: 0
          }}>
            Log in to continue shopping
          </p>
        </div>

        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#000',
          padding: '2.5rem',
          color: '#fff'
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div>
              <label htmlFor="email" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                Email*
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#fff',
                  border: '1px solid #000',
                  color: '#000',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'Arial, sans-serif'
              }}>
                Password*
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#fff',
                  border: '1px solid #000',
                  color: '#000',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {error && (
              <div style={{
                color: '#fff',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#fff',
                color: '#000',
                border: 'none',
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {loading ? 'Signing in...' : 'Log in'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                Don't have an account? {' '}
              </span>
              <Link href="/auth/register" style={{
                color: '#fff',
                textDecoration: 'underline',
                fontSize: '0.875rem'
              }}>
                Create account
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Features section */}
      <section style={{
        borderTop: '1px solid #e5e7eb',
        padding: '3rem 2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        textAlign: 'center',
        backgroundColor: '#fff'
      }}>
        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 'normal',
            marginBottom: '0.5rem',
            fontFamily: 'Times New Roman, serif'
          }}>
            Quality at Heart
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>
            Delivering the highest standard in all we do
          </p>
        </div>

        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 'normal',
            marginBottom: '0.5rem',
            fontFamily: 'Times New Roman, serif'
          }}>
            Passion for Bread
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>
            Freshly baked everyday
          </p>
        </div>

        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 'normal',
            marginBottom: '0.5rem',
            fontFamily: 'Times New Roman, serif'
          }}>
            French Tradition
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>
            Taste of France at your local bakery
          </p>
        </div>

        <div>
          <h3 style={{
            fontSize: '0.875rem',
            fontWeight: 'normal',
            marginBottom: '0.5rem',
            fontFamily: 'Times New Roman, serif'
          }}>
            Family-Owned Company
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>
            Established since 1889
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
