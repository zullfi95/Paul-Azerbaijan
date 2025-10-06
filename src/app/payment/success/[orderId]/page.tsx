"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import { useAuth } from '../../../../contexts/AuthContext';
import { API_CONFIG, getAuthHeaders } from '../../../../config/api';

export default function PaymentSuccessPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (orderId && isAuthenticated) {
      handlePaymentSuccess();
    }
  }, [orderId, isAuthenticated, isLoading, router]);

  const handlePaymentSuccess = async () => {
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
            alert('Ödəniş uğurla tamamlandı! Sifarişiniz hazırlanma prosesinə keçdi.');
            router.push('/profile');
          }, 2000);
        } else {
          setError(data.message || 'Ödəniş statusu yoxlanıla bilmədi');
        }
      } else {
        setError('Ödəniş statusu yoxlanıla bilmədi');
      }
    } catch (error) {
      console.error('Payment success handling error:', error);
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

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h1 style={{ color: '#DC2626', marginBottom: '16px' }}>Ödəniş Xətası</h1>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={() => router.push('/profile')}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
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
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ color: '#059669', marginBottom: '16px' }}>Ödəniş Uğurlu!</h1>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Sifarişiniz uğurla ödənildi və hazırlanma prosesinə keçdi.
          </p>
          
          {paymentInfo && (
            <div style={{ 
              background: '#F9FAFB', 
              padding: '20px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <h3 style={{ marginBottom: '12px', color: '#1F2937' }}>Ödəniş Məlumatları</h3>
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Sifariş №:</span>
                  <span style={{ fontWeight: 'bold' }}>{paymentInfo.order_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Məbləğ:</span>
                  <span style={{ fontWeight: 'bold' }}>${paymentInfo.amount_charged}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Status:</span>
                  <span style={{ fontWeight: 'bold', color: '#059669' }}>Ödənildi</span>
                </div>
              </div>
            </div>
          )}
          
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
            Siz avtomatik olaraq profil səhifəsinə yönləndiriləcəksiniz...
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
