<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationStatusChanged extends Mailable
{
    use Queueable, SerializesModels;

    public $application;
    public $previousStatus;

    /**
     * Create a new message instance.
     */
    public function __construct(Application $application, string $previousStatus)
    {
        $this->application = $application;
        $this->previousStatus = $previousStatus;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'PAUL Katerinq - Status sifarişiniz dəyişdirildi',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.application-status-changed',
            with: [
                'application' => $this->application,
                'previousStatus' => $this->getStatusLabel($this->previousStatus),
                'currentStatus' => $this->getStatusLabel($this->application->status),
                'totalAmount' => $this->calculateTotalAmount(),
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

    /**
     * Рассчитывает общую сумму заказа
     */
    private function calculateTotalAmount(): float
    {
        if (!$this->application->cart_items) {
            return 0;
        }

        return collect($this->application->cart_items)->sum(function ($item) {
            return $item['price'] * $item['quantity'];
        });
    }

    /**
     * Получает читаемое название статуса
     */
    private function getStatusLabel(string $status): string
    {
        return match($status) {
            'new' => 'Yeni',
            'processing' => 'İşlənir',
            'approved' => 'Təsdiqləndi',
            'rejected' => 'Rədd edildi',
            default => $status
        };
    }
}
