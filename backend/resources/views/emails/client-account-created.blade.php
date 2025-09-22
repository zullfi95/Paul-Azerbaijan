<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ваш аккаунт в PAUL создан</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .credentials {
            background-color: #f9f9f6;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ebd8b7;
            margin: 20px 0;
        }
        .credentials h3 {
            margin-top: 0;
            color: #1a1a1a;
        }
        .login-button {
            display: inline-block;
            background-color: #1a1a1a;
            color: #ebd8b7;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 12px;
            border-radius: 6px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Добро пожаловать в PAUL!</h1>
            <p>Ваш аккаунт был успешно создан</p>
        </div>

        <p>Здравствуйте, {{ $client->name }}!</p>

        <p>Для Вас был создан личный кабинет в системе PAUL. Теперь Вы можете:</p>
        <ul>
            <li>Отслеживать статус Ваших заказов</li>
            <li>Просматривать историю заказов</li>
            <li>Управлять своими данными</li>
        </ul>

        <div class="credentials">
            <h3>Ваши учетные данные:</h3>
            <p><strong>Email:</strong> {{ $client->email }}</p>
            <p><strong>Пароль:</strong> {{ $password }}</p>
        </div>

        <div class="warning">
            <strong>⚠️ Важно:</strong> Рекомендуем изменить пароль после первого входа в систему для обеспечения безопасности Вашего аккаунта.
        </div>

        <div style="text-align: center;">
            <a href="{{ $loginUrl }}" class="login-button">Войти в личный кабинет</a>
        </div>

        <p>Если у Вас возникнут вопросы, пожалуйста, свяжитесь с нами.</p>

        <div class="footer">
            <p>С уважением,<br>Команда PAUL</p>
            <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
        </div>
    </div>
</body>
</html>
