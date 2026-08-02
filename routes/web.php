<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuestionImportController;
use App\Http\Controllers\QuestionPackageController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseMaterialController;
use App\Http\Controllers\CourseMaterialFileController;
use App\Http\Controllers\CourseContentGroupController;
use App\Http\Controllers\CourseQuizController;
use App\Http\Controllers\CourseEnrollmentRequestController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\StudentCourseController;
use App\Http\Controllers\StudentPackageController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\QuizResultController;
use App\Http\Controllers\QuizQuestionChatController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\AiQuestionChatController;
use App\Http\Controllers\ExamResultController;
use App\Http\Controllers\StatisticsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();

        $stats = [
            'totalStudents' => \App\Models\User::where('role', 'siswa')->count(),
            'totalQuestions' => \App\Models\Question::count(),
            'totalQuizzes' => \App\Models\QuestionPackage::count(),
            'totalCourses' => \App\Models\Course::count(),
        ];

        $activeCourses = [];
        $latestAttempts = [];

        if (in_array($user?->role, ['admin', 'guru'], true)) {
            $latestAttempts = \App\Models\QuizAttempt::with(['user', 'course', 'questionPackage'])
                ->where('status', 'completed')
                ->orderBy('finished_at', 'desc')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(fn ($att) => [
                    'id' => $att->id,
                    'user_name' => $att->user?->name ?? 'Siswa',
                    'user_email' => $att->user?->email ?? '-',
                    'user_avatar' => $att->user?->avatar_url,
                    'quiz_name' => $att->questionPackage?->name ?? 'Kuis',
                    'course_name' => $att->course?->name ?? 'Kuis Mandiri',
                    'score' => $att->score,
                    'passed' => ($att->score ?? 0) >= 70,
                    'finished_at' => $att->finished_at ? $att->finished_at->diffForHumans() : ($att->created_at ? $att->created_at->diffForHumans() : 'Baru saja'),
                ]);
        }

        if ($user?->role === 'siswa') {
            $approvedCourseIds = \Illuminate\Support\Facades\DB::table('course_enrollments')
                ->where('user_id', $user->id)
                ->where('status', 'approved')
                ->pluck('course_id')
                ->all();

            $activeCourses = \App\Models\Course::query()
                ->whereIn('id', $approvedCourseIds)
                ->where('active', true)
                ->withCount([
                    'quizzes as quizzes_count' => fn ($query) => $query->where('active', true),
                    'materials as materials_count' => fn ($query) => $query->where('is_published', true),
                ])
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'description',
                    'thumbnail',
                    'active',
                ]);
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'activeCourses' => $activeCourses,
            'latestAttempts' => $latestAttempts,
        ]);
    })->name('dashboard');

    Route::resource('users', UserController::class);
    Route::resource('subjects', SubjectController::class);
    Route::get('/questions/import', [QuestionImportController::class, 'create'])->name('questions.import.create');
    Route::post('/questions/import', [QuestionImportController::class, 'store'])->name('questions.import.store');
    Route::post('/questions/upload-image', [QuestionController::class, 'uploadImage'])->name('questions.upload-image');
    Route::get('/questions/import/template-choice', [QuestionImportController::class, 'templateChoice'])->name('questions.import.template-choice');
    Route::get('/questions/import/template-matrix', [QuestionImportController::class, 'templateMatrix'])->name('questions.import.template-matrix');
    Route::get('/questions/import/template-form-soal', [QuestionImportController::class, 'templateFormSoal'])->name('questions.import.template-form-soal');
    Route::get('/questions/import/template', [QuestionImportController::class, 'templateChoice'])->name('questions.import.template');
    Route::resource('questions', QuestionController::class);
    Route::post('/question-packages/attach-questions', [QuestionPackageController::class, 'attachQuestions'])->name('question-packages.attach-questions');
    Route::delete('/question-packages/{questionPackage}/questions/{question}', [QuestionPackageController::class, 'removeQuestion'])->name('question-packages.questions.destroy');
    Route::post('/question-packages/{questionPackage}/questions/{question}/move', [QuestionPackageController::class, 'moveQuestion'])->name('question-packages.questions.move');
    Route::resource('question-packages', QuestionPackageController::class);
    Route::post('/quizzes/attach-questions', [QuestionPackageController::class, 'attachQuestions'])->name('quizzes.attach-questions');
    Route::delete('/quizzes/{questionPackage}/questions/{question}', [QuestionPackageController::class, 'removeQuestion'])->name('quizzes.questions.destroy');
    Route::post('/quizzes/{questionPackage}/questions/{question}/move', [QuestionPackageController::class, 'moveQuestion'])->name('quizzes.questions.move');
    Route::resource('quizzes', QuestionPackageController::class)->parameters([
        'quizzes' => 'questionPackage',
    ]);
    Route::resource('courses', CourseController::class);
    Route::resource('materials', MaterialController::class)->parameters([
        'materials' => 'material',
    ]);
    Route::post('/materials/bulk-move', [MaterialController::class, 'bulkMove'])->name('materials.bulk-move');
    Route::post('/courses/attach-quizzes', [CourseController::class, 'attachQuizzesToCourses'])->name('courses.attach-quizzes');
    Route::get('/course-enrollment-requests', [CourseEnrollmentRequestController::class, 'index'])->name('course-enrollment-requests.index');
    Route::post('/course-enrollment-requests/{courseEnrollment}/approve', [CourseEnrollmentRequestController::class, 'approve'])->name('course-enrollment-requests.approve');
    Route::post('/course-enrollment-requests/{courseEnrollment}/reject', [CourseEnrollmentRequestController::class, 'reject'])->name('course-enrollment-requests.reject');


    Route::get('/courses/{course}/groups', [CourseContentGroupController::class, 'index'])->name('courses.groups.index');
    Route::post('/courses/{course}/groups', [CourseContentGroupController::class, 'store'])->name('courses.groups.store');
    Route::put('/courses/{course}/groups/{group}', [CourseContentGroupController::class, 'update'])->name('courses.groups.update');
    Route::delete('/courses/{course}/groups/{group}', [CourseContentGroupController::class, 'destroy'])->name('courses.groups.destroy');
    Route::post('/courses/{course}/groups/{group}/move', [CourseContentGroupController::class, 'move'])->name('courses.groups.move');
    Route::post('/courses/{course}/groups/materials/{material}', [CourseContentGroupController::class, 'assignMaterial'])->name('courses.groups.materials.assign');
    Route::post('/courses/{course}/groups/quizzes/{questionPackage}', [CourseContentGroupController::class, 'assignQuiz'])->name('courses.groups.quizzes.assign');
    Route::resource('courses.materials', CourseMaterialController::class)->except(['show'])->scoped();
    Route::get('/courses/{course}/materials/{courseMaterial}', [CourseMaterialController::class, 'show'])->name('courses.materials.show')->scopeBindings();
    Route::post('/courses/{course}/materials/{courseMaterial}/move', [CourseMaterialController::class, 'move'])->name('courses.materials.move');
    Route::get('/courses/{course}/materials/{courseMaterial}/file', [CourseMaterialFileController::class, 'show'])->name('courses.materials.file')->scopeBindings();
    Route::get('/courses/{course}/quizzes', [CourseQuizController::class, 'index'])->name('courses.quizzes.index');
    Route::put('/courses/{course}/quizzes', [CourseQuizController::class, 'update'])->name('courses.quizzes.update');
    Route::post('/courses/{course}/quizzes/{questionPackage}/move', [CourseQuizController::class, 'move'])->name('courses.quizzes.move');
    Route::get('/student/courses', [StudentCourseController::class, 'index'])->name('student.courses.index');
    Route::get('/student/my-courses', [StudentCourseController::class, 'myCourses'])->name('student.my-courses.index');
    Route::get('/student/courses/{course}', [StudentCourseController::class, 'show'])->name('student.courses.show');
    Route::post('/student/courses/{course}/request', [StudentCourseController::class, 'requestCourse'])->name('student.courses.request');
    Route::get('/student/courses/{course}/materials/{courseMaterial}', [StudentCourseController::class, 'showMaterial'])->name('student.courses.materials.show')->scopeBindings();

    Route::get('/student/packages/{questionPackage}', [StudentPackageController::class, 'show'])->name('student.packages.show');
    Route::post('/student/packages/{questionPackage}/request-access', [StudentPackageController::class, 'requestAccess'])->name('student.packages.request-access');
    Route::post('/student/packages/{questionPackage}/start', [StudentPackageController::class, 'start'])->name('student.packages.start');
    Route::get('/quiz-attempts/{quizAttempt}', [QuizAttemptController::class, 'show'])->name('quiz-attempts.show');
    Route::post('/quiz-attempts/{quizAttempt}/answer', [QuizAttemptController::class, 'saveAnswer'])->name('quiz-attempts.answer');
    Route::post('/quiz-attempts/{quizAttempt}/finish', [QuizAttemptController::class, 'finish'])->name('quiz-attempts.finish');
    Route::get('/quiz-results', [QuizResultController::class, 'index'])->name('quiz-results.index');
    Route::get('/quiz-results/{quizAttempt}', [QuizResultController::class, 'show'])->name('quiz-results.show');
    Route::get('/quiz-results/{quizAttempt}/review', [QuizResultController::class, 'review'])->name('quiz-results.review');
    Route::post('/quiz-results/{quizAttempt}/questions/{question}/chat', [QuizQuestionChatController::class, 'store'])->middleware('throttle:20,1')->name('quiz-results.questions.chat');

    Route::post('/exams/{exam}/answer', [ExamController::class, 'saveAnswer'])->name('exams.answer');
    Route::post('/exams/{exam}/finish', [ExamController::class, 'finish'])->name('exams.finish');
    Route::resource('exams', ExamController::class);
    Route::get('/results/{examResult}/review', [ExamResultController::class, 'review'])->name('results.review');
    Route::resource('results', ExamResultController::class)->parameters([
        'results' => 'examResult',
    ]);
    Route::post('/results/{examResult}/questions/{question}/chat', [AiQuestionChatController::class, 'store'])->middleware('throttle:20,1')->name('results.questions.chat');
    Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics.index');
    Route::get('/admin/quiz-reports', [\App\Http\Controllers\AdminQuizReportController::class, 'index'])->name('admin.quiz-reports.index');
    Route::get('/admin/quiz-reports/{quizAttempt}/review', [\App\Http\Controllers\AdminQuizReportController::class, 'showReview'])->name('admin.quiz-reports.review');

    Route::get('/admin/settings', [\App\Http\Controllers\SiteSettingController::class, 'edit'])->name('admin.settings.edit');
    Route::post('/admin/settings', [\App\Http\Controllers\SiteSettingController::class, 'update'])->name('admin.settings.update');

    Route::get('/waho-chat', [\App\Http\Controllers\WahoChatController::class, 'index'])->name('waho-chat.index');
    Route::get('/waho-chat/history', [\App\Http\Controllers\WahoChatController::class, 'history'])->name('waho-chat.history');
    Route::post('/waho-chat', [\App\Http\Controllers\WahoChatController::class, 'store'])->middleware('throttle:30,1')->name('waho-chat.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
