<?php

namespace App\Http\Controllers;

use App\Models\QuestionPackage;
use App\Models\Question;
use App\Models\CourseContentGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuestionPackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $questionPackages = QuestionPackage::withCount('questions')->get();
        $courses = \App\Models\Course::orderBy('name')->get(['id', 'name']);
        $groups = CourseContentGroup::orderBy('course_id')->orderBy('position')->get(['id', 'course_id', 'name', 'position']);
        return Inertia::render('QuestionPackages/Index', [
            'questionPackages' => $questionPackages,
            'courses' => $courses,
            'groups' => $groups,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('QuestionPackages/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1',
            'question_ids' => 'nullable|array',
            'question_ids.*' => 'exists:questions,id',
            'min_score' => 'nullable|integer',
            'shuffle_questions' => 'nullable|boolean',
            'shuffle_options' => 'nullable|boolean',
            'active' => 'nullable|boolean',
        ]);

        $validated['user_id'] = auth()->id();
        $questionIds = $validated['question_ids'] ?? [];
        $validated['total_questions'] = count($questionIds);
        $validated['min_score'] = $validated['min_score'] ?? null;
        $validated['shuffle_questions'] = (bool) ($validated['shuffle_questions'] ?? false);
        $validated['shuffle_options'] = (bool) ($validated['shuffle_options'] ?? false);
        $validated['active'] = (bool) ($validated['active'] ?? false);
        $questionPackage = QuestionPackage::create($validated);
        $this->syncQuestionsWithPositions($questionPackage, $questionIds);

        return redirect()
            ->route('quizzes.edit', $questionPackage)
            ->with('success', 'Quiz berhasil dibuat. Sekarang kamu bisa mengatur urutan soal atau menambahkan soal dari Question Bank.');
    }

    /**
     * Display the specified resource.
     */
    public function show(QuestionPackage $questionPackage)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(QuestionPackage $questionPackage)
    {
        return Inertia::render('QuestionPackages/Edit', [
            'questionPackage' => $questionPackage->load([
                'questions' => fn ($query) => $query->with('subject'),
            ]),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, QuestionPackage $questionPackage)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'required|integer|min:1',
            'min_score' => 'nullable|integer',
            'shuffle_questions' => 'nullable|boolean',
            'shuffle_options' => 'nullable|boolean',
            'active' => 'nullable|boolean',
        ]);

        $validated['min_score'] = $validated['min_score'] ?? null;
        $validated['shuffle_questions'] = (bool) ($validated['shuffle_questions'] ?? false);
        $validated['shuffle_options'] = (bool) ($validated['shuffle_options'] ?? false);
        $validated['active'] = (bool) ($validated['active'] ?? false);
        $validated['total_questions'] = $questionPackage->questions()->count();
        $questionPackage->update($validated);

        return redirect()
            ->route('quizzes.edit', $questionPackage)
            ->with('success', 'Quiz berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(QuestionPackage $questionPackage)
    {
        $questionPackage->delete();
        return redirect()->route('quizzes.index')->with('success', 'Quiz berhasil dihapus.');
    }

    public function attachQuestions(Request $request)
    {
        $validated = $request->validate([
            'quiz_ids' => 'nullable|array',
            'quiz_ids.*' => 'exists:question_packages,id',
            'package_ids' => 'nullable|array',
            'package_ids.*' => 'exists:question_packages,id',
            'new_quiz_name' => 'nullable|string|max:255',
            'new_quiz_duration' => 'nullable|integer|min:1',
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'exists:questions,id',
        ]);

        $quizIds = $validated['quiz_ids'] ?? $validated['package_ids'] ?? [];

        $newQuizName = trim((string) ($validated['new_quiz_name'] ?? ''));
        if ($newQuizName !== '') {
            $duration = (int) ($validated['new_quiz_duration'] ?? 30);
            if ($duration <= 0) {
                $duration = 30;
            }

            $newPackage = QuestionPackage::create([
                'user_id' => auth()->id(),
                'name' => $newQuizName,
                'description' => null,
                'duration' => $duration,
                'min_score' => null,
                'shuffle_questions' => false,
                'shuffle_options' => false,
                'active' => true,
                'total_questions' => 0,
            ]);

            $quizIds[] = $newPackage->id;
        }

        if (empty($quizIds)) {
            return redirect()->back()->withErrors([
                'quiz_ids' => 'Pilih setidaknya satu quiz yang sudah ada atau buat quiz baru.',
            ]);
        }

        $packages = QuestionPackage::whereIn('id', array_unique($quizIds))->get();

        foreach ($packages as $package) {
            $this->appendQuestionsToPackage($package, $validated['question_ids']);
        }

        return redirect()->back()->with('success', 'Soal berhasil dimasukkan ke quiz.');
    }

    public function removeQuestion(QuestionPackage $questionPackage, Question $question)
    {
        $questionPackage->questions()->detach($question->id);
        $this->reorderPackageQuestions($questionPackage);

        return redirect()
            ->route('quizzes.edit', $questionPackage)
            ->with('success', 'Soal berhasil dikeluarkan dari quiz.');
    }

    public function moveQuestion(Request $request, QuestionPackage $questionPackage, Question $question)
    {
        $validated = $request->validate([
            'direction' => 'required|in:up,down',
        ]);

        $orderedQuestionIds = $questionPackage->questions()->pluck('questions.id')->values()->all();
        $currentIndex = array_search($question->id, $orderedQuestionIds, true);

        if ($currentIndex === false) {
            return redirect()
                ->route('quizzes.edit', $questionPackage)
                ->with('error', 'Soal tidak ditemukan di quiz ini.');
        }

        $swapIndex = $validated['direction'] === 'up' ? $currentIndex - 1 : $currentIndex + 1;

        if (! isset($orderedQuestionIds[$swapIndex])) {
            return redirect()->route('quizzes.edit', $questionPackage);
        }

        [$orderedQuestionIds[$currentIndex], $orderedQuestionIds[$swapIndex]] = [$orderedQuestionIds[$swapIndex], $orderedQuestionIds[$currentIndex]];

        $this->syncQuestionsWithPositions($questionPackage, $orderedQuestionIds);

        return redirect()
            ->route('quizzes.edit', $questionPackage)
            ->with('success', 'Urutan soal berhasil diperbarui.');
    }

    private function appendQuestionsToPackage(QuestionPackage $questionPackage, array $questionIds): void
    {
        $existingQuestionIds = $questionPackage->questions()->pluck('questions.id')->all();
        $nextPosition = (int) DB::table('question_package_question')
            ->where('question_package_id', $questionPackage->id)
            ->max('position');

        foreach ($questionIds as $questionId) {
            if (in_array($questionId, $existingQuestionIds, true)) {
                continue;
            }

            $nextPosition++;
            $questionPackage->questions()->attach($questionId, ['position' => $nextPosition]);
        }

        $this->refreshPackageQuestionCount($questionPackage);
    }

    private function reorderPackageQuestions(QuestionPackage $questionPackage): void
    {
        $questionIds = DB::table('question_package_question')
            ->where('question_package_id', $questionPackage->id)
            ->orderBy('position')
            ->pluck('question_id')
            ->all();

        $this->syncQuestionsWithPositions($questionPackage, $questionIds);
    }

    private function syncQuestionsWithPositions(QuestionPackage $questionPackage, array $questionIds): void
    {
        $syncData = [];

        foreach (array_values($questionIds) as $index => $questionId) {
            $syncData[$questionId] = ['position' => $index + 1];
        }

        $questionPackage->questions()->sync($syncData);
        $this->refreshPackageQuestionCount($questionPackage);
    }

    private function refreshPackageQuestionCount(QuestionPackage $questionPackage): void
    {
        $questionPackage->update([
            'total_questions' => $questionPackage->questions()->count(),
        ]);
    }
}
