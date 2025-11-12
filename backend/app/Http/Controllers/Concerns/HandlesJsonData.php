<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

trait HandlesJsonData
{
    /**
     * Парсит JSON данные из запроса, обрабатывая различные форматы
     */
    protected function parseJsonData(Request $request): array
    {
        $data = $request->all();
        
        Log::info('Initial request data', ['data' => $data]);
        Log::info('Request content', ['content' => $request->getContent()]);
        Log::info('Request isJson', ['is_json' => $request->isJson()]);
        
        // Handle cases where data is double-encoded JSON string
        if ($request->isJson() && is_string($request->getContent())) {
            $decoded = json_decode($request->getContent(), true);
            Log::info('Direct JSON decode attempt', ['decoded' => $decoded, 'is_string' => is_string($decoded)]);
            
            // If first decode results in a string, try to decode it again (double-encoded JSON)
            if (is_string($decoded)) {
                $doubleDecoded = json_decode($decoded, true);
                Log::info('Double JSON decode attempt', ['decoded' => $doubleDecoded, 'is_array' => is_array($doubleDecoded)]);
                if (is_array($doubleDecoded)) {
                    $data = $doubleDecoded;
                }
            } elseif (is_array($decoded)) {
                $data = $decoded;
            }
        }
        
        // Handle cases where data comes wrapped in a 'data' array with JSON string
        if (isset($data['data']) && is_array($data['data']) && count($data['data']) === 1 && is_string($data['data'][0])) {
            Log::info('Attempting to decode JSON from data array', ['json_string' => $data['data'][0]]);
            $decodedData = json_decode($data['data'][0], true);
            if (is_array($decodedData)) {
                Log::info('JSON decoded successfully', ['decoded_keys' => array_keys($decodedData)]);
                $data = $decodedData;
            } else {
                Log::error('Failed to decode JSON', ['json_error' => json_last_error_msg()]);
            }
        } else {
            Log::info('Data structure check', [
                'has_data_key' => isset($data['data']),
                'is_array' => isset($data['data']) ? is_array($data['data']) : false,
                'count' => isset($data['data']) && is_array($data['data']) ? count($data['data']) : 0,
                'first_is_string' => isset($data['data'][0]) ? is_string($data['data'][0]) : false
            ]);
        }
        
        Log::info('Final parsed data', ['data' => $data]);
        
        return $data;
    }

    /**
     * Парсит JSON данные из запроса для создания заказа из заявки
     */
    protected function parseJsonDataForApplication(Request $request): array
    {
        $data = $request->all();
        $content = $request->getContent();
        
        Log::info('Raw content:', ['content' => $content]);
        
        if ($request->isJson() && !empty($content)) {
            $decoded = json_decode($content, true);
            Log::info('JSON decode result:', ['decoded' => $decoded, 'json_error' => json_last_error_msg()]);
            
            if (is_array($decoded)) {
                // Check if data is wrapped in 'content' field
                if (isset($decoded['content']) && is_string($decoded['content'])) {
                    Log::info('Data wrapped in content field, decoding inner JSON');
                    $innerDecoded = json_decode($decoded['content'], true);
                    if (is_array($innerDecoded)) {
                        $data = $innerDecoded;
                        Log::info('Inner JSON decoded successfully:', $data);
                    } else {
                        // Try to fix the JSON format
                        $fixedJson = preg_replace('/(\w+):/', '"$1":', $decoded['content']);
                        Log::info('Fixed JSON:', ['fixed' => $fixedJson]);
                        $fixedDecoded = json_decode($fixedJson, true);
                        if (is_array($fixedDecoded)) {
                            $data = $fixedDecoded;
                            Log::info('Fixed JSON decoded successfully:', $data);
                        }
                    }
                } else {
                    $data = $decoded;
                    Log::info('JSON data decoded successfully:', $data);
                }
            }
        }
        
        Log::info('Final data for validation:', $data);
        
        return $data;
    }
}
