import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero секция */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-paul-background-secondary to-paul-accent-bread/30">
        <div className="container-paul text-center">
          <h1 className="text-hero-mobile md:text-hero font-serif font-bold text-paul-primary mb-6">
            О бренде PAUL
          </h1>
          <p className="text-lg md:text-xl text-paul-secondary max-w-3xl mx-auto">
            История французской пекарни, которая покорила мир и теперь 
            приносит аутентичный вкус Франции в Азербайджан.
          </p>
        </div>
      </section>

      {/* История бренда */}
      <section className="section-padding" style={{ backgroundColor: '#FFFCF8' }}>
        <div className="container-paul">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-h2 font-serif font-bold text-paul-primary mb-6">
                История длиною в век
              </h2>
              <div className="space-y-6 text-paul-secondary">
                <p>
                  PAUL был основан в 1889 году в городе Круа, Франция, 
                  как небольшая семейная пекарня. С тех пор мы сохраняем 
                  традиции французской выпечки, передавая их из поколения в поколение.
                </p>
                <p>
                  Сегодня PAUL — это международная сеть пекарен, представленная 
                  в более чем 30 странах мира. Каждая пекарня следует 
                  оригинальным рецептам и использует только качественные ингредиенты.
                </p>
                <p>
                  В 2024 году мы открыли первую пекарню PAUL в Баку, 
                  принеся в Азербайджан аутентичный вкус Франции и 
                  культуру качественной выпечки.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-gradient-to-br from-paul-accent-bread/30 to-paul-accent-gold/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-paul-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8.5v7m0-7l-3-3m3 3l3-3M12 8.5c0-1.5-1.5-3-3-3s-3 1.5-3 3 1.5 3 3 3 3-1.5 3-3z" />
                    </svg>
                  </div>
                  <p className="text-paul-accent-coffee font-medium">1889</p>
                  <p className="text-paul-secondary text-sm">Год основания</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Наши ценности */}
      <section className="section-padding bg-paul-background-secondary">
        <div className="container-paul">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-serif font-bold text-paul-primary mb-4">
              Наши ценности
            </h2>
            <p className="text-lg text-paul-secondary max-w-2xl mx-auto">
              Принципы, которые лежат в основе всего, что мы делаем
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-paul-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif font-semibold text-paul-primary text-xl mb-4">
                Качество
              </h3>
              <p className="text-paul-secondary">
                Мы используем только лучшие ингредиенты и следуем 
                традиционным рецептам для создания непревзойденного вкуса.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-paul-accent-bread/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-serif font-semibold text-paul-primary text-xl mb-4">
                Традиции
              </h3>
              <p className="text-paul-secondary">
                Мы бережно храним вековые традиции французской выпечки, 
                передавая их нашим клиентам в каждой булочке.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-paul-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-serif font-semibold text-paul-primary text-xl mb-4">
                Инновации
              </h3>
              <p className="text-paul-secondary">
                Сохраняя традиции, мы постоянно развиваемся и создаем 
                новые вкусы для современных гурманов.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Наша команда */}
      <section className="section-padding" style={{ backgroundColor: '#FFFCF8' }}>
        <div className="container-paul">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-serif font-bold text-paul-primary mb-4">
              Наша команда
            </h2>
            <p className="text-lg text-paul-secondary max-w-2xl mx-auto">
              Профессионалы, которые создают магию PAUL каждый день
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Пьер Дюбуа',
                role: 'Главный шеф-пекарь',
                description: 'Французский мастер с 20-летним опытом'
              },
              {
                name: 'Мария Ахмедова',
                role: 'Шеф-кондитер',
                description: 'Специалист по французским десертам'
              },
              {
                name: 'Александр Петров',
                role: 'Менеджер по кейтерингу',
                description: 'Организует незабываемые события'
              },
              {
                name: 'Эльмира Гусейнова',
                role: 'Директор по качеству',
                description: 'Контролирует стандарты PAUL'
              }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-paul-accent-bread/30 to-paul-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-20 h-20 bg-paul-accent-gold/20 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="font-serif font-semibold text-paul-primary text-lg mb-2">
                  {member.name}
                </h3>
                <p className="text-paul-accent-coffee font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-paul-secondary text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="section-padding bg-paul-primary text-white">
        <div className="container-paul text-center">
          <h2 className="text-h2 font-serif font-bold mb-6">
            Присоединяйтесь к семье PAUL
          </h2>
          <p className="text-lg text-paul-accent-bread mb-8 max-w-2xl mx-auto">
            Откройте для себя мир французской выпечки и станьте 
            частью нашей истории. Мы ждем вас в наших пекарнях!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/catering" className="btn-primary bg-white text-paul-primary hover:bg-paul-accent-gold hover:text-white">
              Заказать кейтеринг
            </a>
            <a href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-paul-primary">
              Связаться с нами
            </a>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}
