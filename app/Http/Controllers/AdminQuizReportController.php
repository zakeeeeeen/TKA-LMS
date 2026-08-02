<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\QuestionPackage;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Support\QuestionTypeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminQuizReportController extends Controller
{
    private function ensureCanManage(): void
    {
        $role = auth()->user()?->role;
        abort_unless(in_array($role, ['admin', 'guru']), 403);
    }

    public function index(Request $request)
    {
        $this->ensureCanManage();

        $mode = $request->query('mode', 'course'); // 'course', 'latest', or 'live'
        $selectedCourseId = $request->query('course_id');
        $selectedQuizId = $request->query('quiz_id');

        // Mode 3: Live Monitoring (Active in-progress attempts)
        if ($mode === 'live') {
            $filterQuizId = $request->query('filter_quiz_id');
            $filterCourseId = $request->query('filter_course_id');

            $attemptsQuery = QuizAttempt::with(['user', 'course', 'questionPackage.questions', 'answers.question'])
                ->where('status', 'in_progress');

            if ($filterQuizId) {
                $attemptsQuery->where('question_package_id', $filterQuizId);
            }
            if ($filterCourseId) {
                $attemptsQuery->where('course_id', $filterCourseId);
            }

            $liveAttempts = $attemptsQuery
                ->orderBy('created_at', 'desc')
                ->get();

            $liveData = $liveAttempts->map(function ($attempt) {
                $answers = $attempt->answers->keyBy('question_id');
                $questions = $attempt->questionPackage?->questions ?? collect();
                $totalQuestions = $questions->count();

                $answeredCount = 0;
                $correctCount = 0;
                $wrongCount = 0;

                foreach ($questions as $q) {
                    $ans = $answers->get($q->id);
                    if ($ans) {
                        if (QuestionTypeHelper::isAnswerComplete($q, [
                            'selected_option' => $ans->selected_option,
                            'selected_options' => $ans->selected_options,
                            'matrix_answers' => $ans->matrix_answers,
                            'answer_text' => $ans->answer_text,
                        ])) {
                            $answeredCount++;
                            if ($ans->is_correct) {
                                $correctCount++;
                            } else {
                                $wrongCount++;
                            }
                        }
                    }
                }

                $currentScore = $totalQuestions > 0 ? (int) round(($correctCount / $totalQuestions) * 100) : 0;
                $remainingSeconds = $attempt->end_time ? max(0, (int) now()->diffInSeconds($attempt->end_time, false)) : 0;
                $lastActivity = $attempt->answers->max('updated_at') ?? $attempt->updated_at;

                return [
                    'id' => $attempt->id,
                    'user_id' => $attempt->user_id,
                    'user_name' => $attempt->user?->name ?? 'Siswa',
                    'user_email' => $attempt->user?->email ?? '-',
                    'user_avatar' => $attempt->user?->avatar_url,
                    'course_name' => $attempt->course?->name ?? 'Kuis Mandiri',
                    'quiz_name' => $attempt->questionPackage?->name ?? 'Kuis',
                    'total_questions' => $totalQuestions,
                    'answered_count' => $answeredCount,
                    'correct_count' => $correctCount,
                    'wrong_count' => $wrongCount,
                    'current_score' => $currentScore,
                    'remaining_seconds' => $remainingSeconds,
                    'end_time_iso' => $attempt->end_time ? $attempt->end_time->toIso8601String() : null,
                    'started_at_formatted' => $attempt->started_at ? $attempt->started_at->format('H:i:s') : '-',
                    'last_activity_formatted' => $lastActivity ? $lastActivity->diffForHumans() : '-',
                ];
            });

            $allQuizzes = QuestionPackage::orderBy('name')->get(['id', 'name']);
            $allCourses = Course::orderBy('name')->get(['id', 'name']);

            return Inertia::render('Admin/QuizReports/Index', [
                'mode' => 'live',
                'liveAttempts' => $liveData,
                'courses' => $allCourses,
                'selectedCourseId' => $filterCourseId ? (int) $filterCourseId : null,
                'quizzes' => $allQuizzes,
                'selectedQuizId' => $filterQuizId ? (int) $filterQuizId : null,
                'recentAttempts' => ['data' => [], 'links' => [], 'total' => 0],
                'selectedCourse' => null,
                'selectedQuiz' => null,
                'participants' => [],
            ]);
        }

        // Mode 2: Terbaru (All recent attempts sorted by finished_at DESC)
        $recentAttempts = [];
        if ($mode === 'latest') {
            $filterQuizId = $request->query('filter_quiz_id');
            $filterCourseId = $request->query('filter_course_id');

            $attemptsQuery = QuizAttempt::with(['user', 'course', 'questionPackage'])
                ->where('status', 'completed');

            if ($filterQuizId) {
                $attemptsQuery->where('question_package_id', $filterQuizId);
            }
            if ($filterCourseId) {
                $attemptsQuery->where('course_id', $filterCourseId);
            }

            $rawAttempts = $attemptsQuery
                ->orderBy('finished_at', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(50)
                ->withQueryString();

            $formatDuration = function ($seconds) {
                if (!$seconds) return '-';
                if ($seconds < 60) return $seconds . ' Detik';
                $minutes = floor($seconds / 60);
                $secs = $seconds % 60;
                return $secs > 0 ? "{$minutes}m {$secs}s" : "{$minutes} Menit";
            };

            $recentAttemptsData = collect($rawAttempts->items())->map(function ($attempt) use ($formatDuration) {
                return [
                    'id' => $attempt->id,
                    'user_id' => $attempt->user_id,
                    'user_name' => $attempt->user?->name ?? 'Siswa',
                    'user_email' => $attempt->user?->email ?? '-',
                    'user_avatar' => $attempt->user?->avatar_url,
                    'course_id' => $attempt->course_id,
                    'course_name' => $attempt->course?->name ?? 'Kuis Mandiri',
                    'quiz_id' => $attempt->question_package_id,
                    'quiz_name' => $attempt->questionPackage?->name ?? 'Kuis',
                    'score' => $attempt->score,
                    'total_correct' => $attempt->total_correct,
                    'total_wrong' => $attempt->total_wrong,
                    'total_empty' => $attempt->total_empty,
                    'duration_spent' => $formatDuration($attempt->duration),
                    'finished_at' => $attempt->finished_at ? $attempt->finished_at->format('d M Y, H:i') : ($attempt->created_at ? $attempt->created_at->format('d M Y, H:i') : '-'),
                    'passed' => ($attempt->score ?? 0) >= 70,
                ];
            });

            $allQuizzes = QuestionPackage::orderBy('name')->get(['id', 'name']);
            $allCourses = Course::orderBy('name')->get(['id', 'name']);

            return Inertia::render('Admin/QuizReports/Index', [
                'mode' => 'latest',
                'recentAttempts' => [
                    'data' => $recentAttemptsData,
                    'links' => $rawAttempts->linkCollection()->toArray(),
                    'total' => $rawAttempts->total(),
                ],
                'courses' => $allCourses,
                'selectedCourseId' => $filterCourseId ? (int) $filterCourseId : null,
                'selectedCourse' => null,
                'quizzes' => $allQuizzes,
                'selectedQuizId' => $filterQuizId ? (int) $filterQuizId : null,
                'selectedQuiz' => null,
                'participants' => [],
            ]);
        }

        // Mode 1: Kursus (Existing 3-step hierarchy)
        // Step 1 Data: Courses List with Quiz Count & Approved Enrolled Students Count
        $courses = Course::query()
            ->withCount([
                'quizzes as quizzes_count' => fn ($query) => $query->where('active', true),
                'students as enrolled_students_count' => fn ($query) => $query->where('course_enrollments.status', 'approved'),
            ])
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'thumbnail', 'active']);

        $selectedCourse = null;
        $quizzes = [];
        $selectedQuiz = null;
        $participants = [];

        // Step 2 Data: Quizzes in Selected Course
        if ($selectedCourseId) {
            $selectedCourse = Course::find($selectedCourseId);

            if ($selectedCourse) {
                // Get all quizzes attached to this course
                $courseQuizzes = $selectedCourse->quizzes()->where('active', true)->get();

                // Get count of unique students who attempted each quiz in this course
                $quizzes = $courseQuizzes->map(function ($quiz) use ($selectedCourseId) {
                    $attemptedCount = QuizAttempt::where('course_id', $selectedCourseId)
                        ->where('question_package_id', $quiz->id)
                        ->where('status', 'completed')
                        ->distinct('user_id')
                        ->count('user_id');

                    return [
                        'id' => $quiz->id,
                        'name' => $quiz->name,
                        'description' => $quiz->description,
                        'duration' => $quiz->duration,
                        'total_questions' => $quiz->questions()->count(),
                        'passing_score' => 70, // Default KKTP/KKM
                        'attempted_students_count' => $attemptedCount,
                    ];
                });
            }
        }

        // Step 3 & 4 Data: Participants & Details for Selected Quiz in Selected Course
        if ($selectedCourseId && $selectedQuizId && $selectedCourse) {
            $selectedQuiz = QuestionPackage::with(['questions'])->find($selectedQuizId);

            if ($selectedQuiz) {
                // Get all approved enrolled students for this course
                $enrolledStudents = $selectedCourse->students()
                    ->where('course_enrollments.status', 'approved')
                    ->get(['users.id', 'users.name', 'users.email', 'users.avatar']);

                // Get all attempts for this course and quiz
                $attempts = QuizAttempt::where('course_id', $selectedCourseId)
                    ->where('question_package_id', $selectedQuizId)
                    ->with(['user', 'answers.question'])
                    ->orderBy('created_at', 'desc')
                    ->get();

                // Merge users who have attempts but were not in enrolledStudents
                $attemptUsers = $attempts->pluck('user')->filter()->unique('id');
                $allStudents = $enrolledStudents->keyBy('id')->merge($attemptUsers->keyBy('id'))->values();

                $attemptsGroupedByUser = $attempts->groupBy('user_id');

                $participants = $allStudents->map(function ($student) use ($attemptsGroupedByUser, $selectedQuiz) {
                    $userAttempts = $attemptsGroupedByUser->get($student->id, collect());
                    $latestCompletedAttempt = $userAttempts->firstWhere('status', 'completed') ?? $userAttempts->first();
                    $hasAttempted = $userAttempts->isNotEmpty() && $userAttempts->contains('status', 'completed');

                    $attemptData = null;
                    if ($latestCompletedAttempt) {
                        $answers = $latestCompletedAttempt->answers->keyBy('question_id');
                        
                        $questionDetails = $selectedQuiz->questions->map(function ($question, $index) use ($answers) {
                            $ans = $answers->get($question->id);
                            
                            return [
                                'number' => $index + 1,
                                'id' => $question->id,
                                'question_text' => $question->question_text,
                                'image_url' => $question->image_url,
                                'question_type' => $question->question_type,
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
                                'user_answer' => $ans?->selected_option ?? $ans?->answer_text ?? ($ans?->selected_options ? implode(', ', $ans->selected_options) : null),
                                'selected_option' => $ans?->selected_option,
                                'selected_options' => $ans?->selected_options,
                                'matrix_answers' => $ans?->matrix_answers,
                                'answer_text' => $ans?->answer_text,
                                'is_correct' => (bool) ($ans?->is_correct ?? false),
                                'explanation' => $question->explanation,
                            ];
                        });

                        $attemptData = [
                            'id' => $latestCompletedAttempt->id,
                            'score' => $latestCompletedAttempt->score,
                            'total_correct' => $latestCompletedAttempt->total_correct,
                            'total_wrong' => $latestCompletedAttempt->total_wrong,
                            'total_empty' => $latestCompletedAttempt->total_empty,
                            'duration_spent' => $latestCompletedAttempt->duration,
                            'finished_at' => $latestCompletedAttempt->finished_at ? $latestCompletedAttempt->finished_at->format('d M Y, H:i') : '-',
                            'attempt_number' => $userAttempts->count(),
                            'passed' => ($latestCompletedAttempt->score ?? 0) >= 70,
                            'questions_detail' => $questionDetails,
                        ];
                    }

                    return [
                        'user_id' => $student->id,
                        'name' => $student->name,
                        'email' => $student->email,
                        'avatar_url' => $student->avatar_url,
                        'has_attempted' => $hasAttempted,
                        'attempt' => $attemptData,
                    ];
                });
            }
        }

        return Inertia::render('Admin/QuizReports/Index', [
            'mode' => 'course',
            'courses' => $courses,
            'selectedCourseId' => $selectedCourseId ? (int) $selectedCourseId : null,
            'selectedCourse' => $selectedCourse,
            'quizzes' => $quizzes,
            'selectedQuizId' => $selectedQuizId ? (int) $selectedQuizId : null,
            'selectedQuiz' => $selectedQuiz ? [
                'id' => $selectedQuiz->id,
                'name' => $selectedQuiz->name,
                'passing_score' => 70,
            ] : null,
            'participants' => $participants,
        ]);
    }

    public function showReview(QuizAttempt $quizAttempt)
    {
        $this->ensureCanManage();
        abort_unless($quizAttempt->status === 'completed', 404);

        $quizAttempt->load([
            'user',
            'course',
            'questionPackage.questions' => fn ($query) => $query->with('subject'),
            'answers',
        ]);

        $questions = $quizAttempt->questionPackage?->questions ?? collect();
        $answers = $quizAttempt->answers->keyBy('question_id');

        $questionPayload = $questions->map(function ($question) use ($answers) {
            $answer = $answers->get($question->id);

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
                'messages' => [],
            ];
        })->values();

        return Inertia::render('Admin/QuizReports/Review', [
            'result' => [
                'id' => $quizAttempt->id,
                'score' => $quizAttempt->score,
                'total_correct' => $quizAttempt->total_correct,
                'total_wrong' => $quizAttempt->total_wrong,
                'total_empty' => $quizAttempt->total_empty,
                'duration_spent' => $quizAttempt->duration,
                'finished_at' => $quizAttempt->finished_at ? $quizAttempt->finished_at->format('d M Y, H:i') : '-',
                'user' => [
                    'name' => $quizAttempt->user?->name ?? 'Siswa',
                    'email' => $quizAttempt->user?->email ?? '-',
                    'avatar_url' => $quizAttempt->user?->avatar_url,
                ],
                'course' => $quizAttempt->course,
                'questionPackage' => $quizAttempt->questionPackage,
            ],
            'questions' => $questionPayload,
            'canUseGemini' => false,
        ]);
    }
}
