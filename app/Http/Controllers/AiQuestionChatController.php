<?php

namespace App\Http\Controllers;

use App\Models\AiQuestionMessage;
use App\Models\ExamAnswer;
use App\Models\ExamResult;
use App\Models\Question;
use App\Support\QuestionTypeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AiQuestionChatController extends Controller
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

    private function hasPerUserExamResults(): bool
    {
        return Schema::hasColumn('exam_results', 'user_id');
    }

    private function resolveResultUserId(ExamResult $examResult): ?int
    {
        if ($this->hasPerUserExamResults() && $examResult->user_id) {
            return (int) $examResult->user_id;
        }

        $examResult->loadMissing('exam.students');

        return $examResult->exam?->students?->pluck('id')->first();
    }

    private function ensureCanChat(ExamResult $examResult, Question $question): void
    {
        $user = auth()->user();

        $examResult->loadMissing('exam.questionPackage.questions');
        $exam = $examResult->exam;
        $resultUserId = $this->resolveResultUserId($examResult);
        abort_unless($exam, 404);

        abort_unless($user?->role === 'siswa', 403);
        if ($resultUserId !== null) {
            abort_unless($resultUserId === (int) $user->id, 403);
        }
        abort_unless($exam->students()->where('users.id', $user->id)->exists(), 403);

        $belongsToPackage = $exam->questionPackage
            ? $exam->questionPackage->questions->contains('id', $question->id)
            : false;

        abort_unless($belongsToPackage, 404);
    }

    public function store(Request $request, ExamResult $examResult, Question $question)
    {
        $this->ensureCanChat($examResult, $question);

        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $apiKey = config('services.gemini.api_key');
        if (! $apiKey) {
            return response()->json([
                'message' => 'GEMINI_API_KEY belum diisi.',
            ], 422);
        }

        $models = $this->candidateModels();

        $user = auth()->user();
        $exam = $examResult->exam;
        $resultUserId = $this->resolveResultUserId($examResult) ?? $user->id;

        $answer = ExamAnswer::query()
            ->where('exam_id', $exam->id)
            ->when(Schema::hasColumn('exam_answers', 'user_id'), fn ($query) => $query->where('user_id', $resultUserId))
            ->where('question_id', $question->id)
            ->first();

        $questionText = trim((string) Str::of(strip_tags((string) $question->question_text))->replace("\xc2\xa0", ' '));
        $explanation = trim((string) $question->explanation);

        $optionsText = '';
        if (in_array($question->question_type, [QuestionTypeHelper::TYPE_SINGLE, QuestionTypeHelper::TYPE_MULTI], true)) {
            $optionsText = implode("\n", array_filter([
                $question->option_a ? 'A. ' . $question->option_a : null,
                $question->option_b ? 'B. ' . $question->option_b : null,
                $question->option_c ? 'C. ' . $question->option_c : null,
                $question->option_d ? 'D. ' . $question->option_d : null,
                $question->option_e ? 'E. ' . $question->option_e : null,
            ]));
        } elseif ($question->question_type === QuestionTypeHelper::TYPE_MATRIX) {
            $optionsText = collect(QuestionTypeHelper::normalizeMatrixRows($question->matrix_rows ?? []))
                ->map(function (array $row, int $index) {
                    return ($index + 1) . '. ' . $row['statement'];
                })
                ->implode("\n");
        }

        $correctAnswer = QuestionTypeHelper::formatCorrectAnswer($question);
        $studentAnswer = QuestionTypeHelper::formatStudentAnswer($question, $answer);

        AiQuestionMessage::create([
            'user_id' => $user->id,
            'exam_id' => $exam->id,
            'question_id' => $question->id,
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        $messages = AiQuestionMessage::query()
            ->where('user_id', $user->id)
            ->where('exam_id', $exam->id)
            ->where('question_id', $question->id)
            ->orderBy('id')
            ->limit(20)
            ->get();

        $hasPreviousAssistantReply = $messages->contains(fn (AiQuestionMessage $message) => $message->role === 'assistant');

        $historyText = $messages->map(function (AiQuestionMessage $message) {
            $prefix = $message->role === 'assistant' ? 'AI' : 'User';
            return $prefix . ': ' . $message->content;
        })->implode("\n");

        $responseInstruction = $hasPreviousAssistantReply
            ? 'Ini adalah pertanyaan lanjutan dari siswa. Jawab fokus pada pertanyaan terbaru, tetap gunakan konteks soal, dan hindari mengulang seluruh pembahasan jika tidak perlu.'
            : 'Ini adalah permintaan pembahasan awal. Wajib bahas soal ini secara lengkap berdasarkan soal, pilihan jawaban, jawaban siswa, dan jawaban yang benar. Jelaskan konsep inti, alasan jawaban benar, alasan jawaban siswa salah jika memang salah, langkah berpikir, serta tips singkat. Jangan jawab terlalu singkat.';

        $formatInstruction = $hasPreviousAssistantReply
            ? "Jawab dalam Bahasa Indonesia yang natural dan mudah dipahami.\nBila cocok, gunakan poin-poin singkat."
            : "Jawab dalam Bahasa Indonesia yang natural, jelas, dan tidak terlalu pendek.\nGunakan format ini:\n1. Inti Soal\n2. Pembahasan Langkah demi Langkah\n3. Kenapa Jawaban Saya Salah/Benar\n4. Tips Cepat";

        $prompt = trim(implode("\n\n", array_filter([
            'Kamu adalah tutor TKA yang sabar dan menjelaskan secara konkret, bukan generik.',
            $responseInstruction,
            "Soal:\n{$questionText}",
            $optionsText ? "Pilihan jawaban:\n{$optionsText}" : null,
            $correctAnswer !== '' ? "Jawaban benar:\n{$correctAnswer}" : null,
            $studentAnswer !== '' ? "Jawaban siswa:\n{$studentAnswer}" : 'Jawaban siswa: belum ada jawaban.',
            $explanation !== '' ? "Pembahasan guru:\n{$explanation}" : null,
            "Riwayat chat:\n{$historyText}",
            $formatInstruction,
        ])));

        $response = null;
        $usedModel = null;
        $lastStatus = null;
        $lastApiError = '';
        $lastResponseJson = null;

        foreach ($models as $model) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

            $response = Http::acceptJson()
                ->withHeaders([
                    'X-goog-api-key' => $apiKey,
                ])
                ->timeout(45)
                ->post($url, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'maxOutputTokens' => 3000,
                ],
            ]);

            $usedModel = $model;
            $lastStatus = $response->status();
            $lastResponseJson = $response->json();
            $lastApiError = trim((string) data_get($lastResponseJson, 'error.message', ''));

            if ($response->successful()) {
                break;
            }

            // Kalau model tidak ditemukan, coba model fallback berikutnya.
            if ($lastStatus === 404) {
                continue;
            }

            // Error non-404 biasanya bukan masalah nama model, jadi hentikan di sini.
            break;
        }

        if (! $response || ! $response->successful()) {
            $status = $lastStatus ?? 502;
            $apiError = $lastApiError;

            Log::warning('Gemini API request failed.', [
                'status' => $status,
                'model' => $usedModel,
                'attempted_models' => $models,
                'response' => $lastResponseJson,
            ]);

            $message = match ($status) {
                400 => $apiError !== '' ? "Request Gemini tidak valid: {$apiError}" : 'Request ke Gemini tidak valid.',
                401, 403 => $apiError !== '' ? "Gemini menolak API key: {$apiError}" : 'Gemini menolak API key. Pastikan API key valid untuk Google AI Studio / Gemini API.',
                404 => $apiError !== '' ? "Model Gemini tidak ditemukan: {$apiError}" : 'Tidak ada model Gemini fallback yang tersedia untuk endpoint ini.',
                429 => $apiError !== '' ? "Limit Gemini tercapai: {$apiError}" : 'Limit Gemini sedang tercapai. Coba lagi beberapa saat.',
                default => $apiError !== '' ? "Gemini error: {$apiError}" : 'Gemini sedang gagal memproses permintaan.',
            };

            return response()->json([
                'message' => $message,
            ], in_array($status, [400, 401, 403, 404, 429], true) ? $status : 502);
        }

        $text = (string) data_get($response->json(), 'candidates.0.content.parts.0.text', '');
        $text = trim($text);
        if ($text === '') {
            Log::warning('Gemini API returned empty content.', [
                'model' => $usedModel,
                'response' => $response->json(),
            ]);

            return response()->json([
                'message' => 'Gemini tidak mengembalikan isi jawaban.',
            ], 502);
        }

        $assistantMessage = AiQuestionMessage::create([
            'user_id' => $user->id,
            'exam_id' => $exam->id,
            'question_id' => $question->id,
            'role' => 'assistant',
            'content' => $text,
        ]);

        return response()->json([
            'message' => [
                'id' => $assistantMessage->id,
                'role' => $assistantMessage->role,
                'content' => $assistantMessage->content,
                'created_at' => $assistantMessage->created_at,
            ],
        ]);
    }
}
