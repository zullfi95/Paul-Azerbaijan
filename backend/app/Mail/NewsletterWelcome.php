<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterWelcome extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $email;
    public $unsubscribeUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(string $email, string $unsubscribeToken)
    {
        $this->email = $email;
        
        // Генерируем URL для отписки
        $frontendUrl = config('app.frontend_url', config('app.url', 'https://paul-azerbaijan.com'));
        $this->unsubscribeUrl = rtrim($frontendUrl, '/') . '/newsletter/unsubscribe?token=' . $unsubscribeToken;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'PAUL Azerbaijan - Xoş gəlmisiniz!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter-welcome',
            with: [
                'email' => $this->email,
                'unsubscribeUrl' => $this->unsubscribeUrl,
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
