<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Support\QuestionTypeHelper;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class QuizAttemptController extends Controller
{
    private function ensureStudent(): void
    {
        abort_unless(auth()->user()?->role === 'siswa', 403);
    }

    private function ensureAttemptAccess(QuizAttempt $quizAttempt): void
    {
        $this->ensureStudent();
        abort_unless((int) $quizAttempt->user_id === (int) auth()->id(), 403);
    }

    public function show(QuizAttempt $quizAttempt)
    {
        $this->ensureAttemptAccess($quizAttempt);

        if ($quizAttempt->status === 'completed') {
            return redirect()->route('quiz-results.show', $quizAttempt);
        }

        $quizAttempt->load(['course', 'questionPackage.questions' => fn ($query) => $query->with('subject')]);

        $questions = $quizAttempt->questionPackage?->questions ?? collect();
        $answers = $quizAttempt->answers()->get()->keyBy('question_id');

        $questionPayload = $questions->map(function (Question $question) {
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
                'matrix_left_label' => $question->matrix_left_label,
                'matrix_right_label' => $question->matrix_right_label,
                'matrix_rows' => QuestionTypeHelper::normalizeMatrixRows($question->matrix_rows ?? []),
            ];
        })->values();

        $answerPayload = $answers->mapWithKeys(function (QuizAnswer $answer) {
            return [
                $answer->question_id => [
                    'selected_option' => $answer->selected_option,
                    'selected_options' => $answer->selected_options,
                    'matrix_answers' => $answer->matrix_answers,
                    'answer_text' => $answer->answer_text,
                    'is_marked' => (bool) $answer->is_marked,
                ],
            ];
        });

        return Inertia::render('QuizAttempts/Take', [
            'attempt' => [
                'id' => $quizAttempt->id,
                'name' => $quizAttempt->questionPackage?->name,
                'status' => $quizAttempt->status,
                'started_at' => optional($quizAttempt->started_at)?->toIso8601String(),
                'end_time' => optional($quizAttempt->end_time)?->toIso8601String(),
                'duration' => $quizAttempt->duration,
                'course' => [
                    'id' => $quizAttempt->course?->id,
                    'name' => $quizAttempt->course?->name,
                ],
                'question_package' => [
                    'id' => $quizAttempt->questionPackage?->id,
                    'name' => $quizAttempt->questionPackage?->name,
                ],
            ],
            'questions' => $questionPayload,
            'answers' => $answerPayload,
        ]);
    }

    public function saveAnswer(Request $request, QuizAttempt $quizAttempt)
    {
        $this->ensureAttemptAccess($quizAttempt);
        abort_if($quizAttempt->status === 'completed', 422, 'Quiz ini sudah selesai.');

        $validated = $request->validate([
            'question_id' => 'required|integer|exists:questions,id',
            'selected_option' => 'nullable|in:a,b,c,d,e',
            'selected_options' => 'nullable|array',
            'selected_options.*' => 'nullable|in:a,b,c,d,e',
            'matrix_answers' => 'nullable|array',
            'matrix_answers.*' => 'nullable|in:left,right',
            'answer_text' => 'nullable|string',
            'is_marked' => 'nullable|boolean',
        ]);

        $question = $quizAttempt->questionPackage
            ->questions()
            ->where('questions.id', $validated['question_id'])
            ->first();

        if (! $question) {
            throw ValidationException::withMessages([
                'question_id' => 'Soal tidak ditemukan dalam quiz ini.',
            ]);
        }

        $answerAttributes = QuestionTypeHelper::answerAttributesForQuestion($question, $validated);

        QuizAnswer::updateOrCreate(
            [
                'quiz_attempt_id' => $quizAttempt->id,
                'question_id' => $question->id,
            ],
            $answerAttributes
        );

        return response()->json([
            'saved' => true,
        ]);
    }

    public function finish(QuizAttempt $quizAttempt)
    {
        $this->ensureAttemptAccess($quizAttempt);

        if ($quizAttempt->status === 'completed') {
            return redirect()->route('quiz-results.show', $quizAttempt);
        }

        $quizAttempt->load(['questionPackage.questions']);
        $questions = $quizAttempt->questionPackage?->questions ?? collect();
        $answersByQuestion = $quizAttempt->answers()->get()->keyBy('question_id');

        $totalQuestions = $questions->count();
        $totalCorrect = 0;
        $totalWrong = 0;
        $totalEmpty = 0;

        foreach ($questions as $question) {
            $answer = $answersByQuestion->get($question->id);

            if (! $answer) {
                $totalEmpty++;
                continue;
            }

            if (! QuestionTypeHelper::isAnswerComplete($question, [
                'selected_option' => $answer->selected_option,
                'selected_options' => $answer->selected_options,
                'matrix_answers' => $answer->matrix_answers,
                'answer_text' => $answer->answer_text,
            ])) {
                $totalEmpty++;
            } elseif ($answer->is_correct) {
                $totalCorrect++;
            } else {
                $totalWrong++;
            }
        }

        $score = $totalQuestions > 0 ? (int) round(($totalCorrect / $totalQuestions) * 100) : 0;

        $durationInSeconds = null;
        if ($quizAttempt->started_at) {
            $durationInSeconds = (int) $quizAttempt->started_at->diffInSeconds(now());
        }

        $quizAttempt->update([
            'score' => $score,
            'total_correct' => $totalCorrect,
            'total_wrong' => $totalWrong,
            'total_empty' => $totalEmpty,
            'duration' => $durationInSeconds,
            'status' => 'completed',
            'finished_at' => now(),
        ]);

        return redirect()
            ->route('quiz-results.show', $quizAttempt)
            ->with('success', 'Quiz berhasil diselesaikan.');
    }
}
