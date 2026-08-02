<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\QuestionPackage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ExamController extends Controller
{
    private function ensureCanManageExams(): void
    {
        abort_unless(in_array(auth()->user()?->role, ['admin', 'guru'], true), 403);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user?->role === 'siswa') {
            return redirect()
                ->route('student.courses.index')
                ->with('error', 'Flow quiz siswa sekarang diakses lewat menu Courses.');
        }

        $exams = Exam::with(['questionPackage', 'students'])->latest()->get();

        return Inertia::render('Exams/Index', [
            'exams' => $exams,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->ensureCanManageExams();

        $questionPackages = QuestionPackage::all();
        $students = User::where('role', 'siswa')->get();
        return Inertia::render('Exams/Create', [
            'questionPackages' => $questionPackages,
            'students' => $students
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->ensureCanManageExams();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'question_package_id' => 'required|exists:question_packages,id',
            'start_time' => 'required|date',
            'duration' => 'required|integer|min:1',
            'status' => 'required|in:not_started,ongoing,completed',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['end_time'] = Carbon::parse($validated['start_time'])->addMinutes((int) $validated['duration']);

        $exam = Exam::create($validated);
        $exam->students()->sync($validated['student_ids']);
        return redirect()->route('exams.index')->with('success', 'Sesi exam lama berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Exam $exam)
    {
        $user = auth()->user();

        if (in_array($user?->role, ['admin', 'guru'], true)) {
            return redirect()->route('exams.edit', $exam);
        }

        return redirect()
            ->route('student.courses.index')
            ->with('error', 'Flow quiz siswa sekarang diakses lewat menu Courses.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Exam $exam)
    {
        $this->ensureCanManageExams();

        $questionPackages = QuestionPackage::all();
        $students = User::where('role', 'siswa')->get();
        return Inertia::render('Exams/Edit', [
            'exam' => $exam->load('students'),
            'questionPackages' => $questionPackages,
            'students' => $students
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Exam $exam)
    {
        $this->ensureCanManageExams();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'question_package_id' => 'required|exists:question_packages,id',
            'start_time' => 'required|date',
            'duration' => 'required|integer|min:1',
            'status' => 'required|in:not_started,ongoing,completed',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $validated['end_time'] = Carbon::parse($validated['start_time'])->addMinutes((int) $validated['duration']);
        $exam->update($validated);
        $exam->students()->sync($validated['student_ids']);
        return redirect()->route('exams.index')->with('success', 'Sesi exam lama berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exam $exam)
    {
        $this->ensureCanManageExams();

        $exam->delete();
        return redirect()->route('exams.index')->with('success', 'Sesi exam lama berhasil dihapus.');
    }

    public function saveAnswer(Request $request, Exam $exam)
    {
        abort(410, 'Flow quiz lama berbasis exam sudah dipensiunkan untuk siswa.');
    }

    public function finish(Exam $exam)
    {
        abort(410, 'Flow quiz lama berbasis exam sudah dipensiunkan untuk siswa.');
    }
}
