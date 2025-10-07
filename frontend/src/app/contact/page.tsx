"use client";

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Имитация отправки формы
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }, 2000);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero секция */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-paul-background-secondary to-paul-accent-bread/30">
        <div className="container-paul text-center">
          <h1 className="text-hero-mobile md:text-hero font-serif font-bold text-paul-primary mb-6">
            Свяжитесь с нами
          </h1>
          <p className="text-lg md:text-xl text-paul-secondary max-w-3xl mx-auto">
            Мы всегда рады услышать от вас. Свяжитесь с нами для заказа кейтеринга, 
            вопросов о наших услугах или просто для приятной беседы о выпечке.
          </p>
        </div>
      </section>

      {/* Контактная информация */}
      <section className="section-padding" style={{ backgroundColor: '#FFFCF8' }}>
        <div className="container-paul">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Контактные данные */}
            <div>
              <h2 className="text-h2 font-serif font-bold text-paul-primary mb-8">
                Контактная информация
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-paul-primary text-lg mb-2">
                      Адрес
                    </h3>
                    <p className="text-paul-secondary">
                      ул. Низами, 123<br />
                      Баку, Азербайджан<br />
                      AZ1000
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-paul-primary text-lg mb-2">
                      Телефон
                    </h3>
                    <p className="text-paul-secondary">
                      <a href="tel:+994123456789" className="hover:text-paul-accent-coffee transition-colors">
                        +994 12 345 67 89
                      </a><br />
                      <a href="tel:+994123456790" className="hover:text-paul-accent-coffee transition-colors">
                        +994 12 345 67 90
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-paul-primary text-lg mb-2">
                      Email
                    </h3>
                    <p className="text-paul-secondary">
                      <a href="mailto:info@paul.az" className="hover:text-paul-accent-coffee transition-colors">
                        info@paul.az
                      </a><br />
                      <a href="mailto:catering@paul.az" className="hover:text-paul-accent-coffee transition-colors">
                        catering@paul.az
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-paul-accent-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-paul-accent-coffee" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-paul-primary text-lg mb-2">
                      Часы работы
                    </h3>
                    <p className="text-paul-secondary">
                      <strong>Понедельник - Пятница:</strong> 6:00 - 22:00<br />
                      <strong>Суббота - Воскресенье:</strong> 7:00 - 23:00<br />
                      <strong>Праздничные дни:</strong> 8:00 - 21:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Социальные сети */}
              <div className="mt-12">
                <h3 className="font-serif font-semibold text-paul-primary text-lg mb-4">
                  Мы в социальных сетях
                </h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-12 h-12 bg-paul-accent-coffee/20 rounded-full flex items-center justify-center hover:bg-paul-accent-gold transition-colors">
                    <svg className="w-6 h-6 text-paul-accent-coffee" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-12 h-12 bg-paul-accent-coffee/20 rounded-full flex items-center justify-center hover:bg-paul-accent-gold transition-colors">
                    <svg className="w-6 h-6 text-paul-accent-coffee" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-12 h-12 bg-paul-accent-coffee/20 rounded-full flex items-center justify-center hover:bg-paul-accent-gold transition-colors">
                    <svg className="w-6 h-6 text-paul-accent-coffee" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Форма обратной связи */}
            <div className="bg-paul-background-secondary rounded-2xl p-8">
              <h3 className="font-serif font-semibold text-paul-primary text-xl mb-6">
                Напишите нам
              </h3>
              
              {submitStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  ✅ Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  ❌ Произошла ошибка при отправке. Попробуйте еще раз.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-paul-primary mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-paul-accent-bread/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-paul-accent-gold focus:border-transparent"
                    placeholder="Введите ваше имя"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-paul-primary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-paul-accent-bread/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-paul-accent-gold focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-paul-primary mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-paul-accent-bread/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-paul-accent-gold focus:border-transparent"
                    placeholder="+994 12 345 67 89"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-paul-primary mb-2">
                    Тема *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-paul-accent-bread/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-paul-accent-gold focus:border-transparent"
                  >
                    <option value="">Выберите тему</option>
                    <option value="catering">Заказ кейтеринга</option>
                    <option value="general">Общий вопрос</option>
                    <option value="feedback">Отзыв</option>
                    <option value="partnership">Сотрудничество</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-paul-primary mb-2">
                    Сообщение *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-paul-accent-bread/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-paul-accent-gold focus:border-transparent resize-none"
                    placeholder="Опишите ваш вопрос или пожелание..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full btn-primary py-3 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Карта */}
      <section className="py-16 bg-paul-background-secondary">
        <div className="container-paul">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-serif font-bold text-paul-primary mb-4">
              Как нас найти
            </h2>
            <p className="text-lg text-paul-secondary max-w-2xl mx-auto">
              Мы находимся в центре Баку, рядом с главными достопримечательностями города
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
                <p className="text-paul-secondary text-sm">ул. Низами, 123, Баку</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
