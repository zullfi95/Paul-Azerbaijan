"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../contexts/AuthContext';
import { API_CONFIG, getAuthHeaders } from '../../../../config/api';

export default function PaymentFailurePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const handlePaymentFailure = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Обрабатываем неуспешный возврат с Payment Page
      const response = await fetch(`${API_CONFIG.BASE_URL}/payment/orders/${orderId}/failure`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentInfo(data.data);
        } else {
          setError(data.message || 'Ödəniş statusu yoxlanıla bilmədi');
        }
      } else {
        setError('Ödəniş statusu yoxlanıla bilmədi');
      }
    } catch (error) {
      console.error('Payment failure handling error:', error);
      setError('Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (orderId && isAuthenticated) {
      handlePaymentFailure();
    }
  }, [orderId, isAuthenticated, isLoading, router, handlePaymentFailure]);

  const handleRetryPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Создаем новый платеж
      const response = await fetch(`${API_CONFIG.BASE_URL}/payment/orders/${orderId}/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.payment_url) {
          // Перенаправляем на Payment Page
          window.location.href = data.data.payment_url;
        } else {
          setError(data.message || 'Yeni ödəniş yaradıla bilmədi');
        }
      } else {
        setError('Yeni ödəniş yaradıla bilmədi');
      }
    } catch (error) {
      console.error('Retry payment error:', error);
      setError('Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #E5E7EB',
          borderTop: '4px solid #3B82F6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h1 style={{ color: '#DC2626', marginBottom: '16px' }}>Ödəniş Uğursuz</h1>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Ödəniş tamamlanmadı. Zəhmət olmasa yenidən cəhd edin.
          </p>
          
          {paymentInfo && (
            <div style={{ 
              background: '#FEF2F2', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'left',
              border: '1px solid #FECACA'
            }}>
              <h3 style={{ marginBottom: '12px', color: '#1F2937' }}>Ödəniş Məlumatları</h3>
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Sifariş №:</span>
                  <span style={{ fontWeight: 'bold' }}>{paymentInfo.order_id as string}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Cəhd sayı:</span>
                  <span style={{ fontWeight: 'bold' }}>{paymentInfo.attempts as number}/3</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Status:</span>
                  <span style={{ fontWeight: 'bold', color: '#DC2626' }}>Uğursuz</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ 
              background: '#FEF2F2', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              border: '1px solid #FECACA'
            }}>
              <p style={{ color: '#DC2626', margin: 0 }}>{error}</p>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(paymentInfo?.can_retry as boolean) && (
              <button
                onClick={handleRetryPayment}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Yüklənir...' : 'Yenidən Cəhd Et'}
              </button>
            )}
            
            <button
              onClick={() => router.push('/profile')}
              style={{
                background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Profilə Qayıt
            </button>
          </div>

          {paymentInfo && !(paymentInfo.can_retry as boolean) && (
            <div style={{ 
              background: '#FEF3C7', 
              padding: '16px', 
              borderRadius: '8px', 
              marginTop: '24px',
              border: '1px solid #FCD34D'
            }}>
              <p style={{ color: '#92400E', margin: 0, fontSize: '14px' }}>
                ⚠️ Maksimum cəhd sayına (3) çatdınız. Zəhmət olmasa dəstək xidməti ilə əlaqə saxlayın.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
