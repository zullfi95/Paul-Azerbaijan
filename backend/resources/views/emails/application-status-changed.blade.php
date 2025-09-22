<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAUL Katerinq - Status Dəyişikliyi</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
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
            background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            margin: 5px;
        }
        .status-new { background-color: #e3f2fd; color: #1976d2; }
        .status-processing { background-color: #fff3e0; color: #f57c00; }
        .status-approved { background-color: #e8f5e8; color: #2e7d32; }
        .status-rejected { background-color: #ffebee; color: #d32f2f; }
        .info-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
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
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
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
            margin: 10px 0;
        }
        .cart-items {
            margin: 20px 0;
        }
        .cart-item {
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 6px;
            margin: 10px 0;
            background-color: #fafafa;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>PAUL AZERBAIJAN</h1>
            <p>Katerinq Xidməti</p>
        </div>

        <div class="content">
            <h2>Hörmətli {{ $application->first_name }} {{ $application->last_name }},</h2>
            
            <p>Sifarişinizin statusu dəyişdirildi.</p>

            <div style="text-align: center; margin: 30px 0;">
                <div>
                    <span class="status-badge status-{{ $application->status }}">{{ $previousStatus }}</span>
                    <span style="font-size: 20px; margin: 0 10px;">→</span>
                    <span class="status-badge status-{{ $application->status }}">{{ $currentStatus }}</span>
                </div>
            </div>

            @if($application->coordinator_comment)
            <div class="info-section">
                <h3>Koordinator şərhi:</h3>
                <p>{{ $application->coordinator_comment }}</p>
            </div>
            @endif

            <div class="info-section">
                <h3>Sifariş məlumatları:</h3>
                <div class="info-row">
                    <span class="info-label">Müraciət nömrəsi:</span>
                    <span>#{{ $application->id }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tədbir tarixi:</span>
                    <span>{{ $application->event_date ? $application->event_date->format('d.m.Y') : 'Göstərilməyib' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tədbir vaxtı:</span>
                    <span>{{ $application->event_time ? $application->event_time->format('H:i') : 'Göstərilməyib' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tədbir ünvanı:</span>
                    <span>{{ $application->event_address ?: 'Göstərilməyib' }}</span>
                </div>
                @if($totalAmount > 0)
                <div class="info-row">
                    <span class="info-label">Ümumi məbləğ:</span>
                    <span><strong>{{ number_format($totalAmount, 2) }} ₼</strong></span>
                </div>
                @endif
            </div>

            @if($application->cart_items && count($application->cart_items) > 0)
            <div class="cart-items">
                <h3>Seçilmiş məhsullar:</h3>
                @foreach($application->cart_items as $item)
                <div class="cart-item">
                    <strong>{{ $item['name'] }}</strong><br>
                    <small>Miqdar: {{ $item['quantity'] }} | Qiymət: {{ $item['price'] }} ₼</small>
                </div>
                @endforeach
            </div>
            @endif

            @if($application->status === 'approved')
            <p style="color: #2e7d32; font-weight: bold;">
                ✅ Təbriklər! Sifarişiniz təsdiqləndi. Tezliklə bizimlə əlaqə saxlayacağıq.
            </p>
            @elseif($application->status === 'rejected')
            <p style="color: #d32f2f; font-weight: bold;">
                ❌ Təəssüf ki, sifarişiniz rədd edildi. Əlavə məlumat üçün bizimlə əlaqə saxlayın.
            </p>
            @endif

            <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:info@paul.az" class="btn">Bizimlə əlaqə</a>
            </div>
        </div>

        <div class="footer">
            <p><strong>PAUL Azerbaijan</strong></p>
            <p>📧 info@paul.az | 📞 +994 50 123 45 67</p>
            <p>📍 Bakı şəhəri, Nizami küçəsi, 1</p>
            <p>🌐 www.paul.az</p>
        </div>
    </div>
</body>
</html>
