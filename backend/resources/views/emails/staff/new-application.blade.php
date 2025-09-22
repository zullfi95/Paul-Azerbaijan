<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAUL Katerinq - Yeni Müraciət</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 700px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f6;
        }
        .email-container {
            background-color: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #D4AF37 0%, #B8942F 100%);
            color: #1A1A1A;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .priority-badge {
            background-color: #ff6b6b;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            display: inline-block;
            margin: 10px 0;
        }
        .content {
            padding: 30px;
        }
        .info-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #D4AF37;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .info-label {
            font-weight: bold;
            color: #666;
            flex: 1;
        }
        .info-value {
            flex: 2;
            text-align: right;
        }
        .cart-items {
            margin: 20px 0;
        }
        .cart-item {
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 8px;
            margin: 10px 0;
            background-color: #fafafa;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .footer {
            background-color: #1A1A1A;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #D4AF37;
            color: #1A1A1A;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 5px;
        }
        .btn-secondary {
            background-color: #6c757d;
            color: white;
        }
        .action-buttons {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        .urgent {
            background-color: #fff5f5;
            border-left: 4px solid #f56565;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔔 YENI MÜRACİƏT</h1>
            <p>PAUL Azerbaijan Katerinq Sistemi</p>
            <div class="priority-badge">TƏCİLİ - DİQQƏT TƏLƏB EDİR</div>
        </div>

        <div class="content">
            <h2>Hörmətli {{ $staffRole === 'coordinator' ? 'Koordinator' : 'Komanda üzvü' }},</h2>
            
            <p>Yeni müraciət daxil olub və sizin təcili diqqətinizi gözləyir.</p>

            @php
                $application = $data;
                $totalAmount = 0;
                if ($application->cart_items) {
                    $totalAmount = collect($application->cart_items)->sum(function ($item) {
                        return $item['price'] * $item['quantity'];
                    });
                }
            @endphp

            <!-- Критически важная информация -->
            @if($application->event_date && \Carbon\Carbon::parse($application->event_date)->diffInHours(now()) < 48)
            <div class="urgent">
                <strong>⚠️ DİQQƏT: Bu müraciət tədbir tarixinə 48 saatdan az qalıb!</strong><br>
                <small>Təcili emal edilməlidir və müştəriyə dərhal cavab verilməlidir.</small>
            </div>
            @endif

            <div class="info-section">
                <h3>📋 Müraciət məlumatları</h3>
                <div class="info-row">
                    <span class="info-label">Müraciət ID:</span>
                    <span class="info-value"><strong>#{{ $application->id }}</strong></span>
                </div>
                <div class="info-row">
                    <span class="info-label">Müştəri adı:</span>
                    <span class="info-value">{{ $application->first_name }} {{ $application->last_name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">E-poçt:</span>
                    <span class="info-value">{{ $application->email }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Telefon:</span>
                    <span class="info-value">{{ $application->phone }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Daxil olma vaxtı:</span>
                    <span class="info-value">{{ $application->created_at->format('d.m.Y H:i') }}</span>
                </div>
            </div>

            <div class="info-section">
                <h3>🎉 Tədbir məlumatları</h3>
                <div class="info-row">
                    <span class="info-label">Tədbir tarixi:</span>
                    <span class="info-value">
                        @if($application->event_date)
                            {{ \Carbon\Carbon::parse($application->event_date)->format('d.m.Y') }}
                            @if(\Carbon\Carbon::parse($application->event_date)->diffInDays(now()) <= 2)
                                <span style="color: #f56565; font-weight: bold;">({{ \Carbon\Carbon::parse($application->event_date)->diffForHumans() }})</span>
                            @endif
                        @else
                            Göstərilməyib
                        @endif
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tədbir vaxtı:</span>
                    <span class="info-value">{{ $application->event_time ?: 'Göstərilməyib' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Ünvan:</span>
                    <span class="info-value">{{ $application->event_address ?: 'Göstərilməyib' }}</span>
                </div>
                @if($totalAmount > 0)
                <div class="info-row">
                    <span class="info-label">Gözlənilən məbləğ:</span>
                    <span class="info-value"><strong style="color: #D4AF37;">{{ number_format($totalAmount, 2) }} ₼</strong></span>
                </div>
                @endif
            </div>

            @if($application->cart_items && count($application->cart_items) > 0)
            <div class="cart-items">
                <h3>🍽️ Seçilmiş məhsullar ({{ count($application->cart_items) }} pozisiya)</h3>
                @foreach($application->cart_items as $item)
                <div class="cart-item">
                    <div>
                        <strong>{{ $item['name'] }}</strong><br>
                        <small style="color: #666;">Miqdar: {{ $item['quantity'] }} ədəd</small>
                    </div>
                    <div style="text-align: right;">
                        <strong>{{ $item['price'] }} ₼</strong><br>
                        <small>Cəmi: {{ $item['price'] * $item['quantity'] }} ₼</small>
                    </div>
                </div>
                @endforeach
                
                @if($totalAmount > 0)
                <div style="text-align: right; margin-top: 15px; padding: 15px; background-color: #D4AF37; color: #1A1A1A; border-radius: 8px;">
                    <strong>ÜMUMI MƏBLƏĞ: {{ number_format($totalAmount, 2) }} ₼</strong>
                </div>
                @endif
            </div>
            @endif

            @if($application->message)
            <div class="info-section">
                <h3>💬 Müştəri qeydi</h3>
                <p style="font-style: italic;">"{{ $application->message }}"</p>
            </div>
            @endif

            <div class="action-buttons">
                <h3>🎯 Gözlənilən hərəkətlər</h3>
                <p>Bu müraciəti emal etmək üçün dashboard-a daxil olun:</p>
                
                <a href="{{ config('app.url') }}/dashboard" class="btn">
                    📊 Dashboard-a daxil ol
                </a>
                
                <a href="mailto:{{ $application->email }}" class="btn btn-secondary">
                    📧 Müştəriyə email göndər
                </a>
                
                <a href="tel:{{ $application->phone }}" class="btn btn-secondary">
                    📞 Müştərini zəng et
                </a>
            </div>

            <!-- Рекомендации по обработке -->
            <div style="background-color: #e6f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #0066cc; margin-top: 0;">📝 Tövsiyələr:</h4>
                <ul style="color: #0066cc;">
                    <li>Müraciəti 2 saat ərzində emal edin</li>
                    <li>Müştəriyə 24 saat ərzində cavab verin</li>
                    <li>Tədbir tarixi yaxın isə təcili əlaqə saxlayın</li>
                    <li>BEO faylını hazırlayın və komanda ilə paylaşın</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p><strong>PAUL Azerbaijan</strong> - Katerinq İdarəetmə Sistemi</p>
            <p>📧 Texniki dəstək: tech@paul.az</p>
            <p>Bu email avtomatik olaraq göndərilmişdir.</p>
        </div>
    </div>
</body>
</html>
