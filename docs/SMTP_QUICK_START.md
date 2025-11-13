# ⚡ Быстрая настройка SMTP для PAUL Azerbaijan

## 🎯 Минимальная настройка (5 минут)

### Вариант 1: Gmail (Для разработки)

1. **Создайте App Password в Google Account:**
   - Перейдите: https://myaccount.google.com/apppasswords
   - Включите 2FA если еще не включено
   - Создайте App Password для "Mail"
   - Скопируйте 16-значный пароль

2. **Обновите backend/.env:**
   ```bash
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App Password
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=your-email@gmail.com
   MAIL_FROM_NAME="PAUL Azerbaijan"
   ```

3. **Тест:**
   ```bash
   cd backend
   php artisan tinker
   
   Mail::raw('Test', function($m) { 
       $m->to('test@example.com')->subject('Test'); 
   });
   ```

---

### Вариант 2: SendGrid (Для Production)

1. **Регистрация и API Key:**
   - Зарегистрируйтесь: https://sendgrid.com/
   - Settings → API Keys → Create API Key
   - Скопируйте API Key

2. **Обновите backend/.env:**
   ```bash
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.sendgrid.net
   MAIL_PORT=587
   MAIL_USERNAME=apikey
   MAIL_PASSWORD=your-sendgrid-api-key
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=verified@yourdomain.com
   MAIL_FROM_NAME="PAUL Azerbaijan"
   ```

---

### Вариант 3: Log Driver (Для тестирования)

```bash
MAIL_MAILER=log
```

Письма будут записываться в `storage/logs/laravel.log`

---

## 🧪 Проверка работы

```bash
# 1. Очистите кеш
php artisan config:clear

# 2. Протестируйте forgot-password
curl -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 3. Проверьте логи
tail -f storage/logs/laravel.log
```

---

## ✅ Готово!

Подробная документация: [docs/SMTP_SETUP_GUIDE.md](docs/SMTP_SETUP_GUIDE.md)

---

## 🆘 Проблемы?

**"Connection refused"** → Проверьте MAIL_HOST и MAIL_PORT  
**"Authentication failed"** → Проверьте MAIL_PASSWORD (для Gmail используйте App Password)  
**Письма не приходят** → Проверьте Spam и логи Laravel

---

**Статус:** ✅ SMTP готов к использованию

