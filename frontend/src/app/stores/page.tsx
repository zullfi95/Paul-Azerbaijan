"use client";

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedbackModal from '../../components/FeedbackModal';

const stores = [
  {
    id: 1,
    name: 'PAUL Баку Центр',
    address: 'ул. Низами, 123',
    city: 'Баку',
    postalCode: 'AZ1000',
    phone: '+994 12 345 67 89',
    email: 'baku.center@paul.az',
    hours: {
      weekdays: '6:00 - 22:00',
      weekend: '7:00 - 23:00',
      holidays: '8:00 - 21:00'
    },
    features: ['Пекарня', 'Кафе', 'Кейтеринг', 'Доставка'],
    coordinates: { lat: 40.3777, lng: 49.8920 }
  },
  {
    id: 2,
    name: 'PAUL Баку Молл',
    address: 'ул. Ататюрк, 456',
    city: 'Баку',
    postalCode: 'AZ1001',
    phone: '+994 12 345 67 90',
    email: 'baku.mall@paul.az',
    hours: {
      weekdays: '8:00 - 22:00',
      weekend: '9:00 - 23:00',
      holidays: '9:00 - 22:00'
    },
    features: ['Пекарня', 'Кафе', 'Кейтеринг'],
    coordinates: { lat: 40.4093, lng: 49.8671 }
  },
  {
    id: 3,
    name: 'PAUL Гянджа',
    address: 'ул. Ататюрк, 789',
    city: 'Гянджа',
    postalCode: 'AZ2000',
    phone: '+994 22 345 67 89',
    email: 'ganja@paul.az',
    hours: {
      weekdays: '7:00 - 21:00',
      weekend: '8:00 - 22:00',
      holidays: '8:00 - 21:00'
    },
    features: ['Пекарня', 'Кафе'],
    coordinates: { lat: 40.6828, lng: 46.3606 }
  }
];

export default function StoresPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero секция */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-paul-background-secondary to-paul-accent-bread/30">
        <div className="container-paul text-center">
          <h1 className="text-hero-mobile md:text-hero font-serif font-bold text-paul-primary mb-6">
            Наши магазины
          </h1>
          <p className="text-lg md:text-xl text-paul-secondary max-w-3xl mx-auto">
            Найдите ближайший к вам магазин PAUL и насладитесь 
            аутентичным вкусом французской выпечки.
          </p>
        </div>
      </section>

      {/* Карта */}
      <section className="py-16" style={{ backgroundColor: '#FFFCF8' }}>
        <div className="container-paul">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-serif font-bold text-paul-primary mb-4">
              Расположение магазинов
            </h2>
            <p className="text-lg text-paul-secondary max-w-2xl mx-auto">
              Мы представлены в ключевых городах Азербайджана
            </p>
          </div>
          
          <div className="rounded-2xl p-8" style={{ backgroundColor: '#FFFCF8' }}>
            <div className="w-full h-96 bg-gradient-to-br from-paul-accent-bread/30 to-paul-accent-gold/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-paul-accent-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="text-paul-accent-coffee font-medium">Google Maps</p>
                <p className="text-paul-secondary text-sm">Интерактивная карта всех магазинов</p>
                <p className="text-paul-secondary text-xs mt-2">
                  В будущем здесь будет встроена карта Google Maps
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Список магазинов */}
      <section className="section-padding bg-paul-background-secondary">
        <div className="container-paul">
          <div className="text-center mb-16">
            <h2 className="text-h2 font-serif font-bold text-paul-primary mb-4">
              Все магазины PAUL
            </h2>
            <p className="text-lg text-paul-secondary max-w-2xl mx-auto">
              Выберите удобное для вас место и время посещения
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {stores.map((store) => (
              <div key={store.id} className="rounded-2xl overflow-hidden card-hover" style={{ backgroundColor: '#FFFCF8' }}>
                {/* Заголовок магазина */}
                <div className="bg-gradient-to-r from-paul-primary to-paul-accent-coffee p-6 text-white">
                  <h3 className="font-serif font-bold text-xl mb-2">{store.name}</h3>
                  <p className="text-paul-accent-bread">{store.city}</p>
                </div>

                {/* Информация о магазине */}
                <div className="p-6 space-y-4">
                  {/* Адрес */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-paul-primary font-medium">Адрес</p>
                      <p className="text-paul-secondary text-sm">
                        {store.address}<br />
                        {store.city}, {store.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Телефон */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-paul-primary font-medium">Телефон</p>
                      <a 
                        href={`tel:${store.phone}`}
                        className="text-paul-accent-coffee hover:text-paul-accent-coffee/80 transition-colors text-sm"
                      >
                        {store.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-paul-primary font-medium">Email</p>
                      <a 
                        href={`mailto:${store.email}`}
                        className="text-paul-accent-coffee hover:text-paul-accent-coffee/80 transition-colors text-sm"
                      >
                        {store.email}
                      </a>
                    </div>
                  </div>

                  {/* Часы работы */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-paul-primary font-medium">Часы работы</p>
                      <div className="text-paul-secondary text-sm space-y-1">
                        <p><strong>Пн-Пт:</strong> {store.hours.weekdays}</p>
                        <p><strong>Сб-Вс:</strong> {store.hours.weekend}</p>
                        <p><strong>Праздники:</strong> {store.hours.holidays}</p>
                      </div>
                    </div>
                  </div>

                  {/* Услуги */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-paul-primary font-medium">Услуги</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {store.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-paul-accent-bread/30 text-paul-accent-coffee text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="p-6 pt-0 space-y-3">
                  <button className="w-full btn-primary text-sm py-3">
                    Построить маршрут
                  </button>
                  <button className="w-full btn-secondary text-sm py-3">
                    Позвонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="section-padding bg-paul-primary text-white">
        <div className="container-paul text-center">
          <h2 className="text-h2 font-serif font-bold mb-6">
            Не можете найти подходящий магазин?
          </h2>
          <p className="text-lg text-paul-accent-bread mb-8 max-w-2xl mx-auto">
            Мы предлагаем доставку по всему городу и кейтеринг для ваших событий. 
            Свяжитесь с нами, и мы найдем решение!
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
