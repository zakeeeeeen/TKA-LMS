<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseMaterial;
use App\Models\CourseEnrollment;
use App\Models\QuizAttempt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StudentCourseController extends Controller
{
    private function ensureStudent(): void
    {
        abort_unless(auth()->user()?->role === 'siswa', 403);
    }

    public function index()
    {
        $this->ensureStudent();

        $userId = auth()->id();
        $enrollmentStatuses = DB::table('course_enrollments')
            ->where('user_id', $userId)
            ->pluck('status', 'course_id');

        $courses = Course::query()
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
                'access_type',
            ]);

        $courses = $courses->map(function (Course $course) use ($enrollmentStatuses) {
            $status = $enrollmentStatuses[$course->id] ?? null;
            $course->enrollment_status = $status;
            return $course;
        })->values();

        return Inertia::render('StudentCourses/Index', [
            'courses' => $courses,
        ]);
    }

    public function myCourses()
    {
        $this->ensureStudent();

        $userId = auth()->id();
        $courseIds = DB::table('course_enrollments')
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->pluck('course_id')
            ->all();

        $courses = Course::query()
            ->whereIn('id', $courseIds)
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

        return Inertia::render('StudentMyCourses/Index', [
            'courses' => $courses,
        ]);
    }

    public function requestCourse(Course $course)
    {
        $this->ensureStudent();
        abort_unless((bool) $course->active, 404);

        $userId = auth()->id();

        $enrollment = CourseEnrollment::query()
            ->where('course_id', $course->id)
            ->where('user_id', $userId)
            ->first();

        if ($enrollment?->status === 'approved') {
            return redirect()
                ->route('student.my-courses.index')
                ->with('success', 'Kursus sudah aktif di Kursus Saya.');
        }

        if ($enrollment?->status === 'pending') {
            return redirect()
                ->route('student.courses.index')
                ->with('success', 'Permintaan sudah dikirim. Menunggu persetujuan.');
        }

        $isDirect = ($course->access_type ?? 'approval') === 'direct';
        $status = $isDirect ? 'approved' : 'pending';

        CourseEnrollment::updateOrCreate(
            ['course_id' => $course->id, 'user_id' => $userId],
            [
                'status' => $status,
                'requested_at' => now(),
                'approved_at' => $isDirect ? now() : null,
                'approved_by' => $isDirect ? auth()->id() : null,
            ],
        );

        if ($isDirect) {
            return redirect()
                ->route('student.courses.show', $course->id)
                ->with('success', 'Berhasil bergabung dengan kursus.');
        }

        return redirect()
            ->route('student.courses.index')
            ->with('success', 'Permintaan kursus berhasil dikirim. Menunggu persetujuan.');
    }

    public function show(Course $course)
    {
        $this->ensureStudent();
        abort_unless((bool) $course->active, 404);
        $status = $this->getEnrollmentStatus($course);
        if ($status !== 'approved') {
            return redirect()
                ->route('student.courses.index')
                ->with('error', $status === 'pending'
                    ? 'Kamu sudah mengajukan kursus ini. Silakan tunggu persetujuan.'
                    : 'Silakan daftar kursus terlebih dahulu.');
        }

        $course->load([
            'contentGroups' => fn ($query) => $query->orderBy('position'),
            'materials' => fn ($query) => $query
                ->where('is_published', true)
                ->orderBy('position'),
            'quizzes' => fn ($query) => $query
                ->where('active', true)
                ->withCount('questions'),
        ]);

        $defaultGroupId = $course->contentGroups->first()?->id;
        $userId = auth()->id();

        $userAttempts = QuizAttempt::query()
            ->where('user_id', $userId)
            ->where(function ($query) use ($course) {
                $query->where('course_id', $course->id)
                    ->orWhereNull('course_id');
            })
            ->orderByDesc('id')
            ->get()
            ->groupBy('question_package_id');

        $materials = $course->materials->map(function ($material) use ($defaultGroupId) {
            return [
                'id' => $material->id,
                'title' => $material->title,
                'content' => $material->content,
                'file_path' => $material->file_path,
                'file_type' => $material->file_type,
                'summary' => Str::limit(trim(strip_tags((string) $material->content)), 180),
                'position' => $material->position,
                'group_id' => $material->group_id ?? $defaultGroupId,
            ];
        })->values();

        $quizzes = $course->quizzes->map(function ($quiz) use ($defaultGroupId, $userAttempts) {
            $attempts = $userAttempts->get($quiz->id);
            $ongoingAttempt = $attempts?->firstWhere('status', 'ongoing');
            $completedAttempt = $attempts?->firstWhere('status', 'completed');

            return [
                'id' => $quiz->id,
                'name' => $quiz->name,
                'description' => $quiz->description,
                'duration' => $quiz->duration,
                'total_questions' => $quiz->total_questions ?? $quiz->questions_count ?? 0,
                'questions_count' => $quiz->questions_count ?? $quiz->total_questions ?? 0,
                'position' => $quiz->pivot?->position,
                'group_id' => $quiz->pivot?->group_id ?? $defaultGroupId,
                'ongoing_attempt_id' => $ongoingAttempt?->id,
                'completed_attempt_id' => $completedAttempt?->id,
                'score' => $completedAttempt ? (float) $completedAttempt->score : null,
                'has_completed' => (bool) $completedAttempt,
            ];
        })->values();

        $groups = $course->contentGroups->map(function ($group) use ($materials, $quizzes) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'position' => $group->position,
                'materials' => $materials
                    ->filter(fn ($material) => (int) ($material['group_id'] ?? 0) === (int) $group->id)
                    ->sortBy('position')
                    ->values(),
                'quizzes' => $quizzes
                    ->filter(fn ($quiz) => (int) ($quiz['group_id'] ?? 0) === (int) $group->id)
                    ->sortBy('position')
                    ->values(),
            ];
        })->values();

        return Inertia::render('StudentCourses/Show', [
            'course' => [
                'id' => $course->id,
                'name' => $course->name,
                'description' => $course->description,
                'thumbnail' => $course->thumbnail,
                'thumbnail_url' => $course->thumbnail_url,
                'groups' => $groups,
            ],
        ]);
    }

    public function showMaterial(Course $course, CourseMaterial $courseMaterial)
    {
        $this->ensureStudent();

        abort_unless((bool) $course->active, 404);
        $status = $this->getEnrollmentStatus($course);
        if ($status !== 'approved') {
            return redirect()
                ->route('student.courses.index')
                ->with('error', $status === 'pending'
                    ? 'Kamu sudah mengajukan kursus ini. Silakan tunggu persetujuan.'
                    : 'Silakan daftar kursus terlebih dahulu.');
        }
        abort_unless($courseMaterial->course_id === $course->id, 404);
        abort_unless((bool) $courseMaterial->is_published, 404);

        return Inertia::render('StudentCourses/MaterialShow', [
            'course' => $course,
            'material' => $courseMaterial,
        ]);
    }

    private function getEnrollmentStatus(Course $course): ?string
    {
        $userId = auth()->id();
        return DB::table('course_enrollments')
            ->where('course_id', $course->id)
            ->where('user_id', $userId)
            ->value('status');
    }
}
