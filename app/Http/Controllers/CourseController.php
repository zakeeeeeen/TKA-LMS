<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseContentGroup;
use App\Models\QuestionPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseController extends Controller
{
    private function ensureCanManage(): void
    {
        abort_unless(in_array(auth()->user()?->role, ['admin', 'guru'], true), 403);
    }

    public function index()
    {
        $this->ensureCanManage();

        $courses = Course::query()
            ->withCount(['quizzes', 'materials'])
            ->latest()
            ->get();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create()
    {
        $this->ensureCanManage();

        return Inertia::render('Courses/Create', [
            'quizzes' => QuestionPackage::query()
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'duration', 'active', 'total_questions']),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
            'access_type' => 'nullable|in:direct,approval',
            'quiz_ids' => 'nullable|array',
            'quiz_ids.*' => 'exists:question_packages,id',
            'thumbnail' => 'nullable|image|max:2048',
        ]);

        $thumbnailPath = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('courses', 'public');
        }

        $course = Course::create([
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'active' => (bool) ($validated['active'] ?? false),
            'access_type' => $validated['access_type'] ?? 'approval',
            'thumbnail' => $thumbnailPath,
        ]);

        $defaultGroup = CourseContentGroup::create([
            'course_id' => $course->id,
            'name' => 'Umum',
            'position' => 1,
        ]);

        $this->syncQuizzesWithPositions($course, $validated['quiz_ids'] ?? [], $defaultGroup->id);

        return redirect()
            ->route('courses.index')
            ->with('success', 'Course berhasil dibuat.');
    }

    public function show(Course $course)
    {
        $this->ensureCanManage();

        return redirect()->route('courses.edit', $course);
    }

    public function edit(Course $course)
    {
        $this->ensureCanManage();

        return Inertia::render('Courses/Edit', [
            'course' => $course->load([
                'quizzes' => fn ($query) => $query->withCount('questions'),
                'materials',
            ]),
            'quizzes' => QuestionPackage::query()
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'duration', 'active', 'total_questions']),
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
            'access_type' => 'nullable|in:direct,approval',
            'thumbnail' => 'nullable|image|max:2048',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'active' => (bool) ($validated['active'] ?? false),
            'access_type' => $validated['access_type'] ?? 'approval',
            'thumbnail' => $course->thumbnail,
        ];

        if ($request->hasFile('thumbnail')) {
            $updateData['thumbnail'] = $request->file('thumbnail')->store('courses', 'public');
        }

        $course->update($updateData);

        return redirect()
            ->route('courses.edit', $course)
            ->with('success', 'Course berhasil diperbarui.');
    }

    public function destroy(Course $course)
    {
        $this->ensureCanManage();

        // Remove files if any from materials
        foreach ($course->materials as $material) {
            if ($material->file_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($material->file_path);
            }
        }

        $course->materials()->delete();
        $course->contentGroups()->delete();
        $course->enrollments()->delete();
        $course->quizAttempts()->delete();
        $course->quizzes()->detach();

        $course->delete();

        return redirect()
            ->route('courses.index')
            ->with('success', 'Course berhasil dihapus.');
    }

    public function attachQuizzesToCourses(Request $request)
    {
        $this->ensureCanManage();

        $validator = validator($request->all(), [
            'course_ids' => 'required|array|min:1',
            'course_ids.*' => 'exists:courses,id',
            'quiz_ids' => 'required|array|min:1',
            'quiz_ids.*' => 'exists:question_packages,id',
            'group_ids' => 'required|array|min:1',
            'group_ids.*' => 'required|integer|exists:course_content_groups,id',
        ]);

        $validator->after(function ($validator) use ($request) {
            $courseIds = $request->input('course_ids', []);
            $groupIds = $request->input('group_ids', []);

            foreach ((array) $courseIds as $courseId) {
                $courseIdKey = (string) $courseId;
                $groupId = $groupIds[$courseIdKey] ?? null;

                if (! $groupId) {
                    $validator->errors()->add("group_ids.{$courseIdKey}", 'Group wajib dipilih untuk setiap kursus.');
                    continue;
                }

                $exists = CourseContentGroup::query()
                    ->where('id', $groupId)
                    ->where('course_id', $courseId)
                    ->exists();

                if (! $exists) {
                    $validator->errors()->add("group_ids.{$courseIdKey}", 'Group tidak valid untuk kursus ini.');
                }
            }
        });

        $validated = $validator->validate();

        $courses = Course::whereIn('id', $validated['course_ids'])->get();
        $quizIds = $validated['quiz_ids'];

        foreach ($courses as $course) {
            $existingQuizIds = $course->quizzes()->pluck('question_packages.id')->all();
            $groupId = (int) ($validated['group_ids'][(string) $course->id] ?? 0);
            $nextPosition = (int) \Illuminate\Support\Facades\DB::table('course_question_package')
                ->where('course_id', $course->id)
                ->where('group_id', $groupId)
                ->max('position');

            foreach ($quizIds as $quizId) {
                if (in_array($quizId, $existingQuizIds, true)) {
                    continue;
                }
                $nextPosition++;
                $course->quizzes()->attach($quizId, [
                    'position' => $nextPosition,
                    'group_id' => $groupId,
                ]);
            }
        }

        $courseNames = $courses->pluck('name')->join(', ');

        return redirect()
            ->route('quizzes.index')
            ->with('success', "Quiz berhasil dimasukkan ke kursus: {$courseNames}.");
    }

    private function syncQuizzesWithPositions(Course $course, array $quizIds, int $groupId): void
    {
        $syncData = [];

        foreach (array_values($quizIds) as $index => $quizId) {
            $syncData[$quizId] = [
                'position' => $index + 1,
                'group_id' => $groupId,
            ];
        }

        $course->quizzes()->sync($syncData);
    }
}
