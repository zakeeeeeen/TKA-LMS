<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\QuestionPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseQuizController extends Controller
{
    private function ensureCanManage(): void
    {
        abort_unless(in_array(auth()->user()?->role, ['admin', 'guru'], true), 403);
    }

    public function index(Course $course)
    {
        $this->ensureCanManage();

        $course->load('quizzes');
        $allQuizzes = QuestionPackage::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description', 'duration', 'active', 'total_questions']);

        return Inertia::render('CourseQuizzes/Index', [
            'course' => $course,
            'allQuizzes' => $allQuizzes,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'quiz_ids' => 'nullable|array',
            'quiz_ids.*' => 'exists:question_packages,id',
        ]);

        $this->syncQuizzesWithPositions($course, $validated['quiz_ids'] ?? []);

        return redirect()
            ->route('courses.quizzes.index', $course)
            ->with('success', 'Quiz berhasil diperbarui.');
    }

    public function move(Request $request, Course $course, QuestionPackage $quiz)
    {
        $this->ensureCanManage();
        abort_unless($course->quizzes()->where('question_packages.id', $quiz->id)->exists(), 404);

        $validated = $request->validate([
            'direction' => 'required|in:up,down',
        ]);

        $orderedQuizIds = $course->quizzes()->orderBy('position')->pluck('question_packages.id')->values()->all();
        $currentIndex = array_search($quiz->id, $orderedQuizIds, true);

        if ($currentIndex === false) {
            return redirect()->back();
        }

        $swapIndex = $validated['direction'] === 'up' ? $currentIndex - 1 : $currentIndex + 1;

        if (!isset($orderedQuizIds[$swapIndex])) {
            return redirect()->back();
        }

        $swapQuiz = QuestionPackage::find($orderedQuizIds[$swapIndex]);
        if ($swapQuiz) {
            $currentPivot = $course->quizzes()->where('question_packages.id', $quiz->id)->first()->pivot;
            $swapPivot = $course->quizzes()->where('question_packages.id', $swapQuiz->id)->first()->pivot;
            
            $tempPosition = $currentPivot->position;
            $currentPivot->update(['position' => $swapPivot->position]);
            $swapPivot->update(['position' => $tempPosition]);
        }

        return redirect()->back()->with('success', 'Urutan quiz berhasil diperbarui.');
    }

    private function syncQuizzesWithPositions(Course $course, array $quizIds): void
    {
        $syncData = [];

        foreach (array_values($quizIds) as $index => $quizId) {
            $syncData[$quizId] = ['position' => $index + 1];
        }

        $course->quizzes()->sync($syncData);
    }
}
