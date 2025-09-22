<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAUL Katerinq - Yeni Sifariş</title>
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
        .order-badge {
            background-color: #D4AF37;
            color: #1A1A1A;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
        }
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
        .menu-items {
            margin: 20px 0;
        }
        .menu-item {
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 8px;
            margin: 10px 0;
            background-color: #fafafa;
        }
        .status-badge {
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-draft { background-color: #e3f2fd; color: #1976d2; }
        .status-submitted { background-color: #e8f5e8; color: #2e7d32; }
        .status-processing { background-color: #fff3e0; color: #f57c00; }
        .status-completed { background-color: #e8f5e8; color: #2e7d32; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>PAUL AZERBAIJAN</h1>
            <p>Katerinq Xidməti</p>
        </div>

        <div class="content">
            <h2>Yeni sifariş yaradıldı</h2>
            
            <div style="text-align: center;">
                <div class="order-badge">
                    Sifariş #{{ $order->id }}
                </div>
                <br>
                <span class="status-badge status-{{ $order->status }}">
                    {{ $order->status === 'draft' ? 'Layihə' : ($order->status === 'submitted' ? 'Təqdim edildi' : ucfirst($order->status)) }}
                </span>
            </div>

            <div class="info-section">
                <h3>Sifariş məlumatları:</h3>
                <div class="info-row">
                    <span class="info-label">Şirkət:</span>
                    <span>{{ $order->company_name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Çatdırılma tarixi:</span>
                    <span>{{ $order->delivery_date ? \Carbon\Carbon::parse($order->delivery_date)->format('d.m.Y') : 'Göstərilməyib' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Çatdırılma vaxtı:</span>
                    <span>{{ $order->delivery_time ? \Carbon\Carbon::parse($order->delivery_time)->format('H:i') : 'Göstərilməyib' }}</span>
                </div>
                @if($order->total_amount)
                <div class="info-row">
                    <span class="info-label">Ümumi məbləğ:</span>
                    <span><strong>{{ number_format($order->total_amount, 2) }} ₼</strong></span>
                </div>
                @endif
                <div class="info-row">
                    <span class="info-label">Koordinator:</span>
                    <span>{{ $order->coordinator ? $order->coordinator->name : 'Təyin edilməyib' }}</span>
                </div>
            </div>

            @if($order->menu_items && count($order->menu_items) > 0)
            <div class="menu-items">
                <h3>Menyu pozisiyaları:</h3>
                @foreach($order->menu_items as $item)
                <div class="menu-item">
                    <strong>{{ $item['name'] ?? 'Məhsul adı göstərilməyib' }}</strong><br>
                    <small>
                        Miqdar: {{ $item['quantity'] ?? 1 }}
                        @if(isset($item['price']))
                        | Qiymət: {{ $item['price'] }} ₼
                        @endif
                    </small>
                </div>
                @endforeach
            </div>
            @endif

            @if($order->comment)
            <div class="info-section">
                <h3>Əlavə qeydlər:</h3>
                <p>{{ $order->comment }}</p>
            </div>
            @endif

            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #fff3cd; border-radius: 8px; border: 1px solid #ffeaa7;">
                <p style="margin: 0; color: #856404;">
                    <strong>📋 Bu sifariş sistem tərəfindən yaradılıb və təsdiq gözləyir.</strong>
                </p>
            </div>
        </div>

        <div class="footer">
            <p><strong>PAUL Azerbaijan Katerinq Sistemi</strong></p>
            <p>📧 info@paul.az | 📞 +994 50 123 45 67</p>
            <p>📍 Bakı şəhəri, Nizami küçəsi, 1</p>
            <p>🌐 www.paul.az</p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                Bu email avtomatik olaraq göndərilmişdir. Cavab verməyin.
            </p>
        </div>
    </div>
</body>
</html>
