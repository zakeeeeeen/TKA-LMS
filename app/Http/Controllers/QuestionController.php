<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\QuestionPackage;
use App\Models\Subject;
use App\Support\QuestionTypeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'subject_id', 'grade_level', 'question_type']);

        $questions = Question::with('subject')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->where('question_text', 'like', '%' . $search . '%')
                        ->orWhere('explanation', 'like', '%' . $search . '%')
                        ->orWhereHas('subject', fn ($subjectQuery) => $subjectQuery->where('name', 'like', '%' . $search . '%'));
                });
            })
            ->when($filters['subject_id'] ?? null, fn ($query, $subjectId) => $query->where('subject_id', $subjectId))
            ->when($filters['grade_level'] ?? null, fn ($query, $gradeLevel) => $query->where('grade_level', $gradeLevel))
            ->when($filters['question_type'] ?? null, fn ($query, $questionType) => $query->where('question_type', $questionType))
            ->latest()
            ->get();

        $subjects = Subject::all();

        return Inertia::render('Questions/Index', [
            'questions' => $questions,
            'subjects' => $subjects,
            'questionPackages' => QuestionPackage::select('id', 'name', 'total_questions')->orderBy('name')->get(),
            'filters' => $filters,
            'selectedPackageId' => $request->input('package_id'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $subjects = Subject::all();
        return Inertia::render('Questions/Create', [
            'subjects' => $subjects,
            'questionTypeOptions' => QuestionTypeHelper::activeTypeOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $this->validateQuestion($request);
        $payload = $this->prepareQuestionPayload($validated);
        $payload['user_id'] = auth()->id();
        $payload['image_path'] = $request->hasFile('image')
            ? $request->file('image')->store('questions', 'public')
            : null;
        $payload = $this->syncOptionImagePaths($request, $payload);

        Question::create($payload);
        return redirect()->route('questions.index')->with('success', 'Soal berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        $question->load('subject');

        return Inertia::render('Questions/Show', [
            'question' => $this->transformQuestionForForm($question),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        $subjects = Subject::all();
        return Inertia::render('Questions/Edit', [
            'question' => $this->transformQuestionForForm($question),
            'subjects' => $subjects,
            'questionTypeOptions' => array_values(array_unique([
                ...QuestionTypeHelper::activeTypeOptions(),
                $question->question_type,
            ])),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Question $question)
    {
        $validated = $this->validateQuestion($request);
        $payload = $this->prepareQuestionPayload($validated);
        $payload['image_path'] = $question->image_path;

        if ($request->hasFile('image')) {
            if ($question->image_path) {
                Storage::disk('public')->delete($question->image_path);
            }

            $payload['image_path'] = $request->file('image')->store('questions', 'public');
        }

        $payload = $this->syncOptionImagePaths($request, $payload, $question);
        $question->update($payload);

        return redirect()->route('questions.index')->with('success', 'Soal berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        abort_unless(auth()->user()?->role === 'admin', 403, 'Guru tidak diperbolehkan menghapus soal.');

        if ($question->image_path) {
            Storage::disk('public')->delete($question->image_path);
        }

        foreach (QuestionTypeHelper::optionKeys() as $optionKey) {
            $pathField = 'option_' . $optionKey . '_image_path';
            if ($question->{$pathField}) {
                Storage::disk('public')->delete($question->{$pathField});
            }
        }

        $question->delete();
        return redirect()->route('questions.index')->with('success', 'Soal berhasil dihapus.');
    }

    private function validateQuestion(Request $request): array
    {
        $validated = $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'grade_level' => ['required', Rule::in(['SD', 'SMP', 'SMA'])],
            'question_type' => ['required', Rule::in(QuestionTypeHelper::typeOptions())],
            'question_text' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'option_a' => ['nullable', 'string'],
            'option_a_image' => ['nullable', 'image', 'max:2048'],
            'option_b' => ['nullable', 'string'],
            'option_b_image' => ['nullable', 'image', 'max:2048'],
            'option_c' => ['nullable', 'string'],
            'option_c_image' => ['nullable', 'image', 'max:2048'],
            'option_d' => ['nullable', 'string'],
            'option_d_image' => ['nullable', 'image', 'max:2048'],
            'option_e' => ['nullable', 'string'],
            'option_e_image' => ['nullable', 'image', 'max:2048'],
            'correct_option' => ['nullable', Rule::in(QuestionTypeHelper::optionKeys())],
            'correct_options' => ['nullable', 'array'],
            'correct_options.*' => ['nullable', Rule::in(QuestionTypeHelper::optionKeys())],
            'matrix_left_label' => ['nullable', 'string', 'max:255'],
            'matrix_right_label' => ['nullable', 'string', 'max:255'],
            'matrix_rows' => ['nullable', 'array'],
            'matrix_rows.*.statement' => ['nullable', 'string'],
            'matrix_rows.*.correct_answer' => ['nullable', Rule::in(['left', 'right'])],
            'explanation' => ['nullable', 'string'],
        ]);

        $type = $validated['question_type'];
        $validated = QuestionTypeHelper::normalizeOptions($validated);
        $optionKeys = $this->resolveActiveOptionKeys($validated, $request);
        $options = array_fill_keys($optionKeys, true);

        if (in_array($type, [QuestionTypeHelper::TYPE_SINGLE, QuestionTypeHelper::TYPE_MULTI], true) && count($options) < 2) {
            throw ValidationException::withMessages([
                'option_a' => 'Minimal isi 2 opsi jawaban untuk soal pilihan ganda.',
            ]);
        }

        if ($type === QuestionTypeHelper::TYPE_SINGLE) {
            $correctOption = strtolower(trim((string) ($validated['correct_option'] ?? '')));

            if ($correctOption === '' || ! array_key_exists($correctOption, $options)) {
                throw ValidationException::withMessages([
                    'correct_option' => 'Pilih 1 jawaban benar dari opsi yang terisi.',
                ]);
            }
        }

        if ($type === QuestionTypeHelper::TYPE_MULTI) {
            $correctOptions = QuestionTypeHelper::normalizeCorrectOptions($validated['correct_options'] ?? []);
            $validCorrectOptions = array_values(array_intersect($correctOptions, array_keys($options)));

            if (count($validCorrectOptions) < 2) {
                throw ValidationException::withMessages([
                    'correct_options' => 'Soal multi jawaban harus memiliki minimal 2 jawaban benar.',
                ]);
            }

            $validated['correct_options'] = $validCorrectOptions;
        }

        if ($type === QuestionTypeHelper::TYPE_MATRIX) {
            $rows = QuestionTypeHelper::normalizeMatrixRows($validated['matrix_rows'] ?? []);

            if (trim((string) ($validated['matrix_left_label'] ?? '')) === '' || trim((string) ($validated['matrix_right_label'] ?? '')) === '') {
                throw ValidationException::withMessages([
                    'matrix_left_label' => 'Label kolom kiri dan kanan wajib diisi untuk tipe tabel.',
                ]);
            }

            if (count($rows) === 0) {
                throw ValidationException::withMessages([
                    'matrix_rows' => 'Minimal isi 1 pernyataan untuk tipe tabel.',
                ]);
            }

            $validated['matrix_rows'] = $rows;
        }

        return $validated;
    }

    private function prepareQuestionPayload(array $validated): array
    {
        $type = $validated['question_type'];
        $payload = [
            'subject_id' => $validated['subject_id'],
            'question_type' => $type,
            'question_text' => ($validated['question_text'] ?? null) !== null
                ? (trim((string) $validated['question_text']) !== '' ? trim((string) $validated['question_text']) : null)
                : null,
            'explanation' => $validated['explanation'] ?? null,
            'answer_text' => null,
            'correct_option' => null,
            'correct_options' => null,
            'matrix_left_label' => null,
            'matrix_right_label' => null,
            'matrix_rows' => null,
            'option_a_image_path' => null,
            'option_b_image_path' => null,
            'option_c_image_path' => null,
            'option_d_image_path' => null,
            'option_e_image_path' => null,
        ];

        $payload = array_merge($payload, QuestionTypeHelper::normalizeOptions($validated));

        if ($type === QuestionTypeHelper::TYPE_SINGLE) {
            $payload['correct_option'] = strtolower((string) $validated['correct_option']);
            $payload['correct_options'] = null;
            return $payload;
        }

        if ($type === QuestionTypeHelper::TYPE_MULTI) {
            $payload['correct_option'] = null;
            $payload['correct_options'] = QuestionTypeHelper::normalizeCorrectOptions($validated['correct_options'] ?? []);
            return $payload;
        }

        if ($type === QuestionTypeHelper::TYPE_MATRIX) {
            foreach (QuestionTypeHelper::optionKeys() as $optionKey) {
                $payload['option_' . $optionKey] = null;
            }

            $payload['matrix_left_label'] = trim((string) ($validated['matrix_left_label'] ?? ''));
            $payload['matrix_right_label'] = trim((string) ($validated['matrix_right_label'] ?? ''));
            $payload['matrix_rows'] = QuestionTypeHelper::normalizeMatrixRows($validated['matrix_rows'] ?? []);
            return $payload;
        }

        return $payload;
    }

    private function transformQuestionForForm(Question $question): array
    {
        return array_merge($question->toArray(), [
            'image_url' => $question->image_url,
            'option_a_image_url' => $question->option_a_image_url,
            'option_b_image_url' => $question->option_b_image_url,
            'option_c_image_url' => $question->option_c_image_url,
            'option_d_image_url' => $question->option_d_image_url,
            'option_e_image_url' => $question->option_e_image_url,
            'correct_options' => QuestionTypeHelper::normalizeCorrectOptions($question->correct_options ?? []),
            'matrix_rows' => QuestionTypeHelper::normalizeMatrixRows($question->matrix_rows ?? []),
        ]);
    }

    private function syncOptionImagePaths(Request $request, array $payload, ?Question $question = null): array
    {
        foreach (QuestionTypeHelper::optionKeys() as $optionKey) {
            $optionField = 'option_' . $optionKey;
            $imageInputField = 'option_' . $optionKey . '_image';
            $imagePathField = 'option_' . $optionKey . '_image_path';
            $currentPath = $question?->{$imagePathField};

            $payload[$imagePathField] = $currentPath;

            $hasText = (bool) ($payload[$optionField] ?? null);
            $hasIncomingImage = $request->hasFile($imageInputField);
            $hasCurrentImage = (bool) $currentPath;

            if (! $hasText && ! $hasIncomingImage && ! $hasCurrentImage) {
                if ($currentPath) {
                    Storage::disk('public')->delete($currentPath);
                }

                $payload[$imagePathField] = null;
                continue;
            }

            if (! $request->hasFile($imageInputField)) {
                if (! $question) {
                    $payload[$imagePathField] = null;
                }

                continue;
            }

            if ($currentPath) {
                Storage::disk('public')->delete($currentPath);
            }

            $payload[$imagePathField] = $request->file($imageInputField)->store('questions/options', 'public');
        }

        return $payload;
    }

    private function resolveActiveOptionKeys(array $validated, Request $request, ?Question $question = null): array
    {
        $activeKeys = [];

        foreach (QuestionTypeHelper::optionKeys() as $optionKey) {
            $textField = 'option_' . $optionKey;
            $imageInputField = 'option_' . $optionKey . '_image';
            $imagePathField = 'option_' . $optionKey . '_image_path';

            $hasText = trim((string) ($validated[$textField] ?? '')) !== '';
            $hasIncomingImage = $request->hasFile($imageInputField);
            $hasStoredImage = (bool) ($question?->{$imagePathField});

            if ($hasText || $hasIncomingImage || $hasStoredImage) {
                $activeKeys[] = $optionKey;
            }
        }

        return $activeKeys;
    }

    /**
     * Upload an inline image from rich text editor.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $path = $request->file('image')->store('question_images', 'public');
        $url = Storage::url($path);

        return response()->json([
            'url' => $url,
        ]);
    }
}
