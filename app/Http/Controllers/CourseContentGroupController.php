<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseContentGroup;
use App\Models\CourseMaterial;
use App\Models\QuestionPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourseContentGroupController extends Controller
{
    private function ensureCanManage(): void
    {
        abort_unless(in_array(auth()->user()?->role, ['admin', 'guru'], true), 403);
    }

    public function index(Course $course)
    {
        $this->ensureCanManage();

        $groups = $course->contentGroups()->get(['id', 'course_id', 'name', 'position']);

        $materials = $course->materials()
            ->with('group:id,name')
            ->orderBy('position')
            ->get(['id', 'course_id', 'group_id', 'title', 'position', 'is_published', 'file_path', 'file_type']);

        $quizzes = $course->quizzes()
            ->withCount('questions')
            ->get(['question_packages.id', 'question_packages.name', 'question_packages.description', 'question_packages.duration', 'question_packages.active', 'question_packages.total_questions']);

        $quizItems = $quizzes->map(function (QuestionPackage $quiz) use ($groups) {
            $group = $groups->firstWhere('id', (int) $quiz->pivot?->group_id);
            return [
                'id' => $quiz->id,
                'name' => $quiz->name,
                'duration' => $quiz->duration,
                'questions_count' => $quiz->questions_count ?? $quiz->total_questions ?? 0,
                'position' => (int) ($quiz->pivot?->position ?? 0),
                'group_id' => (int) ($quiz->pivot?->group_id ?? 0),
                'group_name' => $group?->name,
            ];
        })->values();

        return Inertia::render('CourseGroups/Index', [
            'course' => [
                'id' => $course->id,
                'name' => $course->name,
            ],
            'groups' => $groups,
            'materials' => $materials,
            'quizzes' => $quizItems,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $nextPosition = (int) CourseContentGroup::where('course_id', $course->id)->max('position');
        $nextPosition++;

        CourseContentGroup::create([
            'course_id' => $course->id,
            'name' => $validated['name'],
            'position' => $nextPosition,
        ]);

        return redirect()
            ->route('courses.groups.index', $course)
            ->with('success', 'Group berhasil dibuat.');
    }

    public function update(Request $request, Course $course, CourseContentGroup $group)
    {
        $this->ensureCanManage();
        abort_unless($group->course_id === $course->id, 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $group->update([
            'name' => $validated['name'],
        ]);

        return redirect()
            ->route('courses.groups.index', $course)
            ->with('success', 'Group berhasil diperbarui.');
    }

    public function destroy(Course $course, CourseContentGroup $group)
    {
        $this->ensureCanManage();
        abort_unless($group->course_id === $course->id, 404);

        $materialCount = CourseMaterial::where('course_id', $course->id)->where('group_id', $group->id)->count();
        $quizCount = DB::table('course_question_package')->where('course_id', $course->id)->where('group_id', $group->id)->count();

        if ($materialCount > 0 || $quizCount > 0) {
            return redirect()
                ->route('courses.groups.index', $course)
                ->with('error', 'Group tidak bisa dihapus karena masih berisi materi atau quiz.');
        }

        $group->delete();

        return redirect()
            ->route('courses.groups.index', $course)
            ->with('success', 'Group berhasil dihapus.');
    }

    public function move(Request $request, Course $course, CourseContentGroup $group)
    {
        $this->ensureCanManage();
        abort_unless($group->course_id === $course->id, 404);

        $validated = $request->validate([
            'direction' => 'required|in:up,down',
        ]);

        $orderedIds = CourseContentGroup::where('course_id', $course->id)
            ->orderBy('position')
            ->pluck('id')
            ->values()
            ->all();

        $currentIndex = array_search($group->id, $orderedIds, true);
        if ($currentIndex === false) {
            return redirect()->route('courses.groups.index', $course);
        }

        $swapIndex = $validated['direction'] === 'up' ? $currentIndex - 1 : $currentIndex + 1;
        if (! isset($orderedIds[$swapIndex])) {
            return redirect()->route('courses.groups.index', $course);
        }

        [$orderedIds[$currentIndex], $orderedIds[$swapIndex]] = [$orderedIds[$swapIndex], $orderedIds[$currentIndex]];

        foreach (array_values($orderedIds) as $index => $id) {
            CourseContentGroup::where('id', $id)->update(['position' => $index + 1]);
        }

        return redirect()->route('courses.groups.index', $course);
    }

    public function assignMaterial(Request $request, Course $course, CourseMaterial $material)
    {
        $this->ensureCanManage();
        abort_unless($material->course_id === $course->id, 404);

        $validated = $request->validate([
            'group_id' => 'required|integer',
        ]);

        $group = CourseContentGroup::where('course_id', $course->id)->where('id', $validated['group_id'])->first();
        abort_unless($group, 422);

        $material->update([
            'group_id' => $group->id,
        ]);

        return redirect()
            ->route('courses.groups.index', $course)
            ->with('success', 'Materi berhasil dipindahkan group.');
    }

    public function assignQuiz(Request $request, Course $course, QuestionPackage $questionPackage)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'group_id' => 'required|integer',
        ]);

        $group = CourseContentGroup::where('course_id', $course->id)->where('id', $validated['group_id'])->first();
        abort_unless($group, 422);

        DB::table('course_question_package')
            ->where('course_id', $course->id)
            ->where('question_package_id', $questionPackage->id)
            ->update(['group_id' => $group->id]);

        return redirect()
            ->route('courses.groups.index', $course)
            ->with('success', 'Quiz berhasil dipindahkan group.');
    }
}

