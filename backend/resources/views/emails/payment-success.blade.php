<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ödəniş Uğurlu - PAUL Katerinq</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F8FAFC;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">PAUL Katerinq</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Premium Katerinq Xidməti</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            
            <!-- Success Icon -->
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                    <span style="color: white; font-size: 40px;">✓</span>
                </div>
                <h2 style="color: #1F2937; margin: 0 0 10px 0; font-size: 24px;">Ödəniş Uğurlu!</h2>
                <p style="color: #6B7280; margin: 0; font-size: 16px;">Sifarişiniz uğurla ödənildi və hazırlanma prosesinə keçdi.</p>
            </div>
            
            <!-- Order Details -->
            <div style="background: #F9FAFB; border-radius: 10px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #1F2937; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px;">Sifariş Məlumatları</h3>
                
                <div style="display: grid; gap: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6B7280; font-weight: 500;">Sifariş №:</span>
                        <span style="color: #1F2937; font-weight: bold; font-size: 16px;">#{{ $order->id }}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6B7280; font-weight: 500;">Şirkət:</span>
                        <span style="color: #1F2937; font-weight: bold;">{{ $order->company_name }}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6B7280; font-weight: 500;">Ödənilən Məbləğ:</span>
                        <span style="color: #059669; font-weight: bold; font-size: 18px;">{{ number_format($order->final_amount, 2) }} ₼</span>
                    </div>
                    
                    @if($order->delivery_date)
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6B7280; font-weight: 500;">Çatdırılma Tarixi:</span>
                        <span style="color: #1F2937; font-weight: bold;">{{ \Carbon\Carbon::parse($order->delivery_date)->format('d.m.Y') }}</span>
                    </div>
                    @endif
                    
                    @if($order->delivery_time)
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6B7280; font-weight: 500;">Çatdırılma Saatı:</span>
                        <span style="color: #1F2937; font-weight: bold;">{{ \Carbon\Carbon::parse($order->delivery_time)->format('H:i') }}</span>
                    </div>
                    @endif
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6B7280; font-weight: 500;">Status:</span>
                        <span style="color: #059669; font-weight: bold; background: #D1FAE5; padding: 4px 12px; border-radius: 20px; font-size: 14px;">Ödənildi</span>
                    </div>
                </div>
            </div>
            
            <!-- Payment Details -->
            @if($order->payment_details)
            <div style="background: #F0F9FF; border-radius: 10px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #3B82F6;">
                <h3 style="color: #1F2937; margin: 0 0 15px 0; font-size: 18px;">Ödəniş Detalları</h3>
                
                <div style="display: grid; gap: 10px; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #6B7280;">Ödəniş Tarixi:</span>
                        <span style="color: #1F2937; font-weight: 500;">{{ \Carbon\Carbon::parse($order->payment_completed_at)->format('d.m.Y H:i') }}</span>
                    </div>
                    
                    @if(isset($order->payment_details['auth_code']))
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #6B7280;">Avtorizasiya Kodu:</span>
                        <span style="color: #1F2937; font-weight: 500;">{{ $order->payment_details['auth_code'] }}</span>
                    </div>
                    @endif
                </div>
            </div>
            @endif
            
            <!-- Next Steps -->
            <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 10px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #F59E0B;">
                <h3 style="color: #92400E; margin: 0 0 15px 0; font-size: 18px;">Növbəti Addımlar</h3>
                <ul style="color: #92400E; margin: 0; padding-left: 20px; line-height: 1.6;">
                    <li>Sifarişiniz hazırlanma prosesinə keçdi</li>
                    <li>Hazırlıq statusu haqqında məlumat alacaqsınız</li>
                    <li>Çatdırılma zamanı sizinlə əlaqə saxlanılacaq</li>
                </ul>
            </div>
            
            <!-- Contact Info -->
            <div style="text-align: center; padding: 25px; background: #F8FAFC; border-radius: 10px;">
                <h3 style="color: #1F2937; margin: 0 0 15px 0; font-size: 18px;">Suallarınız var?</h3>
                <p style="color: #6B7280; margin: 0 0 15px 0; font-size: 14px;">Bizim komanda sizə kömək etməyə hazırdır</p>
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    <a href="tel:+994501234567" style="color: #3B82F6; text-decoration: none; font-weight: 500;">📞 +994 50 123 45 67</a>
                    <a href="mailto:info@paul.az" style="color: #3B82F6; text-decoration: none; font-weight: 500;">✉️ info@paul.az</a>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #1F2937; padding: 25px; text-align: center;">
            <p style="color: #9CA3AF; margin: 0 0 10px 0; font-size: 14px;">PAUL Katerinq komandası</p>
            <p style="color: #6B7280; margin: 0; font-size: 12px;">Bu email avtomatik olaraq göndərilmişdir</p>
        </div>
    </div>
</body>
</html>
