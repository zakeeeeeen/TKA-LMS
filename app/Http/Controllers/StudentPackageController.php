<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\QuestionPackage;
use App\Models\QuizAttempt;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentPackageController extends Controller
{
    private function ensureStudent(): void
    {
        abort_unless(auth()->user()?->role === 'siswa', 403);
    }

    public function show(Request $request, QuestionPackage $questionPackage)
    {
        $this->ensureStudent();
        abort_unless((bool) $questionPackage->active, 404);

        $user = auth()->user();
        $approvedCourseIds = DB::table('course_enrollments')
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->pluck('course_id')
            ->all();
        $course = null;
        $existingAttempt = null;
        $latestCompletedAttempt = null;
        $availableCourses = $questionPackage->courses()
            ->where('courses.active', true)
            ->whereIn('courses.id', $approvedCourseIds)
            ->orderBy('courses.name')
            ->get(['courses.id', 'courses.name'])
            ->map(function (Course $courseItem) use ($questionPackage, $user) {
                $ongoingAttempt = QuizAttempt::query()
                    ->where('user_id', $user->id)
                    ->where('course_id', $courseItem->id)
                    ->where('question_package_id', $questionPackage->id)
                    ->where('status', 'ongoing')
                    ->latest('id')
                    ->first(['id', 'status']);

                $latestCompletedAttempt = QuizAttempt::query()
                    ->where('user_id', $user->id)
                    ->where('course_id', $courseItem->id)
                    ->where('question_package_id', $questionPackage->id)
                    ->where('status', 'completed')
                    ->latest('id')
                    ->first(['id']);

                return [
                    'id' => $courseItem->id,
                    'name' => $courseItem->name,
                    'ongoing_attempt_id' => $ongoingAttempt?->id,
                    'latest_completed_attempt_id' => $latestCompletedAttempt?->id,
                ];
            })
            ->values();

        if ($request->filled('course_id')) {
            $course = $questionPackage->courses()
                ->where('courses.id', $request->integer('course_id'))
                ->where('courses.active', true)
                ->first(['courses.id', 'courses.name']);

            abort_unless($course, 404);
            abort_unless(in_array($course->id, $approvedCourseIds, true), 403);

            if ($course) {
                $existingAttempt = QuizAttempt::query()
                    ->where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->where('question_package_id', $questionPackage->id)
                    ->where('status', 'ongoing')
                    ->latest('id')
                    ->first();

                $latestCompletedAttempt = QuizAttempt::query()
                    ->where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->where('question_package_id', $questionPackage->id)
                    ->where('status', 'completed')
                    ->latest('id')
                    ->first(['id']);
            }
        }

        return Inertia::render('StudentPackages/Show', [
            'questionPackage' => $questionPackage->loadCount('questions'),
            'latestCompletedAttemptId' => $latestCompletedAttempt?->id,
            'course' => $course,
            'existingAttempt' => $existingAttempt,
            'availableCourses' => $availableCourses,
        ]);
    }

    public function start(Request $request, QuestionPackage $questionPackage)
    {
        $this->ensureStudent();
        abort_unless((bool) $questionPackage->active, 404);

        $user = auth()->user();
        $approvedCourseIds = DB::table('course_enrollments')
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->pluck('course_id')
            ->all();

        $course = null;
        if ($request->filled('course_id')) {
            $course = $questionPackage->courses()
                ->where('courses.id', $request->integer('course_id'))
                ->where('courses.active', true)
                ->first(['courses.id', 'courses.name']);

            abort_unless($course, 404);
            abort_unless(in_array($course->id, $approvedCourseIds, true), 403);
        } else {
            $activeCourses = $questionPackage->courses()
                ->where('courses.active', true)
                ->whereIn('courses.id', $approvedCourseIds)
                ->orderBy('courses.name')
                ->get(['courses.id', 'courses.name']);

            if ($activeCourses->count() === 1) {
                $course = $activeCourses->first();
            } else {
                return redirect()
                    ->route('student.packages.show', $questionPackage)
                    ->with('error', $activeCourses->isEmpty()
                        ? 'Quiz ini belum tersedia di kursus yang kamu ikuti.'
                        : 'Pilih course terlebih dahulu sebelum memulai quiz.');
            }
        }

        if ($questionPackage->questions()->count() === 0) {
            $parameters = ['questionPackage' => $questionPackage->id];
            if ($request->filled('course_id')) {
                $parameters['course_id'] = $request->integer('course_id');
            }

            return redirect()
                ->route('student.packages.show', $parameters)
                ->with('error', 'Quiz ini belum memiliki soal.');
        }

        if ($course) {
            $existingAttempt = QuizAttempt::query()
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->where('question_package_id', $questionPackage->id)
                ->where('status', 'ongoing')
                ->latest('id')
                ->first();

            if ($existingAttempt) {
                return redirect()
                    ->route('quiz-attempts.show', $existingAttempt)
                    ->with('success', 'Quiz sudah tersedia. Silakan lanjutkan pengerjaan.');
            }

            $startTime = now();

            $attempt = QuizAttempt::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'question_package_id' => $questionPackage->id,
                'duration' => (int) $questionPackage->duration,
                'status' => 'ongoing',
                'started_at' => $startTime,
                'end_time' => Carbon::parse($startTime)->addMinutes((int) $questionPackage->duration),
            ]);

            return redirect()
                ->route('quiz-attempts.show', $attempt)
                ->with('success', 'Quiz berhasil dimulai.');
        }
    }
}
