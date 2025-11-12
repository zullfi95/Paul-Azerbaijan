# 📧 Руководство по настройке SMTP для email-уведомлений

## Дата создания: 12 ноября 2025

---

## 📋 Содержание

1. [Обзор](#обзор)
2. [Выбор SMTP провайдера](#выбор-smtp-провайдера)
3. [Настройка Gmail](#настройка-gmail)
4. [Настройка SendGrid](#настройка-sendgrid)
5. [Настройка Mailgun](#настройка-mailgun)
6. [Настройка Yandex Mail](#настройка-yandex-mail)
7. [Настройка Mail.ru](#настройка-mailru)
8. [Тестирование](#тестирование)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Обзор

Проект PAUL Azerbaijan использует Laravel Mail для отправки email-уведомлений:

- **Восстановление пароля** - отправка токенов сброса пароля
- **Новые заказы** - уведомления персонала о новых заказах
- **Статусы заказов** - уведомления клиентов об изменении статуса
- **Платежи** - подтверждения успешных платежей
- **Подписка на рассылку** - приветственные письма

---

## 🏆 Выбор SMTP провайдера

### Рекомендуемые сервисы

| Сервис | Бесплатный лимит | Рекомендация | Сложность |
|--------|------------------|--------------|-----------|
| **Gmail** | 500 писем/день | ✅ Для разработки и малого бизнеса | Легко |
| **SendGrid** | 100 писем/день | ✅ Для production | Средне |
| **Mailgun** | 5,000 писем/месяц | ✅ Для production | Средне |
| **Yandex Mail** | Зависит от тарифа | ⚠️ Для локальных нужд | Легко |
| **Mail.ru** | Зависит от тарифа | ⚠️ Для локальных нужд | Легко |

---

## 📮 Настройка Gmail

### Шаг 1: Создание App Password

1. Перейдите в [Google Account Security](https://myaccount.google.com/security)
2. Включите **2-Step Verification** (если еще не включено)
3. Перейдите в **App passwords**
4. Выберите приложение: **Mail** и устройство: **Other (Custom name)**
5. Введите название: **PAUL Azerbaijan Backend**
6. Скопируйте сгенерированный пароль (16 символов)

### Шаг 2: Настройка .env

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="PAUL Azerbaijan"
```

### ⚠️ Важно

- **НЕ** используйте обычный пароль Gmail
- Используйте только **App Password**
- Для production рекомендуется использовать корпоративный email

---

## 📮 Настройка SendGrid

### Шаг 1: Регистрация

1. Зарегистрируйтесь на [SendGrid](https://sendgrid.com/)
2. Подтвердите email и пройдите верификацию аккаунта
3. Создайте **Sender Identity** (отправитель)

### Шаг 2: Создание API Key

1. Перейдите в **Settings** → **API Keys**
2. Нажмите **Create API Key**
3. Выберите **Full Access** (или ограниченный доступ для Mail Send)
4. Скопируйте API Key (будет показан один раз!)

### Шаг 3: Настройка .env

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=verified-sender@yourdomain.com
MAIL_FROM_NAME="PAUL Azerbaijan"
```

### ✅ Преимущества

- ✅ Высокая доставляемость
- ✅ Подробная аналитика
- ✅ 100 писем/день бесплатно
- ✅ Отличная документация

---

## 📮 Настройка Mailgun

### Шаг 1: Регистрация

1. Зарегистрируйтесь на [Mailgun](https://www.mailgun.com/)
2. Подтвердите email
3. Добавьте свой домен (или используйте sandbox для тестирования)

### Шаг 2: Получение учетных данных

1. Перейдите в **Sending** → **Domain Settings**
2. Скопируйте **SMTP Hostname**
3. Скопируйте **Default SMTP Login**
4. Создайте **SMTP Password** в разделе **SMTP credentials**

### Шаг 3: Настройка .env

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=postmaster@your-domain.mailgun.org
MAIL_PASSWORD=your-mailgun-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="PAUL Azerbaijan"
```

### ✅ Преимущества

- ✅ 5,000 писем/месяц бесплатно
- ✅ Простая настройка
- ✅ API и SMTP поддержка
- ✅ Отличная для transactional emails

---

## 📮 Настройка Yandex Mail

### Шаг 1: Создание аккаунта

1. Создайте аккаунт на [Yandex Mail](https://mail.yandex.ru/)
2. Включите **"Разрешить доступ по IMAP/POP3/SMTP"** в настройках

### Шаг 2: Настройка .env

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.yandex.ru
MAIL_PORT=465
MAIL_USERNAME=your-email@yandex.ru
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=your-email@yandex.ru
MAIL_FROM_NAME="PAUL Azerbaijan"
```

### ⚠️ Ограничения

- Лимит отправки зависит от тарифа
- Может потребоваться подтверждение по SMS
- Рекомендуется для локальных проектов

---

## 📮 Настройка Mail.ru

### Шаг 1: Создание аккаунта

1. Создайте аккаунт на [Mail.ru](https://mail.ru/)
2. Включите доступ по SMTP в настройках

### Шаг 2: Настройка .env

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.mail.ru
MAIL_PORT=465
MAIL_USERNAME=your-email@mail.ru
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=your-email@mail.ru
MAIL_FROM_NAME="PAUL Azerbaijan"
```

### ⚠️ Ограничения

- Лимит отправки ~50 писем/час
- Возможны задержки доставки
- Рекомендуется для тестирования

---

## 🧪 Тестирование

### 1. Тестирование через Tinker

```bash
cd backend
php artisan tinker
```

```php
// Отправка тестового письма
Mail::raw('Это тестовое письмо от PAUL Azerbaijan', function ($message) {
    $message->to('test@example.com')
            ->subject('Test Email');
});

// Проверка логов
// tail -f storage/logs/laravel.log
```

### 2. Тестирование forgot-password

```bash
# Через curl
curl -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Тестирование через frontend

1. Перейдите на страницу `/auth/forgot-password`
2. Введите email и отправьте форму
3. Проверьте логи Laravel: `storage/logs/laravel.log`
4. В debug режиме токен будет в ответе API

### 4. Проверка конфигурации

```bash
# Проверить текущую конфигурацию mail
php artisan config:show mail

# Очистить кеш конфигурации
php artisan config:clear
```

---

## 🔧 Troubleshooting

### Проблема: "Connection could not be established"

**Решение:**
1. Проверьте MAIL_HOST и MAIL_PORT
2. Проверьте файрволл (порты 587/465/25)
3. Попробуйте другой MAIL_ENCRYPTION (tls/ssl)

```bash
# Тест подключения через telnet
telnet smtp.gmail.com 587
```

### Проблема: "Authentication failed"

**Решение:**
1. Проверьте MAIL_USERNAME и MAIL_PASSWORD
2. Для Gmail: используйте App Password
3. Проверьте, что 2FA включен (для Gmail)
4. Очистите кеш: `php artisan config:clear`

### Проблема: Письма не доходят

**Решение:**
1. Проверьте папку **Spam**
2. Проверьте логи Laravel: `storage/logs/laravel.log`
3. Проверьте queue: `php artisan queue:work` (если используется)
4. Проверьте MAIL_FROM_ADDRESS (должен быть валидный)

### Проблема: "Mail driver [smtp] not supported"

**Решение:**
```bash
composer require symfony/mailgun-mailer
composer require symfony/sendgrid-mailer
php artisan config:clear
```

### Проблема: Медленная отправка

**Решение:**
Используйте очереди для асинхронной отправки:

```bash
# .env
QUEUE_CONNECTION=redis

# Запуск worker
php artisan queue:work
```

---

## 📊 Мониторинг email

### 1. Логирование

Все email логируются в `storage/logs/laravel.log`:

```php
[2025-11-12 10:30:00] local.INFO: Password reset requested {"email":"user@example.com","token":"..."}
```

### 2. Email Preview (для разработки)

Установите пакет для preview писем:

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

Перейдите на `/telescope` → **Mail** для просмотра отправленных писем.

### 3. Мониторинг доставляемости

Для production используйте:
- SendGrid Analytics
- Mailgun Logs
- Postmark Analytics

---

## ✅ Рекомендуемая настройка для Production

### Development
```bash
MAIL_MAILER=log
```

### Testing/Staging
```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com  # или другой сервис
```

### Production
```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_USERNAME=apikey
MAIL_PASSWORD=${SENDGRID_API_KEY}
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@paul.az
MAIL_FROM_NAME="PAUL Azerbaijan"

# Используйте очереди для асинхронной отправки
QUEUE_CONNECTION=redis
```

---

## 📚 Дополнительные ресурсы

- [Laravel Mail Documentation](https://laravel.com/docs/12.x/mail)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Mailgun Documentation](https://documentation.mailgun.com/)
- [Gmail SMTP Settings](https://support.google.com/a/answer/176600)

---

## 🎉 Заключение

После настройки SMTP:
1. ✅ Проверьте отправку тестового письма
2. ✅ Протестируйте все типы уведомлений
3. ✅ Настройте очереди для production
4. ✅ Мониторьте доставляемость писем

**Статус:** ✅ SMTP настройка документирована и готова к использованию

---

**Автор:** AI Assistant  
**Дата:** 12 ноября 2025  
**Версия:** 1.0

