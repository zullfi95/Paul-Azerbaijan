<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAUL Azerbaijan - Xoş gəlmisiniz!</title>
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
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .unsubscribe {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 11px;
            color: #999;
            text-align: center;
        }
        .unsubscribe a {
            color: #999;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🥖 PAUL Azerbaijan</h1>
            <p style="margin: 0; font-size: 18px;">Xoş gəlmisiniz!</p>
        </div>

        <div class="content">
            <p>Salam!</p>

            <p>PAUL Azerbaijan xəbər bülleteninə abunə olduğunuz üçün təşəkkür edirik!</p>

            <div class="highlight">
                <p style="margin-top: 0;"><strong>Bizim xəbər bülletenimizdə siz:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Yeni məhsullar və xüsusi təkliflər haqqında məlumat alacaqsınız</li>
                    <li>Ekskluziv endirimlər və kampaniyalardan xəbərdar olacaqsınız</li>
                    <li>Çörək və şirniyyat sənəti haqqında maraqlı məqalələr oxuyacaqsınız</li>
                    <li>Yeni reseptlər və məsləhətlər öyrənəcəksiniz</li>
                </ul>
            </div>

            <p>Biz sizin üçün ən yaxşı məzmunu hazırlayırıq və tezliklə sizinlə bölüşəcəyik.</p>

            <p>Əgər suallarınız varsa, bizimlə əlaqə saxlayın.</p>

            <p>Hörmətlə,<br><strong>PAUL Azerbaijan komandası</strong></p>
        </div>

        <div class="footer">
            <p>PAUL Azerbaijan<br>Fransız çörək və konfet mağazası</p>
            <p>Bu avtomatik mesajdır, zəhmət olmasa cavab verməyin.</p>
        </div>

        <div class="unsubscribe">
            <p>Bu bülletendən abunəlikdən çıxmaq istəyirsiniz? 
                <a href="{{ $unsubscribeUrl }}">Buraya klikləyin</a>
            </p>
        </div>
    </div>
</body>
</html>

