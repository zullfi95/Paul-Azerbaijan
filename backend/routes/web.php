<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// CSRF cookie для фронтенда
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Именованный маршрут login для Laravel Authenticate middleware
// Фактический login обрабатывается через API /api/login
Route::get('/login', function () {
    return redirect('/auth/login');
})->name('login');
