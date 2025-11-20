<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAUL Azerbaijan - Yeni Sifariş</title>
    <style>
        /* PAUL Brand Colors */
        body {
            font-family: 'Sabon Next LT Pro', 'Playfair Display', 'Parisine Pro Gris', serif;
            line-height: 1.6;
            color: #1A1A1A;
            margin: 0;
            padding: 0;
            background-color: #FFFCF8;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: #1A1A1A;
            color: #FFFCF8;
            padding: 50px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 0.5px;
            font-family: 'Sabon Next LT Pro', serif;
        }
        .header p {
            margin: 12px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .content {
            padding: 40px 30px;
            background-color: #FFFFFF;
        }
        .greeting {
            text-align: center;
            margin-bottom: 35px;
        }
        .greeting h2 {
            color: #1A1A1A;
            margin: 0 0 12px 0;
            font-size: 26px;
            font-weight: 600;
            font-family: 'Sabon Next LT Pro', serif;
        }
        .greeting p {
            color: #4A4A4A;
            font-size: 16px;
            margin: 0;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .order-badge {
            background: #1A1A1A;
            color: #FFFCF8;
            padding: 14px 28px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 18px;
            display: inline-block;
            margin: 25px 0 15px 0;
            font-family: 'Sabon Next LT Pro', serif;
            letter-spacing: 0.5px;
        }
        .status-badge {
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-block;
            margin: 10px 5px;
            font-family: 'Parisine Pro Gris', sans-serif;
            letter-spacing: 0.5px;
        }
        .status-draft { background-color: #F8F6F3; color: #4A4A4A; border: 1px solid #EDEAE3; }
        .status-submitted { background-color: #F0FDF4; color: #2e7d32; border: 1px solid #C3E6C3; }
        .status-processing { background-color: #FEF4E6; color: #856404; border: 1px solid #FCD34D; }
        .status-completed { background-color: #F0FDF4; color: #2e7d32; border: 1px solid #C3E6C3; }
        .info-section {
            background-color: #F8F6F3;
            padding: 28px;
            border-radius: 4px;
            margin: 28px 0;
            border-left: 3px solid #1A1A1A;
        }
        .info-section h3 {
            color: #1A1A1A;
            margin: 0 0 22px 0;
            font-size: 18px;
            font-weight: 600;
            font-family: 'Sabon Next LT Pro', serif;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 14px 0;
            padding: 12px 0;
            border-bottom: 1px solid #EDEAE3;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #4A4A4A;
            font-size: 14px;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .info-value {
            color: #1A1A1A;
            font-weight: 500;
            text-align: right;
            font-size: 14px;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 22px 0;
            background-color: #FFFFFF;
            border: 1px solid #EDEAE3;
        }
        .items-table thead {
            background: #1A1A1A;
            color: #FFFCF8;
        }
        .items-table th {
            padding: 16px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            font-family: 'Parisine Pro Gris', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .items-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #EDEAE3;
            font-size: 14px;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .items-table tbody tr:last-child td {
            border-bottom: none;
        }
        .items-table tbody tr:nth-child(even) {
            background-color: #F8F6F3;
        }
        .total-row {
            background: #1A1A1A !important;
            color: #FFFCF8 !important;
            font-weight: bold;
        }
        .total-row td {
            color: #FFFCF8 !important;
            font-size: 16px;
            font-family: 'Sabon Next LT Pro', serif;
        }
        .highlight-box {
            background: #FEF4E6;
            border: 1px solid #EDEAE3;
            border-radius: 4px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
        }
        .highlight-box p {
            margin: 0;
            color: #1A1A1A;
            font-weight: 500;
            font-size: 15px;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .payment-box {
            background: #FEF4E6;
            border: 2px solid #1A1A1A;
            border-radius: 4px;
            padding: 28px;
            margin: 32px 0;
            text-align: center;
        }
        .payment-box h3 {
            color: #1A1A1A;
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
            font-family: 'Sabon Next LT Pro', serif;
        }
        .payment-box p {
            color: #4A4A4A;
            margin: 0 0 24px 0;
            font-size: 15px;
            line-height: 1.6;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .payment-button {
            display: inline-block;
            background: #1A1A1A;
            color: #FFFCF8;
            padding: 16px 40px;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            font-family: 'Parisine Pro Gris', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: background-color 0.2s;
        }
        .payment-button:hover {
            background: #2D2D2D;
        }
        .contact-section {
            background-color: #F8F6F3;
            border-radius: 4px;
            padding: 24px;
            margin: 28px 0;
            border: 1px solid #EDEAE3;
        }
        .contact-section h4 {
            color: #1A1A1A;
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            font-family: 'Sabon Next LT Pro', serif;
        }
        .contact-section p {
            color: #4A4A4A;
            margin: 10px 0;
            font-size: 14px;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .footer {
            background-color: #F8F6F3;
            padding: 32px 30px;
            text-align: center;
            border-top: 1px solid #EDEAE3;
        }
        .footer p {
            margin: 8px 0;
            color: #4A4A4A;
            font-size: 14px;
            font-family: 'Parisine Pro Gris', sans-serif;
        }
        .footer strong {
            color: #1A1A1A;
            font-weight: 600;
            font-family: 'Sabon Next LT Pro', serif;
        }
        .footer .disclaimer {
            margin-top: 24px;
            font-size: 12px;
            color: #6B7280;
        }
        @media (max-width: 600px) {
            body {
                padding: 0;
                margin: 0;
            }
            .email-wrapper {
                max-width: 100%;
                margin: 0;
            }
            .content {
                padding: 24px 16px;
            }
            .header {
                padding: 32px 16px;
            }
            .header h1 {
                font-size: 26px;
            }
            .header p {
                font-size: 14px;
            }
            .greeting {
                margin-bottom: 24px;
            }
            .greeting h2 {
                font-size: 22px;
            }
            .order-badge {
                padding: 12px 20px;
                font-size: 16px;
                margin: 20px 0 12px 0;
            }
            .info-section {
                padding: 20px 16px;
                margin: 20px 0;
            }
            .info-section h3 {
                font-size: 16px;
                margin-bottom: 16px;
            }
            .info-row {
                flex-direction: column;
                align-items: flex-start;
                margin: 12px 0;
                padding: 10px 0;
            }
            .info-label {
                font-size: 13px;
                margin-bottom: 4px;
            }
            .info-value {
                text-align: left;
                margin-top: 0;
                font-size: 14px;
                width: 100%;
            }
            .items-table {
                font-size: 12px;
                width: 100%;
                display: table;
            }
            .items-table th,
            .items-table td {
                padding: 10px 6px;
                font-size: 11px;
            }
            .items-table th:first-child,
            .items-table td:first-child {
                padding-left: 12px;
            }
            .items-table th:last-child,
            .items-table td:last-child {
                padding-right: 12px;
            }
            .items-table th:nth-child(2),
            .items-table th:nth-child(3),
            .items-table th:nth-child(4),
            .items-table td:nth-child(2),
            .items-table td:nth-child(3),
            .items-table td:nth-child(4) {
                text-align: center;
                width: 20%;
            }
            .items-table th:first-child,
            .items-table td:first-child {
                width: 40%;
            }
            .highlight-box,
            .payment-box {
                padding: 20px 16px;
                margin: 24px 0;
            }
            .payment-box h3 {
                font-size: 18px;
            }
            .payment-box p {
                font-size: 14px;
                margin-bottom: 20px;
            }
            .payment-button {
                padding: 14px 28px;
                font-size: 14px;
                width: 100%;
                max-width: 280px;
            }
            .contact-section {
                padding: 20px 16px;
                margin: 20px 0;
            }
            .contact-section h4 {
                font-size: 15px;
            }
            .contact-section p {
                font-size: 13px;
            }
            .footer {
                padding: 24px 16px;
            }
            .footer p {
                font-size: 13px;
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
                <h3>Sifariş Məlumatları</h3>
                
                @if($order->company_name)
                <div class="info-row">
                    <span class="info-label">Şirkət:</span>
                    <span class="info-value">{{ $order->company_name }}</span>
                </div>
                @endif

                @if($order->delivery_date)
                <div class="info-row">
                    <span class="info-label">Çatdırılma tarixi:</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($order->delivery_date)->format('d.m.Y') }}</span>
                </div>
                @endif

                @if($order->delivery_time)
                <div class="info-row">
                    <span class="info-label">Çatdırılma vaxtı:</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($order->delivery_time)->format('H:i') }}</span>
                </div>
                @endif

                @if($order->delivery_address)
                <div class="info-row">
                    <span class="info-label">Ünvan:</span>
                    <span class="info-value">{{ $order->delivery_address }}</span>
                </div>
                @endif

                @if($coordinator)
                <div class="info-row">
                    <span class="info-label">Koordinator:</span>
                    <span class="info-value">{{ $coordinator->name }}</span>
                </div>
                @endif

                @if($totalAmount > 0)
                <div class="info-row" style="border-top: 2px solid #1A1A1A; margin-top: 18px; padding-top: 18px;">
                    <span class="info-label" style="font-size: 16px;">Ümumi məbləğ:</span>
                    <span class="info-value" style="font-size: 20px; font-weight: bold; color: #1A1A1A;">{{ number_format($totalAmount, 2) }} ₼</span>
                </div>
                @endif
            </div>

            <!-- Menu Items -->
            @if($order->menu_items && count($order->menu_items) > 0)
            <div class="info-section">
                <h3>Sifariş Edilən Məhsullar</h3>
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

            <!-- Comments -->
            @if($order->kitchen_comment || $order->operation_comment || $order->desserts_comment)
            <div class="info-section">
                <h3>Əlavə Qeydlər</h3>
                @if($order->kitchen_comment)
                <p style="color: #4A4A4A; margin: 0 0 10px 0; white-space: pre-wrap; font-family: 'Parisine Pro Gris', sans-serif;">
                    <strong>Mətbəx üçün:</strong> {{ $order->kitchen_comment }}
                </p>
                @endif
                @if($order->operation_comment)
                <p style="color: #4A4A4A; margin: 0 0 10px 0; white-space: pre-wrap; font-family: 'Parisine Pro Gris', sans-serif;">
                    <strong>Operation üçün:</strong> {{ $order->operation_comment }}
                </p>
                @endif
                @if($order->desserts_comment)
                <p style="color: #4A4A4A; margin: 0; white-space: pre-wrap; font-family: 'Parisine Pro Gris', sans-serif;">
                    <strong>Şirniyyatlar üçün:</strong> {{ $order->desserts_comment }}
                </p>
                @endif
            </div>
            @endif

            <!-- Payment Required Box (for one-time clients) -->
            @if($isOneTimeClient && $paymentUrl)
            <div class="payment-box">
                <h3>Ödəniş Tələb Olunur</h3>
                <p>
                    Sifarişinizin təsdiqlənməsi və hazırlanması üçün ödəniş edilməlidir.
                </p>
                <a href="{{ $paymentUrl }}" class="payment-button">
                    Ödəniş Et
                </a>
                <p style="margin-top: 20px; font-size: 13px; font-weight: normal;">
                    Ödəniş edildikdən sonra sifarişiniz hazırlanma prosesinə keçəcək
                </p>
            </div>
            @else
            <!-- Highlight Box (for regular clients) -->
            <div class="highlight-box">
                <p>Sifarişiniz qəbul edildi və hazırlanma prosesindədir</p>
                <p style="margin-top: 12px; font-size: 14px; font-weight: normal;">
                    Hazır olduqda sizə məlumat veriləcək
                </p>
            </div>
            @endif

            <!-- Contact Information -->
            @if($client)
            <div class="contact-section">
                <h4>Əlaqə Məlumatları</h4>
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
            <p>info@paul-azerbaijan.com</p>
            <p>+994 50 123 45 67</p>
            <p>Bakı şəhəri</p>
            <p>www.paul-azerbaijan.com</p>
            
            <p class="disclaimer">
                Bu email avtomatik olaraq göndərilmişdir. Cavab verməyin.
            </p>
        </div>
    </div>
</body>
</html>
