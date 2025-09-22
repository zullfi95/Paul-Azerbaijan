<?php

return [

    /*
    |--------------------------------------------------------------------------
    | AIKO API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for AIKO menu API integration
    |
    */

    'api_url' => env('AIKO_API_URL', ''),
    'api_key' => env('AIKO_API_KEY', ''),
    'api_secret' => env('AIKO_API_SECRET', ''),
    
    'timeout' => 30,
    
    'cache_ttl' => [
        'categories' => 3600, // 1 hour
        'items' => 1800,      // 30 minutes  
        'item' => 3600,       // 1 hour
    ],

    'endpoints' => [
        'categories' => '/api/menu/categories',
        'items' => '/api/menu/items',
        'item' => '/api/menu/item',
    ],

];
