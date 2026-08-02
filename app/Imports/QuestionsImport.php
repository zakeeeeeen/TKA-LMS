<?php

namespace App\Imports;

use App\Models\Question;
use App\Models\Subject;
use App\Support\QuestionTypeHelper;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class QuestionsImport implements ToCollection
{
    protected int $userId;

    protected int $importedCount = 0;

    protected int $createdSubjectsCount = 0;

    public function __construct(int $userId)
    {
        $this->userId = $userId;
    }

    public function collection(Collection $rows): void
    {
        $this->processSubRowFormat($rows);
    }

    protected function processSubRowFormat(Collection $rows): void
    {
        $currentQuestion = null;
        $currentOptions = [];
        $correctOptions = [];
        $startRowNumber = 0;
        $defaultSubject = Subject::first() ?? Subject::create(['name' => 'Umum', 'description' => 'Mata pelajaran default']);

        $commitQuestion = function () use (&$currentQuestion, &$currentOptions, &$correctOptions, &$startRowNumber, $defaultSubject) {
            if (!$currentQuestion) {
                return;
            }

            if (empty(trim($currentQuestion['text']))) {
                $currentQuestion = null;
                $currentOptions = [];
                $correctOptions = [];
                return;
            }

            $rawType = trim((string) ($currentQuestion['raw_type'] ?? ''));
            $rawGrade = trim((string) ($currentQuestion['raw_grade'] ?? ''));
            
            // Map rawType: 1 => single_choice, 2 => multiple_choice, 3 => matrix_binary
            if ($rawType === '1' || str_contains(strtolower($rawType), 'single')) {
                $questionType = QuestionTypeHelper::TYPE_SINGLE;
            } elseif ($rawType === '2' || str_contains(strtolower($rawType), 'multi')) {
                $questionType = QuestionTypeHelper::TYPE_MULTI;
            } elseif ($rawType === '3' || str_contains(strtolower($rawType), 'benar') || str_contains(strtolower($rawType), 'matrix')) {
                $questionType = QuestionTypeHelper::TYPE_MATRIX;
            } else {
                // Fallback auto-detect
                $questionType = count($correctOptions) > 1 ? QuestionTypeHelper::TYPE_MULTI : QuestionTypeHelper::TYPE_SINGLE;
            }

            // Map rawGrade: 1 => SD, 2 => SMP, 3 => SMA
            $gradeLevel = null;
            if ($rawGrade === '1' || strtoupper($rawGrade) === 'SD') {
                $gradeLevel = 'SD';
            } elseif ($rawGrade === '2' || strtoupper($rawGrade) === 'SMP') {
                $gradeLevel = 'SMP';
            } elseif ($rawGrade === '3' || strtoupper($rawGrade) === 'SMA') {
                $gradeLevel = 'SMA';
            }

            $payload = [
                'subject_id' => $defaultSubject->id,
                'grade_level' => $gradeLevel,
                'user_id' => $this->userId,
                'question_type' => $questionType,
                'question_text' => $currentQuestion['text'],
                'option_a' => null,
                'option_b' => null,
                'option_c' => null,
                'option_d' => null,
                'option_e' => null,
                'correct_option' => null,
                'correct_options' => null,
                'answer_text' => null,
                'matrix_left_label' => null,
                'matrix_right_label' => null,
                'matrix_rows' => null,
                'explanation' => null,
            ];

            if (in_array($questionType, [QuestionTypeHelper::TYPE_SINGLE, QuestionTypeHelper::TYPE_MULTI], true)) {
                if (count($currentOptions) < 2) {
                    throw ValidationException::withMessages([
                        'file' => ["Soal di baris {$startRowNumber}: Minimal harus memiliki 2 opsi jawaban."],
                    ]);
                }

                $optionKeys = ['a', 'b', 'c', 'd', 'e'];
                $payloadOptions = [];
                foreach ($optionKeys as $idx => $key) {
                    $payloadOptions["option_{$key}"] = isset($currentOptions[$idx]) ? $currentOptions[$idx]['text'] : null;
                }

                $payload['option_a'] = $payloadOptions['option_a'];
                $payload['option_b'] = $payloadOptions['option_b'];
                $payload['option_c'] = $payloadOptions['option_c'];
                $payload['option_d'] = $payloadOptions['option_d'];
                $payload['option_e'] = $payloadOptions['option_e'];

                if ($questionType === QuestionTypeHelper::TYPE_SINGLE) {
                    $payload['correct_option'] = $correctOptions[0] ?? null;
                    if (!$payload['correct_option']) {
                        throw ValidationException::withMessages([
                            'file' => ["Soal di baris {$startRowNumber}: Belum ada jawaban benar (status = 1)."],
                        ]);
                    }
                } else {
                    $payload['correct_options'] = $correctOptions;
                    if (count($correctOptions) < 2) {
                        throw ValidationException::withMessages([
                            'file' => ["Soal di baris {$startRowNumber}: Pilihan ganda multi jawaban minimal memiliki 2 jawaban benar (status = 1)."],
                        ]);
                    }
                }
            } elseif ($questionType === QuestionTypeHelper::TYPE_MATRIX) {
                // Tipe 3: Benar / Salah
                $matrixRows = [];
                foreach ($currentOptions as $opt) {
                    $matrixRows[] = [
                        'statement' => $opt['statement'],
                        'correct_answer' => $opt['is_true'] ? 'left' : 'right',
                    ];
                }

                if (count($matrixRows) < 1) {
                    throw ValidationException::withMessages([
                        'file' => ["Soal Benar/Salah di baris {$startRowNumber}: Minimal isi 1 pernyataan."],
                    ]);
                }

                $payload['matrix_left_label'] = 'Benar';
                $payload['matrix_right_label'] = 'Salah';
                $payload['matrix_rows'] = $matrixRows;
            }

            Question::create($payload);
            $this->importedCount++;

            $currentQuestion = null;
            $currentOptions = [];
            $correctOptions = [];
        };

        $optionLetters = ['a', 'b', 'c', 'd', 'e'];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 1; // 1-indexed exact Excel row number
            $rowArray = array_values($row->toArray());

            // Check columns by index or keys
            $jenis = strtoupper(trim((string) ($rowArray[1] ?? $row['jenis'] ?? $row['Jenis'] ?? '')));
            $kode = strtoupper(trim((string) ($rowArray[2] ?? $row['kode'] ?? $row['Kode'] ?? '')));
            $isi = trim((string) ($rowArray[3] ?? $row['isi'] ?? $row['Isi'] ?? ''));
            $status = trim((string) ($rowArray[4] ?? $row['status_jawaban'] ?? $row['Status Jawaban'] ?? ''));
            $tipeJawaban = trim((string) ($rowArray[6] ?? $row['tipe_jawaban'] ?? $row['Tipe Jawaban'] ?? ''));
            $tipePendidikan = trim((string) ($rowArray[7] ?? $row['tingkat_pendidikan'] ?? $row['Tingkat Pendidikan'] ?? ''));

            if ($jenis === 'SOAL' || $kode === 'Q') {
                $commitQuestion();
                if ($isi !== '') {
                    $currentQuestion = [
                        'text' => $isi,
                        'raw_type' => $tipeJawaban,
                        'raw_grade' => $tipePendidikan,
                    ];
                    $startRowNumber = $rowNumber;
                }
            } elseif (($jenis === 'JAWABAN' || $kode === 'A') && $currentQuestion !== null) {
                if ($isi !== '') {
                    $optIndex = count($currentOptions);
                    $isTrue = ($status === '1' || $status === 1 || strtolower($status) === 'benar' || strtolower($status) === 'true');
                    
                    $currentOptions[] = [
                        'statement' => $isi,
                        'text' => $isi,
                        'is_true' => $isTrue,
                    ];
                    
                    if ($optIndex < 5) {
                        $letter = $optionLetters[$optIndex];
                        if ($isTrue) {
                            $correctOptions[] = $letter;
                        }
                    }
                }
            }
        }

        $commitQuestion();
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getCreatedSubjectsCount(): int
    {
        return $this->createdSubjectsCount;
    }

    protected function normalizeRow(array $row): array
    {
        // Detect question type logic
        $type = strtolower(trim((string) ($row['question_type'] ?? '')));
        if (in_array($type, ['single_choice', 'single', 'pilihan ganda', 'pg'], true)) {
            $type = QuestionTypeHelper::TYPE_SINGLE;
        } elseif (in_array($type, ['multiple_choice', 'multi_choice', 'multi', 'pilihan ganda kompleks'], true)) {
            $type = QuestionTypeHelper::TYPE_MULTI;
        } elseif (in_array($type, ['matrix_binary', 'matrix', 'benar_salah', 'tabel'], true)) {
            $type = QuestionTypeHelper::TYPE_MATRIX;
        } else {
            // Auto detect matrix if statement_1 or left_label exists
            if (isset($row['statement_1']) || isset($row['left_label']) || isset($row['matrix_statement_1'])) {
                $type = QuestionTypeHelper::TYPE_MATRIX;
            } elseif (isset($row['correct_answer']) && str_contains((string) $row['correct_answer'], ',')) {
                $type = QuestionTypeHelper::TYPE_MULTI;
            } else {
                $type = QuestionTypeHelper::TYPE_SINGLE;
            }
        }

        return [
            'subject' => trim((string) ($row['subject'] ?? '')),
            'question_type' => $type,
            'question_text' => trim((string) ($row['question_text'] ?? '')),
            'option_a' => trim((string) ($row['option_a'] ?? '')),
            'option_b' => trim((string) ($row['option_b'] ?? '')),
            'option_c' => trim((string) ($row['option_c'] ?? '')),
            'option_d' => trim((string) ($row['option_d'] ?? '')),
            'option_e' => trim((string) ($row['option_e'] ?? '')),
            'correct_option' => strtolower(trim((string) ($row['correct_option'] ?? ''))),
            'correct_options' => trim((string) ($row['correct_options'] ?? '')),
            'correct_answer' => trim((string) ($row['correct_answer'] ?? '')),
            'left_label' => trim((string) ($row['left_label'] ?? '')),
            'right_label' => trim((string) ($row['right_label'] ?? '')),
            'matrix_left_label' => trim((string) ($row['matrix_left_label'] ?? '')),
            'matrix_right_label' => trim((string) ($row['matrix_right_label'] ?? '')),
            'statement_1' => trim((string) ($row['statement_1'] ?? '')),
            'answer_1' => trim((string) ($row['answer_1'] ?? '')),
            'statement_2' => trim((string) ($row['statement_2'] ?? '')),
            'answer_2' => trim((string) ($row['answer_2'] ?? '')),
            'statement_3' => trim((string) ($row['statement_3'] ?? '')),
            'answer_3' => trim((string) ($row['answer_3'] ?? '')),
            'statement_4' => trim((string) ($row['statement_4'] ?? '')),
            'answer_4' => trim((string) ($row['answer_4'] ?? '')),
            'statement_5' => trim((string) ($row['statement_5'] ?? '')),
            'answer_5' => trim((string) ($row['answer_5'] ?? '')),
            'matrix_statement_1' => trim((string) ($row['matrix_statement_1'] ?? '')),
            'matrix_answer_1' => trim((string) ($row['matrix_answer_1'] ?? '')),
            'matrix_statement_2' => trim((string) ($row['matrix_statement_2'] ?? '')),
            'matrix_answer_2' => trim((string) ($row['matrix_answer_2'] ?? '')),
            'matrix_statement_3' => trim((string) ($row['matrix_statement_3'] ?? '')),
            'matrix_answer_3' => trim((string) ($row['matrix_answer_3'] ?? '')),
            'explanation' => trim((string) ($row['explanation'] ?? '')),
        ];
    }

    protected function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if ($value !== '') {
                return false;
            }
        }

        return true;
    }
}

