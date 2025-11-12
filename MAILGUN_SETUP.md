# 📧 Настройка Mailgun для PAUL Azerbaijan

## Шаг 1: Регистрация в Mailgun

1. Перейдите на https://www.mailgun.com/
2. Нажмите **"Sign Up"** и создайте аккаунт
3. Подтвердите email адрес

## Шаг 2: Добавление домена в Mailgun

1. В панели Mailgun перейдите в **"Sending" → "Domains"**
2. Нажмите **"Add New Domain"**
3. Введите: `mg.paul-azerbaijan.com`
4. Выберите регион: **EU** (для лучшей производительности в Азербайджане)
5. Нажмите **"Add Domain"**

## Шаг 3: Получение API ключей

После добавления домена:

1. Перейдите в **"Sending" → "Domain settings" → "Sending API keys"**
2. Скопируйте **Private API key** (начинается с `key-...`)
3. Скопируйте **Domain name** (должен быть `mg.paul-azerbaijan.com`)

## Шаг 4: Настройка DNS на Namecheap

Mailgun покажет вам DNS записи. Добавьте их в Namecheap:

### В Namecheap → Domain List → Manage → Advanced DNS:

#### 1. SPF запись (для защиты от спама)
- **Type**: TXT Record
- **Host**: `mg`
- **Value**: `v=spf1 include:mailgun.org ~all`
- **TTL**: Automatic

#### 2. DKIM запись (для подписи писем)
- **Type**: TXT Record
- **Host**: `k1._domainkey.mg` (точное значение из Mailgun)
- **Value**: `k=rsa; p=MIG...` (длинный ключ из Mailgun)
- **TTL**: Automatic

#### 3. Tracking CNAME
- **Type**: CNAME Record
- **Host**: `email.mg`
- **Value**: `mailgun.org`
- **TTL**: Automatic

#### 4. MX записи (для получения писем - опционально)
- **Type**: MX Record
- **Host**: `mg`
- **Value**: `mxa.mailgun.org`
- **Priority**: 10
- **TTL**: Automatic

- **Type**: MX Record
- **Host**: `mg`
- **Value**: `mxb.mailgun.org`
- **Priority**: 10
- **TTL**: Automatic

**Важно**: Точные значения берите из панели Mailgun!

## Шаг 5: Проверка DNS

1. В Mailgun нажмите **"Verify DNS Settings"**
2. Подождите 5-30 минут для распространения DNS
3. Статус должен стать **"Active"** (зеленый)

## Шаг 6: Обновление .env на сервере

После верификации DNS, обновите файл `/var/www/paul/backend/.env`:

```env
# Mailgun Configuration
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.paul-azerbaijan.com
MAILGUN_SECRET=key-ваш_api_ключ_из_mailgun
MAILGUN_ENDPOINT=api.eu.mailgun.net

# Email Settings
MAIL_FROM_ADDRESS="noreply@paul-azerbaijan.com"
MAIL_FROM_NAME="PAUL Azerbaijan"
```

**Замените**:
- `key-ваш_api_ключ_из_mailgun` → на ваш Private API key из Mailgun
- Если выбрали US регион, используйте `api.mailgun.net` вместо `api.eu.mailgun.net`

## Шаг 7: Перезапуск контейнеров

После обновления .env:

```bash
ssh root@46.62.152.225
cd /var/www/paul/docker
docker compose restart backend queue
```

## Шаг 8: Тестирование

Отправьте тестовое письмо:

```bash
ssh root@46.62.152.225
docker exec paul_backend php artisan tinker
```

В tinker выполните:

```php
Mail::raw('Test email from PAUL Azerbaijan', function($message) {
    $message->to('your-email@example.com')
            ->subject('Test Email');
});
```

Проверьте:
1. Письмо пришло на указанный email
2. В Mailgun → Logs видны отправленные письма

## Лимиты бесплатного плана

- ✅ 5,000 писем в месяц
- ✅ 100 валидаций email в месяц
- ✅ 3 месяца хранения логов

## Мониторинг

Отслеживайте отправку в Mailgun:
- **Sending** → **Logs** - все отправленные письма
- **Sending** → **Analytics** - статистика доставки

## Troubleshooting

### Письма не отправляются
1. Проверьте DNS записи в Mailgun (должны быть зеленые галочки)
2. Проверьте API ключ в .env
3. Проверьте логи: `docker logs paul_backend | grep -i mail`

### Письма попадают в спам
1. Убедитесь, что SPF и DKIM настроены правильно
2. Добавьте DMARC запись (опционально)
3. Прогрейте домен (отправляйте письма постепенно)

## Дополнительно: DMARC (рекомендуется)

Для лучшей доставляемости добавьте DMARC запись:

- **Type**: TXT Record
- **Host**: `_dmarc.mg`
- **Value**: `v=DMARC1; p=none; rua=mailto:admin@paul-azerbaijan.com`
- **TTL**: Automatic

