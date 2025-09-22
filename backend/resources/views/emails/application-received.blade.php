<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAUL Katerinq - Sifariş təsdiqi</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #1A1A1A 0%, #D4AF37 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .success-icon {
            text-align: center;
            margin-bottom: 30px;
        }
        .success-icon .circle {
            width: 80px;
            height: 80px;
            background-color: #10B981;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .success-icon .checkmark {
            font-size: 40px;
            color: white;
        }
        .greeting {
            text-align: center;
            margin-bottom: 30px;
        }
        .greeting h2 {
            color: #1A1A1A;
            margin-bottom: 10px;
        }
        .greeting p {
            color: #666;
            font-size: 16px;
        }
        .order-details {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #D4AF37;
        }
        .order-details h3 {
            color: #1A1A1A;
            margin-top: 0;
            margin-bottom: 20px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #555;
        }
        .detail-value {
            color: #1A1A1A;
            text-align: right;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .items-table th {
            background-color: #D4AF37;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total-row {
            background-color: #1A1A1A !important;
            color: white;
            font-weight: bold;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 20px;
            padding: 20px;
            background-color: #e8f5e8;
            border-radius: 8px;
            border: 1px solid #c3e6c3;
        }
        .contact-info h4 {
            color: #2d5a2d;
            margin-top: 0;
        }
        .contact-info p {
            color: #2d5a2d;
            margin: 5px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
                text-align: center;
            }
            .detail-value {
                text-align: center;
                margin-top: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>PAUL Katerinq</h1>
            <p>Xüsusi tədbirlər üçün premium kulinar xidməti</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Success Icon -->
            <div class="success-icon">
                <div class="circle">
                    <span class="checkmark">✓</span>
                </div>
            </div>

            <!-- Greeting -->
            <div class="greeting">
                <h2>Təşəkkür edirik, {{ $application->first_name }}!</h2>
                <p>Sifarişiniz uğurla qəbul edildi və hal-hazırda işlənir.</p>
            </div>

            <!-- Order Details -->
            <div class="order-details">
                <h3>Sifariş məlumatları</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Sifariş nömrəsi:</span>
                    <span class="detail-value">#{{ $application->id }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Tarix:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($application->created_at)->format('d.m.Y H:i') }}</span>
                </div>
                
                @if($application->event_address)
                <div class="detail-row">
                    <span class="detail-label">Tədbir ünvanı:</span>
                    <span class="detail-value">{{ $application->event_address }}</span>
                </div>
                @endif
                
                @if($application->event_date)
                <div class="detail-row">
                    <span class="detail-label">Tədbir tarixi:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($application->event_date)->format('d.m.Y') }}</span>
                </div>
                @endif
                
                @if($application->event_time)
                <div class="detail-row">
                    <span class="detail-label">Tədbir vaxtı:</span>
                    <span class="detail-value">{{ $application->event_time }}</span>
                </div>
                @endif
            </div>

            <!-- Items Table -->
            @if($application->cart_items && count($application->cart_items) > 0)
            <div class="order-details">
                <h3>Sifariş edilən məhsullar</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Məhsul</th>
                            <th>Miqdar</th>
                            <th>Qiymət</th>
                            <th>Məbləğ</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($application->cart_items as $item)
                        <tr>
                            <td>{{ $item['name'] }}</td>
                            <td>{{ $item['quantity'] }}</td>
                            <td>{{ $item['price'] }} ₼</td>
                            <td>{{ $item['price'] * $item['quantity'] }} ₼</td>
                        </tr>
                        @endforeach
                        <tr class="total-row">
                            <td colspan="3"><strong>Ümumi məbləğ:</strong></td>
                            <td><strong>{{ $totalAmount }} ₼</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            @endif

            <!-- Contact Info -->
            <div class="contact-info">
                <h4>Əlaqə məlumatları</h4>
                <p><strong>Ad:</strong> {{ $application->first_name }} {{ $application->last_name }}</p>
                <p><strong>E-poçt:</strong> {{ $application->email }}</p>
                <p><strong>Telefon:</strong> {{ $application->phone }}</p>
                @if($application->message)
                <p><strong>Şərh:</strong> {{ $application->message }}</p>
                @endif
            </div>

            <!-- Next Steps -->
            <div class="order-details">
                <h3>Növbəti addımlar</h3>
                <p>✅ Sifarişiniz qəbul edildi</p>
                <p>⏳ Bizim komanda sizinlə 24 saat ərzində əlaqə saxlayacaq</p>
                <p>📋 Tədbir detalları müzakirə ediləcək</p>
                <p>🎯 Xüsusi təklif hazırlanacaq</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>PAUL Katerinq</strong></p>
            <p>Premium kulinar xidməti</p>
            <p>Telefon: +994 50 123 45 67</p>
            <p>E-poçt: info@paul-catering.az</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
                Bu e-poçt avtomatik olaraq göndərilib. Cavablamayın.
            </p>
        </div>
    </div>
</body>
</html>
