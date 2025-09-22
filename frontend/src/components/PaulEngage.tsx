import Link from 'next/link';

export default function PaulEngage() {
  return (
    <section style={{
      padding: '4rem 0',
      backgroundColor: '#F9F9F6'
    }}>
      <div className="container-paul">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '4rem',
          alignItems: 'center'
        }}>
          {/* Левая колонка - текст */}
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="font-prata" style={{
              fontSize: '2rem',
              fontWeight: 400,
              color: '#1A1A1A',
              marginBottom: '2rem',
              lineHeight: '1.3'
            }}>
              Sağlam və müxtəlif qidalanmanı müdafiə etmək, birlikdə yaxşı yaşamağın mənbəyidir.
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#4A4A4A',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              PAUL davamlı və məsuliyyətli təşəbbüsləri dəstəkləməyə, keyfiyyətli qidalanmanı hər kəsə əlçatan etməyə söz verir.
            </p>
                         <Link 
               href="/engagements" 
               className="btn-secondary"
             >
               Ətraflı məlumat
             </Link>
          </div>

          {/* Правая колонка - логотип и изображение */}
          <div style={{ textAlign: 'center' }}>
            {/* Заголовки */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 className="font-prata" style={{
                fontSize: '1.5rem',
                fontWeight: 400,
                color: '#1A1A1A',
                marginBottom: '0.5rem'
              }}>
                QİDA
              </h3>
              <h3 className="font-prata" style={{
                fontSize: '1.5rem',
                fontWeight: 400,
                color: '#1A1A1A',
                marginBottom: '0.5rem'
              }}>
                ƏTRAF MÜHİT
              </h3>
              <h3 className="font-prata" style={{
                fontSize: '1.5rem',
                fontWeight: 400,
                color: '#1A1A1A'
              }}>
                CƏMİYYƏT
              </h3>
            </div>

            {/* Логотип PAUL s'engage */}
            <div style={{ padding: '2rem 0' }}>
              <h2 className="font-prata" style={{
                fontSize: '2.5rem',
                fontWeight: 400,
                color: '#1A1A1A',
                letterSpacing: '0.1em'
              }}>
                PAUL öhdəlik götürür
              </h2>
            </div>

            {/* Изображение */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{
                width: '16rem',
                height: '16rem',
                background: 'linear-gradient(135deg, #E8D5B7 0%, #D4AF37 100%)',
                borderRadius: '50%',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <span style={{ fontSize: '6rem' }}>🌱</span>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: '1rem' }}>
                    Davamlı inkişaf
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
