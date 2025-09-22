"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { useAuth } from '../../../contexts/AuthContext';
import { Order, API_CONFIG, getAuthHeaders } from '../../../config/api';

export default function PaymentPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
  router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const loadOrder = useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.data.order);
        } else {
          setError('Sifariş tapılmadı');
        }
      } else {
        setError('Sifariş yüklənə bilmədi');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId && isAuthenticated) {
      loadOrder();
    }
  }, [orderId, isAuthenticated, loadOrder]);

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      // Здесь будет интеграция с платежным API
      // Пока что имитируем успешную оплату
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Обновляем статус заказа на "processing"
      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'processing'
        })
      });

      if (response.ok) {
        alert('Ödəniş uğurla tamamlandı! Sifarişiniz hazırlanma prosesinə keçdi.');
        router.push('/profile');
      } else {
        setError('Ödəniş tamamlandı, lakin sifariş statusu yenilənə bilmədi');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Ödəniş zamanı xəta baş verdi');
    } finally {
      setProcessing(false);
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
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ color: '#EF4444', marginBottom: '1rem' }}>Xəta</h2>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>{error}</p>
            <button
              onClick={() => router.push('/profile')}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Profilə qayıt
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <Header />
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '60vh',
          padding: '2rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ color: '#6B7280', marginBottom: '1rem' }}>Sifariş tapılmadı</h2>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
              Bu sifariş mövcud deyil və ya sizə aid deyil.
            </p>
            <button
              onClick={() => router.push('/profile')}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Profilə qayıt
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const deliveryDate = order.delivery_date ? 
    new Date(order.delivery_date).toLocaleDateString('az-AZ') : 
    'Təyin edilməyib';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Header />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            fontFamily: 'Playfair Display, serif'
          }}>
            💳 Ödəniş
          </h1>
          <p style={{
            fontSize: '1rem',
            opacity: 0.9,
            margin: 0
          }}>
            Sifariş #{order.id} üçün ödəniş
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1A1A1A',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📋 Sifariş Məlumatları
          </h2>

          <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#F8FAFC',
              borderRadius: '0.75rem',
              border: '1px solid #E5E7EB'
            }}>
              <span style={{ fontWeight: '600', color: '#4A4A4A' }}>Sifariş №:</span>
              <span style={{ color: '#1A1A1A' }}>{order.id}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#F8FAFC',
              borderRadius: '0.75rem',
              border: '1px solid #E5E7EB'
            }}>
              <span style={{ fontWeight: '600', color: '#4A4A4A' }}>Şirkət:</span>
              <span style={{ color: '#1A1A1A' }}>{order.company_name}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem',
              background: '#F8FAFC',
              borderRadius: '0.75rem',
              border: '1px solid #E5E7EB'
            }}>
              <span style={{ fontWeight: '600', color: '#4A4A4A' }}>Çatdırılma tarixi:</span>
              <span style={{ color: '#1A1A1A' }}>{deliveryDate}</span>
            </div>

            {order.delivery_address && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#F8FAFC',
                borderRadius: '0.75rem',
                border: '1px solid #E5E7EB'
              }}>
                <span style={{ fontWeight: '600', color: '#4A4A4A' }}>Ünvan:</span>
                <span style={{ color: '#1A1A1A' }}>{order.delivery_address}</span>
              </div>
            )}
          </div>

          <div style={{
            background: '#F8FAFC',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid #E5E7EB',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1A1A1A',
              marginBottom: '1rem'
            }}>
              Sifariş Edilən Məhsullar
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {order.menu_items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'white',
                  borderRadius: '0.5rem',
                  border: '1px solid #E5E7EB'
                }}>
                  <span style={{ color: '#1A1A1A' }}>{item.name}</span>
                  <span style={{ fontWeight: '600', color: '#4A4A4A' }}>
                    {item.quantity} ədəd × {item.price} ₼
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
            color: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              margin: '0 0 0.5rem 0'
            }}>
              Ümumi Məbləğ
            </h3>
            <p style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: 0,
              fontFamily: 'Playfair Display, serif'
            }}>
              {order.total_amount.toFixed(2)} ₼
            </p>
          </div>

          <div style={{
            background: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: '#D97706',
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ Ödəniş Tələb Olunur
            </h3>
            <p style={{
              color: '#92400E',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Sifarişinizin hazırlanması üçün ödəniş edilməlidir. 
              Ödəniş edildikdən sonra sifarişiniz hazırlanma prosesinə keçəcək.
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            style={{
              width: '100%',
              background: processing ? 
                'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)' : 
                'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              padding: '1.5rem 2rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: processing ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!processing) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!processing) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }
            }}
          >
            {processing ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Ödəniş edilir...
              </>
            ) : (
              <>
                💳 Ödəniş Et
              </>
            )}
          </button>

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginTop: '1rem',
              color: '#DC2626',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
