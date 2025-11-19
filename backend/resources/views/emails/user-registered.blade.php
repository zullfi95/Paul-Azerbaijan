<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAUL Azerbaijan - Добро пожаловать!</title>
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
            background-color: #1a1a1a;
            color: #ebd8b7;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            margin: -30px -30px 30px -30px;
        }
        .header h1 {
            color: #ebd8b7;
            font-size: 28px;
            margin-bottom: 10px;
        }
        .content {
            margin: 20px 0;
        }
        .highlight {
            background-color: #f9f9f6;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ebd8b7;
            margin: 20px 0;
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
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        li {
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🥖 PAUL Azerbaijan</h1>
            <p style="margin: 0; font-size: 18px;">Поздравляем с успешной регистрацией!</p>
        </div>

        <div class="content">
            <p>Здравствуйте, {{ $user->name }}@if($user->last_name) {{ $user->last_name }}@endif!</p>

            <p>Мы рады приветствовать Вас в PAUL Azerbaijan! Ваш аккаунт был успешно создан.</p>

            <div class="highlight">
                <p style="margin-top: 0;"><strong>Теперь Вы можете:</strong></p>
                <ul>
                    <li>Делать заказы наших свежих хлебобулочных изделий и кондитерских изделий</li>
                    <li>Отслеживать статус Ваших заказов в личном кабинете</li>
                    <li>Просматривать историю всех Ваших заказов</li>
                    <li>Управлять своими данными и адресами доставки</li>
                    <li>Получать информацию о специальных предложениях и акциях</li>
                </ul>
            </div>

            <p>Мы готовы предложить Вам лучшие французские хлебобулочные изделия и кондитерские изделия, приготовленные с любовью и по традиционным рецептам.</p>

            <div style="text-align: center;">
                <a href="{{ $loginUrl }}" class="login-button">Войти в личный кабинет</a>
            </div>

            <p>Если у Вас возникнут вопросы, пожалуйста, свяжитесь с нами. Мы всегда рады помочь!</p>

            <p>С уважением,<br><strong>Команда PAUL Azerbaijan</strong></p>
        </div>

        <div class="footer">
            <p>PAUL Azerbaijan<br>Французская пекарня и кондитерская</p>
            <p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
        </div>
    </div>
</body>
</html>

