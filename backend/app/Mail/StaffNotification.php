<?php

namespace App\Mail;

use App\Models\Application;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $notificationType;
    public $data;
    public $staffRole;

    /**
     * Create a new message instance.
     */
    public function __construct(string $notificationType, $data, string $staffRole = 'coordinator')
    {
        $this->notificationType = $notificationType;
        $this->data = $data;
        $this->staffRole = $staffRole;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->notificationType) {
            'new_application' => 'PAUL Katerinq - Yeni müraciət',
            'application_status_changed' => 'PAUL Katerinq - Müraciət statusu dəyişdirildi',
            'new_order' => 'PAUL Katerinq - Yeni sifariş',
            'order_updated' => 'PAUL Katerinq - Sifariş yeniləndi',
            default => 'PAUL Katerinq - Bildiriş'
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $view = match($this->notificationType) {
            'new_application' => 'emails.staff.new-application',
            'application_status_changed' => 'emails.staff.application-status-changed',
            'new_order' => 'emails.staff.new-order',
            'order_updated' => 'emails.staff.order-updated',
            default => 'emails.staff.general-notification'
        };

        return new Content(
            view: $view,
            with: [
                'data' => $this->data,
                'staffRole' => $this->staffRole,
                'notificationType' => $this->notificationType,
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
