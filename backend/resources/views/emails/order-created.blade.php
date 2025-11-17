<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAUL Azerbaijan - Yeni Sifariş</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #fffcf8;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #1A1A1A 0%, #D4AF37 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.95;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            text-align: center;
            margin-bottom: 30px;
        }
        .greeting h2 {
            color: #1A1A1A;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .greeting p {
            color: #666;
            font-size: 16px;
            margin: 0;
        }
        .order-badge {
            background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
            color: #1A1A1A;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: bold;
            font-size: 18px;
            display: inline-block;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }
        .status-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
            margin: 10px 5px;
        }
        .status-draft { background-color: #e3f2fd; color: #1976d2; }
        .status-submitted { background-color: #e8f5e8; color: #2e7d32; }
        .status-processing { background-color: #fff3e0; color: #f57c00; }
        .status-completed { background-color: #e8f5e8; color: #2e7d32; }
        .info-section {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 4px solid #D4AF37;
        }
        .info-section h3 {
            color: #1A1A1A;
            margin: 0 0 20px 0;
            font-size: 18px;
            font-weight: 600;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 12px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #666;
            font-size: 14px;
        }
        .info-value {
            color: #1A1A1A;
            font-weight: 500;
            text-align: right;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
        }
        .items-table thead {
            background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
            color: #1A1A1A;
        }
        .items-table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
        }
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
        }
        .items-table tbody tr:last-child td {
            border-bottom: none;
        }
        .items-table tbody tr:nth-child(even) {
            background-color: #fafafa;
        }
        .total-row {
            background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%) !important;
            color: white !important;
            font-weight: bold;
        }
        .total-row td {
            color: white !important;
            font-size: 16px;
        }
        .highlight-box {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 2px solid #D4AF37;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .highlight-box p {
            margin: 0;
            color: #856404;
            font-weight: 600;
            font-size: 15px;
        }
        .contact-section {
            background-color: #e8f5e8;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            border: 1px solid #c3e6c3;
        }
        .contact-section h4 {
            color: #2d5a2d;
            margin: 0 0 15px 0;
            font-size: 16px;
        }
        .contact-section p {
            color: #2d5a2d;
            margin: 8px 0;
            font-size: 14px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 8px 0;
            color: #666;
            font-size: 14px;
        }
        .footer strong {
            color: #1A1A1A;
        }
        .footer .disclaimer {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
        @media (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .info-row {
                flex-direction: column;
                align-items: flex-start;
            }
            .info-value {
                text-align: left;
                margin-top: 5px;
            }
            .items-table {
                font-size: 12px;
            }
            .items-table th,
            .items-table td {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            <h1>PAUL Azerbaijan</h1>
            <p>Premium Katerinq Xidməti</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Greeting -->
            <div class="greeting">
                <h2>Salam{{ $client ? ', ' . $client->name : '' }}!</h2>
                <p>Sizin üçün yeni sifariş yaradıldı</p>
            </div>

            <!-- Order Badge -->
            <div style="text-align: center; margin: 30px 0;">
                <div class="order-badge">
                    Sifariş №{{ $order->id }}
                </div>
                <br>
                <span class="status-badge status-{{ $order->status }}">
                    @if($order->status === 'draft')
                        Layihə
                    @elseif($order->status === 'submitted')
                        Təqdim edildi
                    @elseif($order->status === 'processing')
                        Hazırlanır
                    @elseif($order->status === 'completed')
                        Tamamlandı
                    @else
                        {{ ucfirst($order->status) }}
                    @endif
                </span>
            </div>

            <!-- Order Information -->
            <div class="info-section">
                <h3>📋 Sifariş Məlumatları</h3>
                
                @if($order->company_name)
                <div class="info-row">
                    <span class="info-label">Şirkət:</span>
                    <span class="info-value">{{ $order->company_name }}</span>
                </div>
                @endif

                @if($order->delivery_date)
                <div class="info-row">
                    <span class="info-label">📅 Çatdırılma tarixi:</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($order->delivery_date)->format('d.m.Y') }}</span>
                </div>
                @endif

                @if($order->delivery_time)
                <div class="info-row">
                    <span class="info-label">🕐 Çatdırılma vaxtı:</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($order->delivery_time)->format('H:i') }}</span>
                </div>
                @endif

                @if($order->delivery_address)
                <div class="info-row">
                    <span class="info-label">📍 Ünvan:</span>
                    <span class="info-value">{{ $order->delivery_address }}</span>
                </div>
                @endif

                @if($coordinator)
                <div class="info-row">
                    <span class="info-label">👤 Koordinator:</span>
                    <span class="info-value">{{ $coordinator->name }}</span>
                </div>
                @endif

                @if($totalAmount > 0)
                <div class="info-row" style="border-top: 2px solid #D4AF37; margin-top: 15px; padding-top: 15px;">
                    <span class="info-label" style="font-size: 16px;">💰 Ümumi məbləğ:</span>
                    <span class="info-value" style="font-size: 18px; font-weight: bold; color: #D4AF37;">{{ number_format($totalAmount, 2) }} ₼</span>
                </div>
                @endif
            </div>

            <!-- Menu Items -->
            @if($order->menu_items && count($order->menu_items) > 0)
            <div class="info-section">
                <h3>🍽️ Sifariş Edilən Məhsullar</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Məhsul</th>
                            <th style="text-align: center;">Miqdar</th>
                            <th style="text-align: right;">Qiymət</th>
                            <th style="text-align: right;">Məbləğ</th>
                        </tr>
                    </thead>
                    <tbody>
                        @php
                            $calculatedTotal = 0;
                        @endphp
                        @foreach($order->menu_items as $item)
                            @php
                                $itemPrice = $item['price'] ?? 0;
                                $itemQuantity = $item['quantity'] ?? 1;
                                $itemTotal = $itemPrice * $itemQuantity;
                                $calculatedTotal += $itemTotal;
                            @endphp
                            <tr>
                                <td><strong>{{ $item['name'] ?? 'Məhsul adı göstərilməyib' }}</strong></td>
                                <td style="text-align: center;">{{ $itemQuantity }}</td>
                                <td style="text-align: right;">{{ number_format($itemPrice, 2) }} ₼</td>
                                <td style="text-align: right;"><strong>{{ number_format($itemTotal, 2) }} ₼</strong></td>
                            </tr>
                        @endforeach
                        <tr class="total-row">
                            <td colspan="3"><strong>ÜMUMİ:</strong></td>
                            <td style="text-align: right;"><strong>{{ number_format($calculatedTotal, 2) }} ₼</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            @endif

            <!-- Comment -->
            @if($order->comment)
            <div class="info-section">
                <h3>💬 Əlavə Qeydlər</h3>
                <p style="color: #4A4A4A; margin: 0; white-space: pre-wrap;">{{ $order->comment }}</p>
            </div>
            @endif

            <!-- Payment Required Box (for one-time clients) -->
            @if($isOneTimeClient && $paymentUrl)
            <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #FCD34D; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="color: #D97706; margin: 0 0 15px 0; font-size: 20px;">⚠️ Ödəniş Tələb Olunur</h3>
                <p style="color: #92400E; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                    Sifarişinizin təsdiqlənməsi və hazırlanması üçün ödəniş edilməlidir.
                </p>
                <a href="{{ $paymentUrl }}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 15px 35px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: transform 0.2s;">
                    💳 Ödəniş Et
                </a>
                <p style="color: #92400E; margin: 15px 0 0 0; font-size: 13px; font-weight: normal;">
                    Ödəniş edildikdən sonra sifarişiniz hazırlanma prosesinə keçəcək
                </p>
            </div>
            @else
            <!-- Highlight Box (for regular clients) -->
            <div class="highlight-box">
                <p>✅ Sifarişiniz qəbul edildi və hazırlanma prosesindədir</p>
                <p style="margin-top: 10px; font-size: 14px; font-weight: normal;">
                    Hazır olduqda sizə məlumat veriləcək
                </p>
            </div>
            @endif

            <!-- Contact Information -->
            @if($client)
            <div class="contact-section">
                <h4>📞 Əlaqə Məlumatları</h4>
                <p><strong>Ad:</strong> {{ $client->name }}</p>
                @if($client->email)
                <p><strong>E-poçt:</strong> {{ $client->email }}</p>
                @endif
                @if($client->phone)
                <p><strong>Telefon:</strong> {{ $client->phone }}</p>
                @endif
            </div>
            @endif
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>PAUL Azerbaijan</strong></p>
            <p>Premium Katerinq Xidməti</p>
            <p>📧 info@paul-azerbaijan.com</p>
            <p>📞 +994 50 123 45 67</p>
            <p>📍 Bakı şəhəri</p>
            <p>🌐 www.paul-azerbaijan.com</p>
            
            <p class="disclaimer">
                Bu email avtomatik olaraq göndərilmişdir. Cavab verməyin.
            </p>
        </div>
    </div>
</body>
</html>
