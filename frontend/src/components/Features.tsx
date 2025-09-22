export default function Features() {
  const features = [
    {
      id: 1,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12c3-1 6-4 9-4s6 3 9 4c-3 1-6 4-9 4s-6-3-9-4z" />
          <path d="M3 16c3-1 6-4 9-4s6 3 9 4" />
        </svg>
      ),
      title: "Çörəyin ehtirası",
      description: "Nəsilbənəsil ötürülən çörəkçilik sənəti"
    },
    {
      id: 2,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z" />
          <path d="M9 22V12h6v10" />
        </svg>
      ),
      title: "1889-cu ildən ailə evi",
      description: "130 ildən çox təcrübə və ənənə"
    },
    {
      id: 3,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21a8 8 0 0116 0" />
        </svg>
      ),
      title: "Detallarda keyfiyyət",
      description: "Hər məhsul seçilmiş inqrediyentlərlə diqqətlə hazırlanır"
    },
    {
      id: 4,
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 000-7.8z" />
        </svg>
      ),
      title: "Bizim öhdəliklər",
      description: "Davamlı inkişaf və sosial məsuliyyət"
    }
  ];

  return (
    <section style={{
      padding: '4rem 0',
      backgroundColor: 'white'
    }}>
      <div className="container-paul">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {features.map((feature) => (
            <div key={feature.id} style={{ textAlign: 'center' }}>
              {/* Иконка */}
              <div style={{
                width: '5rem',
                height: '5rem',
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                {feature.icon}
              </div>

              {/* Заголовок */}
              <h3 className="font-prata" style={{
                fontSize: '1.25rem',
                fontWeight: 400,
                color: '#1A1A1A',
                marginBottom: '0.75rem'
              }}>
                {feature.title}
              </h3>

              {/* Описание */}
              <p style={{
                color: '#4A4A4A',
                lineHeight: '1.6'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
