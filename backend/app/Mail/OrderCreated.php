<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderCreated extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        // Загружаем клиента, если не загружен
        if (!$this->order->relationLoaded('client')) {
            $this->order->load('client');
        }
        
        // Определяем тему письма в зависимости от типа клиента
        // Проверяем client_type из заказа или client_category из клиента
        $clientType = $this->order->client_type ?? ($this->order->client->client_category ?? null);
        $isOneTimeClient = $this->order->client && ($clientType === 'one_time' || $clientType === 'one-time');
        $subject = $isOneTimeClient 
            ? 'PAUL Azerbaijan - Sifariş yaradıldı - Ödəniş gözlənilir'
            : 'PAUL Azerbaijan - Yeni sifariş yaradıldı';
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        // Загружаем связи, если они не загружены
        if (!$this->order->relationLoaded('client')) {
            $this->order->load('client');
        }
        if (!$this->order->relationLoaded('coordinator')) {
            $this->order->load('coordinator');
        }

        // Определяем, является ли клиент разовым
        // Сначала проверяем client_type из заказа, затем client_category из клиента
        $clientType = $this->order->client_type ?? ($this->order->client->client_category ?? null);
        $isOneTimeClient = $this->order->client && ($clientType === 'one_time' || $clientType === 'one-time');
        
        // Генерируем URL для оплаты, если клиент разовый
        $paymentUrl = null;
        if ($isOneTimeClient) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $paymentUrl = rtrim($frontendUrl, '/') . '/payment/' . $this->order->id;
        }

        return new Content(
            view: 'emails.order-created',
            with: [
                'order' => $this->order,
                'client' => $this->order->client,
                'coordinator' => $this->order->coordinator,
                'totalAmount' => $this->order->final_amount ?? $this->order->total_amount ?? 0,
                'isOneTimeClient' => $isOneTimeClient,
                'paymentUrl' => $paymentUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
