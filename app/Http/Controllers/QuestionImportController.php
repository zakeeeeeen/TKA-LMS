<?php

namespace App\Http\Controllers;

use App\Imports\QuestionsImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class QuestionImportController extends Controller
{
    public function create()
    {
        return Inertia::render('Questions/Import', [
            'supportedFormats' => ['.xlsx', '.xls', '.csv', '.txt'],
            'templateChoiceUrl' => route('questions.import.template-choice'),
            'templateMatrixUrl' => route('questions.import.template-matrix'),
            'templateFormSoalUrl' => route('questions.import.template-form-soal'),
            'choiceColumns' => [
                'subject',
                'question_type',
                'question_text',
                'option_a',
                'option_b',
                'option_c',
                'option_d',
                'option_e',
                'correct_answer',
                'explanation',
            ],
            'matrixColumns' => [
                'subject',
                'question_text',
                'left_label',
                'right_label',
                'statement_1',
                'answer_1',
                'statement_2',
                'answer_2',
                'statement_3',
                'answer_3',
                'statement_4',
                'answer_4',
                'statement_5',
                'answer_5',
                'explanation',
            ],
        ]);
    }

    public function templateFormSoal(): BinaryFileResponse
    {
        $path = public_path('template-import-soal.xls');

        return response()->download($path, 'template-import-soal.xls', [
            'Content-Type' => 'application/vnd.ms-excel',
        ]);
    }

    public function templateChoice(): BinaryFileResponse
    {
        return $this->templateFormSoal();
    }

    public function templateMatrix(): BinaryFileResponse
    {
        return $this->templateFormSoal();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt', 'max:10240'],
        ]);

        $import = new QuestionsImport((int) $request->user()->id);

        try {
            DB::transaction(function () use ($import, $validated) {
                Excel::import($import, $validated['file']);
            });
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return back()->withErrors([
                'file' => 'Import gagal diproses. Pastikan format file dan isi kolom sudah sesuai template.',
            ]);
        }

        if ($import->getImportedCount() === 0) {
            return back()->withErrors([
                'file' => 'Tidak ada soal yang berhasil diimpor. Pastikan file berisi data dan tidak hanya header.',
            ]);
        }

        return redirect()->route('questions.index')->with(
            'success',
            "Import berhasil: {$import->getImportedCount()} soal ditambahkan, {$import->getCreatedSubjectsCount()} subject baru."
        );
    }

    public function template(): BinaryFileResponse
    {
        $path = public_path('form-soal-ganda.xls');

        return response()->download($path, 'form-soal-ganda.xls', [
            'Content-Type' => 'application/vnd.ms-excel',
        ]);
    }
}
