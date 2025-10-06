# Руководство по сбросу паролей

## Способы сброса пароля

### 1. Через командную строку (Artisan)

Для сброса пароля пользователя используйте команду:

```bash
php artisan user:reset-password {email} {password}
```

**Примеры:**
```bash
# Сброс с паролем по умолчанию
php artisan user:reset-password zulfi@gmail.com

# Сброс с кастомным паролем
php artisan user:reset-password zulfi@gmail.com mynewpassword123
```

### 2. Через веб-интерфейс (только для координаторов)

1. Войдите в систему как координатор
2. Перейдите в раздел "Пользователи" в дашборде
3. Нажмите на ссылку "🔑 Сброс паролей"
4. Введите email пользователя и новый пароль
5. Нажмите "Сбросить пароль"

### 3. Через API (только для координаторов)

```bash
curl -X POST http://localhost:8000/api/reset-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zulfi@gmail.com",
    "new_password": "newpassword123"
  }'
```

## Безопасность

- Только координаторы могут сбрасывать пароли через веб-интерфейс и API
- Команда Artisan доступна только администраторам сервера
- Новые пароли должны содержать минимум 6 символов
- Рекомендуется сообщать пользователям новые пароли по безопасному каналу

## Восстановление доступа

Если вы забыли пароль от аккаунта координатора:

1. Используйте команду Artisan для сброса пароля координатора
2. Или обратитесь к администратору сервера

## Примеры использования

### Сброс пароля для клиента
```bash
php artisan user:reset-password client@example.com clientpass123
```

### Сброс пароля для сотрудника
```bash
php artisan user:reset-password staff@example.com staffpass123
```

### Сброс пароля с паролем по умолчанию
```bash
php artisan user:reset-password user@example.com
# Пароль будет: newpassword123
```



