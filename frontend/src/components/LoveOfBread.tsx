export default function LoveOfBread() {
  return (
    <section style={{
      padding: '4rem 0',
      backgroundColor: 'white'
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: 'rgba(232, 213, 183, 0.3)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '2rem' }}>👨‍🍳</span>
              </div>
              <h2 className="font-prata" style={{
                fontSize: '2rem',
                fontWeight: 400,
                color: '#1A1A1A'
              }}>
                Çörəyin sevgi
              </h2>
            </div>
            
            <p style={{
              fontSize: '1.125rem',
              color: '#4A4A4A',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Su, un, maya, duz, bacarıq və səbir. Hər gün biz sizə təzə, müxtəlif və keyfiyyətli çörək təqdim etməyə söz veririk, 
              fransız çörəkçilik ənənələrini qoruyaraq.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#E8D5B7', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4A4A4A' }}>Su</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#E8D5B7', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4A4A4A' }}>Un</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#E8D5B7', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4A4A4A' }}>Maya</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#E8D5B7', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4A4A4A' }}>Duz</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#E8D5B7', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4A4A4A' }}>Bacarıq</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#E8D5B7', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.875rem', color: '#4A4A4A' }}>Səbir</span>
              </div>
            </div>
          </div>

          {/* Правая колонка - изображение */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              aspectRatio: '1',
              background: 'linear-gradient(135deg, #E8D5B7 0%, #D4AF37 100%)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '2rem' }}>🥖</span>
                  </div>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '2rem' }}>🌾</span>
                  </div>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '2rem' }}>❤️</span>
                  </div>
                </div>
                <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>Gündəlik təzə çörək</p>
                <p style={{ fontSize: '0.875rem', opacity: 0.75 }}>Fransız ənənəsi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
