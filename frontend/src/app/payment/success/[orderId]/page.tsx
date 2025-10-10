"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import FeedbackModal from '../../../../components/FeedbackModal';
import { useAuth } from '../../../../contexts/AuthContext';
import { API_CONFIG, getAuthHeaders } from '../../../../config/api';

export default function PaymentSuccessPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const handlePaymentSuccess = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Обрабатываем успешный возврат с Payment Page
      const response = await fetch(`${API_CONFIG.BASE_URL}/payment/orders/${orderId}/success`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentInfo(data.data);
          
          // Показываем уведомление об успехе
          setTimeout(() => {
            alert('Payment completed successfully! Your order is now being processed.');
            router.push('/');
          }, 2000);
        } else {
          setError(data.message || 'Payment status could not be verified');
        }
      } else {
        setError('Payment status could not be verified');
      }
    } catch (error) {
      console.error('Payment success handling error:', error);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (orderId && isAuthenticated) {
      handlePaymentSuccess();
    }
  }, [orderId, isAuthenticated, isLoading, router, handlePaymentSuccess]);

  if (isLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFCF8' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #000000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFCF8' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h1 style={{ 
              color: '#DC2626', 
              marginBottom: '16px',
              fontSize: '26px',
              fontFamily: 'Sabon Next LT Pro, serif',
              fontWeight: 'bold'
            }}>
              Payment Error
            </h1>
            <p style={{ 
              color: '#6B7280', 
              marginBottom: '24px',
              fontSize: '18px',
              fontFamily: 'Sabon Next LT Pro, serif'
            }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                background: '#000000',
                color: '#FFFAE6',
                padding: '20px 40px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                fontWeight: 'bold',
                fontFamily: 'Sabon Next LT Pro, serif',
                minWidth: '323px',
                height: '80px'
              }}
            >
              Homepage
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFCF8' }}>
      <Header />
      
      {/* Breadcrumbs */}
      <div style={{ padding: '20px 101px', backgroundColor: '#FFFCF8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: 'rgba(0,0,0,0.7)' }}>
          <a href="/" style={{ textDecoration: 'none', color: 'rgba(0,0,0,0.7)' }}>Home</a>
          <span>/</span>
          <a href="/catering" style={{ textDecoration: 'none', color: 'rgba(0,0,0,0.7)' }}>Catering Menu</a>
          <span>/</span>
          <a href="/checkout" style={{ textDecoration: 'none', color: 'rgba(0,0,0,0.7)' }}>Shopping Cart</a>
          <span>/</span>
          <span style={{ color: 'rgba(0,0,0,0.8)', fontWeight: 'bold' }}>Payment</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          {/* Main heading */}
          <h1 style={{ 
            fontSize: '26px', 
            fontWeight: 'bold', 
            color: '#000000', 
            marginBottom: '40px',
            fontFamily: 'Sabon Next LT Pro, serif'
          }}>
            Payment Details
          </h1>
          
          {/* Success message */}
          <p style={{ 
            fontSize: '24px', 
            color: '#000000', 
            marginBottom: '40px',
            fontFamily: 'Sabon Next LT Pro, serif',
            fontWeight: 'bold',
            lineHeight: '1.4'
          }}>
            Your payment has been done successfully. We have send a receipt to{' '}
            <span style={{ textDecoration: 'underline' }}>your email</span>.
          </p>
          
          {/* Call to action */}
          <p style={{ 
            fontSize: '24px', 
            color: '#000000', 
            marginBottom: '40px',
            fontFamily: 'Sabon Next LT Pro, serif',
            fontWeight: 'bold',
            lineHeight: '1.4'
          }}>
            Go to{' '}
            <span style={{ textDecoration: 'underline' }}>My account</span>
            {' '}to track your order
          </p>
          
          {/* Homepage button */}
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#000000',
              color: '#FFFAE6',
              padding: '20px 40px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: 'Sabon Next LT Pro, serif',
              minWidth: '323px',
              height: '80px'
            }}
          >
            Homepage
          </button>
        </div>
      </div>
      
      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}
