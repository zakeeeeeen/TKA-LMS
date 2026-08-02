<?php

namespace App\Http\Controllers;

use App\Models\WahoChat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WahoChatController extends Controller
{
    private function candidateModels(): array
    {
        $primaryModel = trim((string) config('services.gemini.model', 'gemini-2.5-flash-latest'));
        $fallbackModels = config('services.gemini.fallback_models', []);

        if (! is_array($fallbackModels)) {
            $fallbackModels = [];
        }

        return array_values(array_unique(array_filter([
            $primaryModel,
            ...$fallbackModels,
        ])));
    }

    public function index(Request $request)
    {
        $userId = auth()->id();
        $sessionId = $request->query('session_id');

        if (!$sessionId) {
            // Find latest session or generate new
            $latest = WahoChat::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->first();
            $sessionId = $latest?->session_id ?? (string) Str::uuid();
        }

        $messages = WahoChat::where('user_id', $userId)
            ->where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->get(['id', 'role', 'content', 'created_at']);

        return response()->json([
            'session_id' => $sessionId,
            'messages' => $messages,
        ]);
    }

    public function history()
    {
        $userId = auth()->id();

        $sessions = WahoChat::where('user_id', $userId)
            ->select('session_id', \DB::raw('MIN(created_at) as created_at'), \DB::raw('COUNT(*) as total_messages'))
            ->groupBy('session_id')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) use ($userId) {
                $firstMsg = WahoChat::where('user_id', $userId)
                    ->where('session_id', $item->session_id)
                    ->where('role', 'user')
                    ->first();

                return [
                    'session_id' => $item->session_id,
                    'title' => $firstMsg ? Str::limit($firstMsg->content, 35) : 'Percakapan AI Waho',
                    'created_at' => $item->created_at,
                ];
            });

        return response()->json([
            'sessions' => $sessions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'nullable|string',
        ]);

        $userId = auth()->id();
        $user = auth()->user();
        $sessionId = $validated['session_id'] ?? (string) Str::uuid();

        // Save user message
        $userChat = WahoChat::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => trim($validated['message']),
        ]);

        $apiKey = config('services.gemini.api_key');
        if (! $apiKey) {
            $botReply = "Halo! Maaf ya, konfigurasi Gemini API Key belum terpasang di sistem. Silakan hubungi admin.";
            $assistantChat = WahoChat::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'role' => 'assistant',
                'content' => $botReply,
            ]);
            return response()->json([
                'session_id' => $sessionId,
                'user_message' => $userChat,
                'assistant_message' => $assistantChat,
            ]);
        }

        // Fetch previous chat history in this session
        $recentHistory = WahoChat::where('user_id', $userId)
            ->where('session_id', $sessionId)
            ->orderBy('created_at', 'asc')
            ->take(10)
            ->get();

        $contents = [];

        // System Instruction / Waho Persona Prompt
        $systemPrompt = "Kamu adalah WAHO, AI Assistant resmi untuk platform pembelajaran Tes Kemampuan Akademik (TKA). " .
            "Sifat kamu: Sangat ramah, sopan, ceria, berwawasan tinggi, dan penuh semangat membantu siswa, guru, serta orang tua. " .
            "Gunakan bahasa Indonesia yang jelas, hangat, dan komunikatif. " .
            "Format jawabanmu dengan rapi menggunakan markdown jika perlu. " .
            "Info Pengguna saat ini: Nama: {$user->name}, Role: {$user->role}. " .
            "Bantulah menjawab pertanyaan seputar platform TKA, materi pelajaran, kuis, pendaftaran kursus, tips belajar, dan kendala pengguna secara akurat dan cerdas.";

        foreach ($recentHistory as $msg) {
            $contents[] = [
                'role' => $msg->role === 'user' ? 'user' : 'model',
                'parts' => [
                    ['text' => $msg->content],
                ],
            ];
        }

        $models = $this->candidateModels();
        $aiResponseText = null;

        foreach ($models as $model) {
            try {
                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->timeout(30)
                    ->post($endpoint, [
                        'system_instruction' => [
                            'parts' => [
                                ['text' => $systemPrompt],
                            ],
                        ],
                        'contents' => $contents,
                    ]);

                if ($response->successful()) {
                    $aiResponseText = $response->json('candidates.0.content.parts.0.text');
                    if ($aiResponseText) {
                        break;
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Gemini AI Waho call failed for model {$model}: " . $e->getMessage());
            }
        }

        if (! $aiResponseText) {
            $aiResponseText = "Halo {$user->name}! Waho sedang mengalami sedikit kendala koneksi ke server AI. Mohon coba tanyakan kembali sejenak lagi ya! 😊";
        }

        $assistantChat = WahoChat::create([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'role' => 'assistant',
            'content' => trim($aiResponseText),
        ]);

        return response()->json([
            'session_id' => $sessionId,
            'user_message' => $userChat,
            'assistant_message' => $assistantChat,
        ]);
    }
}
