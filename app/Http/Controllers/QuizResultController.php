<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuizAiQuestionMessage;
use App\Models\QuizAttempt;
use App\Support\QuestionTypeHelper;
use Inertia\Inertia;

class QuizResultController extends Controller
{
    private function ensureStudent(): void
    {
        abort_unless(auth()->user()?->role === 'siswa', 403);
    }

    private function ensureCanView(QuizAttempt $quizAttempt): void
    {
        $this->ensureStudent();
        abort_unless((int) $quizAttempt->user_id === (int) auth()->id(), 403);
        abort_unless($quizAttempt->status === 'completed', 404);
    }

    private function buildReviewPayload(QuizAttempt $quizAttempt): array
    {
        $quizAttempt->load([
            'course',
            'questionPackage.questions' => fn ($query) => $query->with('subject'),
            'answers',
        ]);

        $questions = $quizAttempt->questionPackage?->questions ?? collect();
        $answers = $quizAttempt->answers->keyBy('question_id');
        $messageRows = QuizAiQuestionMessage::query()
            ->where('user_id', auth()->id())
            ->where('quiz_attempt_id', $quizAttempt->id)
            ->whereIn('question_id', $questions->pluck('id'))
            ->orderBy('id')
            ->get()
            ->groupBy('question_id');

        $questionPayload = $questions->map(function (Question $question) use ($answers, $messageRows) {
            $answer = $answers->get($question->id);
            $messages = ($messageRows->get($question->id) ?? collect())->map(function (QuizAiQuestionMessage $message) {
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
            'result' => $quizAttempt->load(['course', 'questionPackage']),
            'questions' => $questionPayload,
            'canUseGemini' => (bool) config('services.gemini.api_key'),
        ];
    }

    public function index()
    {
        $this->ensureStudent();

        $results = QuizAttempt::query()
            ->where('user_id', auth()->id())
            ->where('status', 'completed')
            ->with(['course', 'questionPackage'])
            ->latest('finished_at')
            ->latest('id')
            ->get();

        return Inertia::render('QuizResults/Index', [
            'results' => $results,
        ]);
    }

    public function show(QuizAttempt $quizAttempt)
    {
        $this->ensureCanView($quizAttempt);

        return Inertia::render('QuizResults/Show', [
            'result' => $quizAttempt->load(['course', 'questionPackage']),
        ]);
    }

    public function review(QuizAttempt $quizAttempt)
    {
        $this->ensureCanView($quizAttempt);

        return Inertia::render('QuizResults/Review', $this->buildReviewPayload($quizAttempt));
    }
}
