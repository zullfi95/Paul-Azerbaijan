<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('user_type', 'client');

        if ($request->filled('client_category')) {
            $query->where('client_category', $request->client_category);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('company_name')) {
            $query->where('company_name', 'like', '%' . $request->company_name . '%');
        }

        $clients = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $clients,
        ]);
    }

    public function show(User $client)
    {
        // Проверяем, что это клиент
        if ($client->user_type !== 'client') {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не является клиентом',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'client' => $client,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'client_category' => 'required|in:corporate,one_time',
            'status' => 'in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors(),
            ], 422);
        }

        $clientData = $validator->validated();
        $clientData['user_type'] = 'client';
        $clientData['password'] = bcrypt('password123'); // Временный пароль
        
        $client = User::create($clientData);

        return response()->json([
            'success' => true,
            'message' => 'Клиент успешно создан',
            'data' => [
                'client' => $client,
            ],
        ], 201);
    }

    public function update(Request $request, User $client)
    {
        // Проверяем, что это клиент
        if ($client->user_type !== 'client') {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не является клиентом',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $client->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'client_category' => 'sometimes|in:corporate,one_time',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors(),
            ], 422);
        }

        $client->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Клиент успешно обновлен',
            'data' => [
                'client' => $client->fresh(),
            ],
        ]);
    }

    public function destroy(User $client)
    {
        // Проверяем, что это клиент
        if ($client->user_type !== 'client') {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не является клиентом',
            ], 404);
        }

        $client->delete();

        return response()->json([
            'success' => true,
            'message' => 'Клиент успешно удален',
        ]);
    }

    public function statistics()
    {
        $stats = [
            'total' => User::where('user_type', 'client')->count(),
            'corporate' => User::where('user_type', 'client')->where('client_category', 'corporate')->count(),
            'one_time' => User::where('user_type', 'client')->where('client_category', 'one_time')->count(),
            'active' => User::where('user_type', 'client')->where('status', 'active')->count(),
            'inactive' => User::where('user_type', 'client')->where('status', 'inactive')->count(),
            'suspended' => User::where('user_type', 'client')->where('status', 'suspended')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}


