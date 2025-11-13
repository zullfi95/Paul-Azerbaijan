<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestEmail extends Command
{
    protected $signature = 'email:test {recipient}';
    protected $description = 'Send a test email to verify email configuration';

    public function handle()
    {
        $recipient = $this->argument('recipient');
        
        $this->info("Sending test email to: {$recipient}");
        
        try {
            Mail::raw("This is a test email from PAUL Azerbaijan system.\n\nAll systems are operational!\n\nDate: " . date('Y-m-d H:i:s') . "\n\n---\nBest regards,\nPAUL Azerbaijan Team\nhttps://paul-azerbaijan.com", function ($message) use ($recipient) {
                $message->to($recipient)
                        ->subject('Test Email from PAUL Azerbaijan');
            });
            
            $this->info("✅ Email sent successfully to {$recipient}");
            $this->info("Please check your inbox (and spam folder)");
            
            return 0;
        } catch (\Exception $e) {
            $this->error("❌ Failed to send email: " . $e->getMessage());
            $this->error("Check MAIL configuration in .env");
            
            return 1;
        }
    }
}

