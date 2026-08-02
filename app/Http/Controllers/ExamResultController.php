<?php

namespace App\Http\Controllers;

use App\Models\AiQuestionMessage;
use App\Models\ExamAnswer;
use App\Models\ExamResult;
use App\Models\Question;
use App\Support\QuestionTypeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class ExamResultController extends Controller
{
    private function hasPerUserExamResults(): bool
    {
        return Schema::hasColumn('exam_results', 'user_id');
    }

    private function hasPerUserExamAnswers(): bool
    {
        return Schema::hasColumn('exam_answers', 'user_id');
    }

    private function resolveResultUserId(ExamResult $examResult): ?int
    {
        if ($this->hasPerUserExamResults() && $examResult->user_id) {
            return (int) $examResult->user_id;
        }

        $examResult->loadMissing('exam.students');

        return $examResult->exam?->students?->pluck('id')->first();
    }

    private function ensureCanViewResult(ExamResult $examResult): void
    {
        $user = auth()->user();

        $examResult->loadMissing('exam.students');
        $exam = $examResult->exam;
        $resultUserId = $this->resolveResultUserId($examResult);

        abort_unless($exam, 404);

        if (in_array($user?->role, ['admin', 'guru'], true)) {
            return;
        }

        abort_unless($user?->role === 'siswa', 403);
        if ($resultUserId !== null) {
            abort_unless($resultUserId === (int) $user->id, 403);
        }
        abort_unless($exam->students()->where('users.id', $user->id)->exists(), 403);
    }

    private function buildReviewPayload(ExamResult $examResult): array
    {
        $user = auth()->user();
        $resultUserId = $this->resolveResultUserId($examResult) ?? $user?->id;

        $examResult->load([
            'exam.questionPackage.questions' => fn ($query) => $query->with('subject'),
            'exam.students',
        ]);

        $exam = $examResult->exam;
        $questions = $exam->questionPackage?->questions ?? collect();

        $answersQuery = ExamAnswer::query()
            ->where('exam_id', $exam->id);

        if ($this->hasPerUserExamAnswers() && $resultUserId) {
            $answersQuery->where('user_id', $resultUserId);
        }

        $answers = $answersQuery->get()->keyBy('question_id');

        $messageRows = collect();
        if ($resultUserId && Schema::hasTable('ai_question_messages')) {
            $messageRows = AiQuestionMessage::query()
                ->where('user_id', $resultUserId)
                ->where('exam_id', $exam->id)
                ->whereIn('question_id', $questions->pluck('id'))
                ->orderBy('id')
                ->get()
                ->groupBy('question_id');
        }

        $questionPayload = $questions->map(function (Question $question) use ($answers, $messageRows) {
            $answer = $answers->get($question->id);
            $messages = ($messageRows->get($question->id) ?? collect())->map(function (AiQuestionMessage $message) {
                return [
                    'id' => $message->id,
                    'role' => $message->role,
                    'content' => $message->content,
                    'created_at' => $message->created_at?->toIso8601String(),
                ];
            })->values();

            return [
                'id' => $question->id,
                'subject' => $question->subject?->name,
                'question_type' => $question->question_type,
                'question_text' => $question->question_text,
                'image_url' => $question->image_url,
                'option_a' => $question->option_a,
                'option_a_image_url' => $question->option_a_image_url,
                'option_b' => $question->option_b,
                'option_b_image_url' => $question->option_b_image_url,
                'option_c' => $question->option_c,
                'option_c_image_url' => $question->option_c_image_url,
                'option_d' => $question->option_d,
                'option_d_image_url' => $question->option_d_image_url,
                'option_e' => $question->option_e,
                'option_e_image_url' => $question->option_e_image_url,
                'correct_option' => $question->correct_option,
                'correct_options' => QuestionTypeHelper::normalizeCorrectOptions($question->correct_options ?? []),
                'correct_answer_text' => $question->answer_text,
                'matrix_left_label' => $question->matrix_left_label,
                'matrix_right_label' => $question->matrix_right_label,
                'matrix_rows' => QuestionTypeHelper::normalizeMatrixRows($question->matrix_rows ?? []),
                'explanation' => $question->explanation,
                'answer' => [
                    'selected_option' => $answer?->selected_option,
                    'selected_options' => $answer?->selected_options,
                    'matrix_answers' => $answer?->matrix_answers,
                    'answer_text' => $answer?->answer_text,
                    'is_correct' => $answer?->is_correct,
                    'is_marked' => (bool) ($answer?->is_marked ?? false),
                ],
                'messages' => $messages,
            ];
        })->values();

        return [
            'result' => $examResult,
            'questions' => $questionPayload,
            'canUseGemini' => (bool) config('services.gemini.api_key'),
            'authUserId' => $user?->id,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        $results = ExamResult::with(['exam.questionPackage', 'exam.students'])
            ->when(
                $user?->role === 'siswa' && $this->hasPerUserExamResults(),
                fn ($query) => $query->where('user_id', $user->id)
            )
            ->latest()
            ->get();

        return Inertia::render('Results/Index', [
            'results' => $results,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function show(ExamResult $examResult)
    {
        $this->ensureCanViewResult($examResult);

        return Inertia::render('Results/Show', [
            'result' => $examResult->load('exam.questionPackage'),
        ]);
    }

    public function review(ExamResult $examResult)
    {
        $this->ensureCanViewResult($examResult);

        return Inertia::render('Results/Review', $this->buildReviewPayload($examResult));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ExamResult $examResult)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExamResult $examResult)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExamResult $examResult)
    {
        //
    }
}
