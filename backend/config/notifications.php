<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Additional Staff Email Addresses
    |--------------------------------------------------------------------------
    |
    | Additional email addresses that should receive notifications.
    | These are in addition to the staff users in the database.
    |
    */
    'additional_staff_emails' => [
        'chef@paul.az' => 'chef',
        'operations@paul.az' => 'operations_manager',
        'manager@paul.az' => 'catering_manager',
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    |
    | Configure when and how notifications are sent.
    |
    */
    'settings' => [
        'send_new_application_notifications' => env('SEND_NEW_APPLICATION_NOTIFICATIONS', true),
        'send_status_change_notifications' => env('SEND_STATUS_CHANGE_NOTIFICATIONS', true),
        'send_order_notifications' => env('SEND_ORDER_NOTIFICATIONS', true),
        'send_weekly_reports' => env('SEND_WEEKLY_REPORTS', true),
        'send_upcoming_event_reminders' => env('SEND_UPCOMING_EVENT_REMINDERS', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Templates
    |--------------------------------------------------------------------------
    |
    | Configure email template settings.
    |
    */
    'templates' => [
        'brand_colors' => [
            'primary' => '#1A1A1A',
            'secondary' => '#D4AF37',
            'accent' => '#B8942F',
            'light' => '#F9F9F6',
            'text' => '#4A4A4A',
        ],
        'company_info' => [
            'name' => 'PAUL Azerbaijan',
            'email' => 'info@paul.az',
            'phone' => '+994 50 123 45 67',
            'address' => 'Bakı şəhəri, Nizami küçəsi, 1',
            'website' => 'www.paul.az',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Timing Settings
    |--------------------------------------------------------------------------
    |
    | Configure timing for various notification features.
    |
    */
    'timing' => [
        'urgent_threshold_hours' => 48, // Orders within this time are marked as urgent
        'reminder_hours_before' => 24, // Send reminders this many hours before events
        'weekly_report_day' => 'monday', // Day to send weekly reports
        'weekly_report_time' => '09:00', // Time to send weekly reports
    ],
];
