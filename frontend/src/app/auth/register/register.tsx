"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: ""
  });

  // Валидация на фронтенде
  const [frontendErrors, setFrontendErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Вспомогательные состояния и функции UI
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const formatAzPhone = (inputValue: string): string => {
    const digitsOnly = inputValue.replace(/\D/g, "");
    let local = digitsOnly;
    if (local.startsWith("994")) {
      local = local.slice(3);
    } else if (local.startsWith("0")) {
      local = local.slice(1);
    }
    local = local.slice(0, 9);
    if (local.length === 0) return "";
    if (local.length <= 2) return `+994 ${local}`;
    if (local.length <= 5) return `+994 ${local.slice(0,2)} ${local.slice(2)}`;
    if (local.length <= 7) return `+994 ${local.slice(0,2)} ${local.slice(2,5)} ${local.slice(5)}`;
    return `+994 ${local.slice(0,2)} ${local.slice(2,5)} ${local.slice(5,7)} ${local.slice(7,9)}`;
  };

  const sanitizePhoneForSubmit = (formatted: string): string => {
    // Оставляем только + и цифры
    return formatted.replace(/[^\d+]/g, "");
  };

  const getPasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    // Возвращаем значение 0..4
    return Math.min(score, 4);
  };

  // Функция валидации на фронтенде
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Обязательные поля
    if (!formData.name.trim()) {
      errors.name = 'Adınızı daxil edin';
    }

    if (!formData.email.trim()) {
      errors.email = 'E-poçt ünvanınızı daxil edin';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Düzgün e-poçt ünvanı daxil edin';
    }

    if (!formData.password) {
      errors.password = 'Şifrəni daxil edin';
    } else if (formData.password.length < 8) {
      errors.password = 'Şifrə ən azı 8 simvol olmalıdır';
    }

    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Şifrələr uyğun gəlmir';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Telefon nömrəsini daxil edin';
    }

    setFrontendErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'phone' ? formatAzPhone(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
    
    // Очищаем ошибки при изменении
    setError("");
    setValidationErrors({});
    if (frontendErrors[name]) {
      setFrontendErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Сначала валидируем на фронтенде
    if (!validateForm()) {
      return; // Останавливаем отправку если есть ошибки
    }

    setIsLoading(true);
    setError("");
    setValidationErrors({});

    try {
      const sanitizedPhone = sanitizePhoneForSubmit(formData.phone);
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          user_group: 'client',
          client_category: 'one_time',
          phone: sanitizedPhone,
          status: 'active'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Qeydiyyat uğurla başa çatdı! Yönləndirilir...");
        // Сохраняем данные клиента для автозаполнения формы заказа
        const clientData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          client_category: 'one_time',
          user_group: 'client'
        };
        localStorage.setItem('client_registration_data', JSON.stringify(clientData));

        // Перенаправляем на кейтеринг
        setTimeout(() => {
          router.push('/catering');
        }, 1500);
      } else {
        if (data.errors) {
          setValidationErrors(data.errors);
          // Показываем общую ошибку если есть
          if (data.message) {
            setError(data.message);
          }
        } else {
          setError(data.message || 'Qeydiyyat zamanı xəta baş verdi');
        }
      }
    } catch (error) {
      setError('Server ilə əlaqə xətası');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F9F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
        {/* Header внутри карточки в стиле главной */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className="font-prata" style={{ fontSize: '1.875rem', fontWeight: 400, color: '#1A1A1A', margin: 0, letterSpacing: '0.05em' }}>PAUL</h1>
                </Link>
          <p style={{ color: '#4A4A4A', marginTop: '0.5rem' }}>Qeydiyyat səhifəsi</p>
            </div>
              {/* Сообщения об ошибках и успехе */}
              {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span>{error}</span>
                </div>
              )}
              {success && (
          <div style={{ backgroundColor: '#E6F7ED', color: '#0F5132', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <span>{success}</span>
                </div>
              )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Ad və Soyad */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', color: '#1A1A1A', fontWeight: 500 }}>Ad və Soyad</label>
            <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                autoComplete="name"
                aria-invalid={Boolean(validationErrors.name || frontendErrors.name)}
                aria-describedby={validationErrors.name || frontendErrors.name ? 'name-error' : undefined}
                      disabled={isLoading}
                      placeholder="Məsələn: İlham Əliyev"
                style={{ width: '80%', padding: '0.75rem 0.875rem 0.75rem 2.25rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none', transition: 'box-shadow 0.2s ease' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </span>
                  </div>
                  {(validationErrors.name || frontendErrors.name) && (
              <p id="name-error" style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.375rem' }}>{frontendErrors.name || validationErrors.name?.[0]}</p>
                  )}
                </div>

          {/* E-poçt */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#1A1A1A', fontWeight: 500 }}>E-poçt</label>
            <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                autoComplete="email"
                aria-invalid={Boolean(validationErrors.email || frontendErrors.email)}
                aria-describedby={validationErrors.email || frontendErrors.email ? 'email-error' : undefined}
                      disabled={isLoading}
                      placeholder="example@email.com"
                style={{ width: '80%', padding: '0.75rem 0.875rem 0.75rem 2.25rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none', transition: 'box-shadow 0.2s ease' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </span>
                  </div>
                  {(validationErrors.email || frontendErrors.email) && (
              <p id="email-error" style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.375rem' }}>{frontendErrors.email || validationErrors.email?.[0]}</p>
                  )}
                </div>

          {/* Telefon */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', color: '#1A1A1A', fontWeight: 500 }}>Telefon nömrəsi</label>
            <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                autoComplete="tel"
                inputMode="tel"
                pattern="\+994\s\d{2}\s\d{3}\s\d{2}\s\d{2}"
                title="Format: +994 50 123 45 67"
                aria-invalid={Boolean(validationErrors.phone || frontendErrors.phone)}
                aria-describedby={validationErrors.phone || frontendErrors.phone ? 'phone-error' : undefined}
                      disabled={isLoading}
                      placeholder="+994 50 123 45 67"
                style={{ width: '80%', padding: '0.75rem 0.875rem 0.75rem 2.25rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none', transition: 'box-shadow 0.2s ease' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              </span>
                  </div>
                  {(validationErrors.phone || frontendErrors.phone) && (
              <p id="phone-error" style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.375rem' }}>{frontendErrors.phone || validationErrors.phone?.[0]}</p>
                  )}
                </div>

          {/* Şifrə */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#1A1A1A', fontWeight: 500 }}>Şifrə</label>
            <div style={{ position: 'relative' }}>
                    <input
                type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                autoComplete="new-password"
                minLength={8}
                aria-invalid={Boolean(validationErrors.password || frontendErrors.password)}
                aria-describedby={`password-hint ${validationErrors.password || frontendErrors.password ? 'password-error' : ''}`.trim()}
                      disabled={isLoading}
                      placeholder="Ən azı 8 simvol"
                style={{ width: '80%', padding: '0.75rem 2.5rem 0.75rem 2.25rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none', transition: 'box-shadow 0.2s ease' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </span>
              <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: '#9CA3AF', padding: '0.25rem' }}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.02.39-2.06 1.07-3.05M21 12c0 1.03-.39 2.07-1.08 3.06"/><path d="M10.58 10.58a2 2 0 102.83 2.83"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {/* Индикатор надёжности */}
            <div id="password-hint" style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem' }}>
                {Array.from({ length: 4 }).map((_, i) => {
                  const active = i < getPasswordStrength(formData.password);
                  const colors = ['#EF4444', '#F59E0B', '#D4AF37', '#1A1A1A'];
                  return (
                    <div key={i} style={{ height: '6px', borderRadius: '999px', backgroundColor: active ? colors[i] : '#E5E7EB', transition: 'background-color 0.2s ease' }} />
                  );
                })}
                    </div>
              <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#6B7280' }}>Uzun və mürəkkəb şifrə istifadə edin</p>
                  </div>
                  {(validationErrors.password || frontendErrors.password) && (
              <p id="password-error" style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.375rem' }}>{frontendErrors.password || validationErrors.password?.[0]}</p>
                  )}
                </div>

          {/* Şifrəni təsdiqləyin */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="password_confirmation" style={{ display: 'block', marginBottom: '0.5rem', color: '#1A1A1A', fontWeight: 500 }}>Şifrəni təsdiqləyin</label>
            <div style={{ position: 'relative' }}>
                    <input
                type={showPasswordConfirm ? 'text' : 'password'}
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                autoComplete="new-password"
                aria-invalid={Boolean(validationErrors.password_confirmation || frontendErrors.password_confirmation)}
                aria-describedby={validationErrors.password_confirmation || frontendErrors.password_confirmation ? 'password_confirmation-error' : undefined}
                      disabled={isLoading}
                      placeholder="Şifrəni təkrar daxil edin"
                style={{ width: '80%', padding: '0.75rem 2.5rem 0.75rem 2.25rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', outline: 'none', transition: 'box-shadow 0.2s ease' }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              />
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </span>
              <button type="button" onClick={() => setShowPasswordConfirm(v => !v)} aria-label={showPasswordConfirm ? 'Şifrəni gizlət' : 'Şifrəni göstər'} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', color: '#9CA3AF', padding: '0.25rem' }}>
                {showPasswordConfirm ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7 0-1.02.39-2.06 1.07-3.05M21 12c0 1.03-.39 2.07-1.08 3.06"/><path d="M10.58 10.58a2 2 0 102.83 2.83"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
                  </div>
                  {(validationErrors.password_confirmation || frontendErrors.password_confirmation) && (
              <p id="password_confirmation-error" style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.375rem' }}>{frontendErrors.password_confirmation || validationErrors.password_confirmation?.[0]}</p>
                  )}
                </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading} style={{ width: '100%', backgroundColor: '#1A1A1A', color: 'white', padding: '0.875rem', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.8 : 1, transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.backgroundColor = '#D4AF37'; e.currentTarget.style.color = '#1A1A1A'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {isLoading ? 'Qeydiyyat edilir...' : 'Qeydiyyatdan keçin'}
                </button>
              </form>

            {/* Ссылка на вход */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#4A4A4A' }}>
            Artıq hesabınız var?{' '}
            <Link href="/auth/login" style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>Daxil olun</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
