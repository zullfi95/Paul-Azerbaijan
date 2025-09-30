<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Новый заказ</title>
</head>
<body>
    <h2>Новый заказ #{{ $order->id }}</h2>
    
    <p>Поступил новый заказ от клиента:</p>
    
    <h3>Информация о клиенте:</h3>
    <ul>
        <li><strong>Имя:</strong> {{ $order->client->name ?? 'Не указано' }}</li>
        <li><strong>Email:</strong> {{ $order->client->email ?? 'Не указано' }}</li>
        <li><strong>Телефон:</strong> {{ $order->client->phone ?? 'Не указано' }}</li>
        <li><strong>Компания:</strong> {{ $order->company_name ?? 'Не указано' }}</li>
    </ul>
    
    <h3>Детали заказа:</h3>
    <ul>
        <li><strong>Дата доставки:</strong> {{ $order->delivery_date ? $order->delivery_date->format('d.m.Y') : 'Не указано' }}</li>
        <li><strong>Время доставки:</strong> {{ $order->delivery_time ? $order->delivery_time->format('H:i') : 'Не указано' }}</li>
        <li><strong>Тип доставки:</strong> {{ $order->delivery_type ?? 'Не указано' }}</li>
        <li><strong>Адрес доставки:</strong> {{ $order->delivery_address ?? 'Не указано' }}</li>
        <li><strong>Общая сумма:</strong> {{ $order->final_amount ?? 0 }} руб.</li>
    </ul>
    
    @if($order->comment)
    <h3>Комментарий:</h3>
    <p>{{ $order->comment }}</p>
    @endif
    
    <h3>Состав заказа:</h3>
    @if($order->menu_items && is_array($order->menu_items))
        <ul>
        @foreach($order->menu_items as $item)
            <li>{{ $item['name'] ?? 'Неизвестный товар' }} - {{ $item['quantity'] ?? 1 }} шт. по {{ $item['price'] ?? 0 }} руб.</li>
        @endforeach
        </ul>
    @else
        <p>Товары не указаны</p>
    @endif
    
    <p>
        <a href="{{ config('app.frontend_url') }}/dashboard/orders/{{ $order->id }}">Просмотреть заказ в системе</a>
    </p>
</body>
</html>
