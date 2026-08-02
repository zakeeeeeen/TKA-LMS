<?php

namespace App\Support;

use App\Models\Question;

class QuestionTypeHelper
{
    public const TYPE_SINGLE = 'single_choice';
    public const TYPE_MULTI = 'multiple_choice';
    public const TYPE_MATRIX = 'matrix_binary';
    public const TYPE_ESSAY = 'essay';

    public static function optionKeys(): array
    {
        return ['a', 'b', 'c', 'd', 'e'];
    }

    public static function typeOptions(): array
    {
        return [
            self::TYPE_SINGLE,
            self::TYPE_MULTI,
            self::TYPE_MATRIX,
            self::TYPE_ESSAY,
        ];
    }

    public static function activeTypeOptions(): array
    {
        return [
            self::TYPE_SINGLE,
            self::TYPE_MULTI,
            self::TYPE_MATRIX,
        ];
    }

    public static function normalizeOptions(array $data): array
    {
        foreach (self::optionKeys() as $optionKey) {
            $field = 'option_' . $optionKey;
            $data[$field] = trim((string) ($data[$field] ?? ''));
            $data[$field] = $data[$field] !== '' ? $data[$field] : null;
        }

        return $data;
    }

    public static function filledOptions(array|Question $question): array
    {
        $payload = $question instanceof Question ? $question->toArray() : $question;

        $options = [];
        foreach (self::optionKeys() as $optionKey) {
            $value = $payload['option_' . $optionKey] ?? null;
            if ($value !== null && trim((string) $value) !== '') {
                $options[$optionKey] = $value;
            }
        }

        return $options;
    }

    public static function normalizeCorrectOptions(?array $correctOptions): array
    {
        $validKeys = self::optionKeys();
        $normalized = [];

        foreach ($correctOptions ?? [] as $option) {
            $option = strtolower(trim((string) $option));
            if (in_array($option, $validKeys, true) && ! in_array($option, $normalized, true)) {
                $normalized[] = $option;
            }
        }

        sort($normalized);

        return $normalized;
    }

    public static function normalizeMatrixRows(?array $rows): array
    {
        $normalized = [];

        foreach ($rows ?? [] as $row) {
            $statement = trim((string) ($row['statement'] ?? ''));
            $correctAnswer = strtolower(trim((string) ($row['correct_answer'] ?? '')));

            if ($statement === '') {
                continue;
            }

            if (! in_array($correctAnswer, ['left', 'right'], true)) {
                $correctAnswer = 'left';
            }

            $normalized[] = [
                'statement' => $statement,
                'correct_answer' => $correctAnswer,
            ];
        }

        return array_values($normalized);
    }

    public static function normalizeMatrixAnswers(?array $answers, int $rowCount): array
    {
        $normalized = [];

        for ($index = 0; $index < $rowCount; $index++) {
            $value = strtolower(trim((string) (($answers ?? [])[$index] ?? '')));
            $normalized[$index] = in_array($value, ['left', 'right'], true) ? $value : null;
        }

        return $normalized;
    }

    public static function isMultipleChoiceExactMatch(array $selectedOptions, array $correctOptions): bool
    {
        return self::normalizeCorrectOptions($selectedOptions) === self::normalizeCorrectOptions($correctOptions);
    }

    public static function isMatrixExactMatch(array $matrixAnswers, array $matrixRows): bool
    {
        if (count($matrixAnswers) !== count($matrixRows)) {
            return false;
        }

        foreach ($matrixRows as $index => $row) {
            if (($matrixAnswers[$index] ?? null) !== ($row['correct_answer'] ?? null)) {
                return false;
            }
        }

        return true;
    }

    public static function isAnswerComplete(Question $question, array $answer): bool
    {
        if ($question->question_type === self::TYPE_MULTI) {
            return count(self::normalizeCorrectOptions($answer['selected_options'] ?? [])) > 0;
        }

        if ($question->question_type === self::TYPE_MATRIX) {
            $rows = self::normalizeMatrixRows($question->matrix_rows ?? []);
            $matrixAnswers = self::normalizeMatrixAnswers($answer['matrix_answers'] ?? [], count($rows));

            // Return true if at least one row in the matrix is answered
            return count($rows) > 0 && count(array_filter($matrixAnswers, fn ($val) => $val !== null)) > 0;
        }

        if ($question->question_type === self::TYPE_ESSAY) {
            return trim((string) ($answer['answer_text'] ?? '')) !== '';
        }

        return trim((string) ($answer['selected_option'] ?? '')) !== '';
    }

    public static function answerAttributesForQuestion(Question $question, array $validated): array
    {
        $attributes = [
            'selected_option' => null,
            'selected_options' => null,
            'matrix_answers' => null,
            'answer_text' => null,
            'is_marked' => (bool) ($validated['is_marked'] ?? false),
            'is_correct' => null,
        ];

        if ($question->question_type === self::TYPE_MULTI) {
            $selectedOptions = self::normalizeCorrectOptions($validated['selected_options'] ?? []);
            $attributes['selected_options'] = $selectedOptions !== [] ? $selectedOptions : null;
            $attributes['is_correct'] = $selectedOptions === []
                ? null
                : self::isMultipleChoiceExactMatch($selectedOptions, $question->correct_options ?? []);

            return $attributes;
        }

        if ($question->question_type === self::TYPE_MATRIX) {
            $rows = self::normalizeMatrixRows($question->matrix_rows ?? []);
            $matrixAnswers = self::normalizeMatrixAnswers($validated['matrix_answers'] ?? [], count($rows));
            $attributes['matrix_answers'] = $matrixAnswers;
            $attributes['is_correct'] = in_array(null, $matrixAnswers, true) || count($rows) === 0
                ? null
                : self::isMatrixExactMatch($matrixAnswers, $rows);

            return $attributes;
        }

        if ($question->question_type === self::TYPE_ESSAY) {
            $submittedAnswer = trim((string) ($validated['answer_text'] ?? ''));
            $correctAnswer = trim((string) ($question->answer_text ?? ''));
            $attributes['answer_text'] = $submittedAnswer !== '' ? $submittedAnswer : null;
            $attributes['is_correct'] = $submittedAnswer === ''
                ? null
                : mb_strtolower($submittedAnswer) === mb_strtolower($correctAnswer);

            return $attributes;
        }

        $selectedOption = strtolower(trim((string) ($validated['selected_option'] ?? '')));
        $attributes['selected_option'] = $selectedOption !== '' ? $selectedOption : null;
        $attributes['is_correct'] = $selectedOption === ''
            ? null
            : $selectedOption === strtolower((string) ($question->correct_option ?? ''));

        return $attributes;
    }

    public static function label(string $type): string
    {
        return match ($type) {
            self::TYPE_SINGLE => 'Pilihan Ganda 1 Jawaban',
            self::TYPE_MULTI => 'Pilihan Ganda Multi Jawaban',
            self::TYPE_MATRIX => 'Benar/Salah Tabel',
            self::TYPE_ESSAY => 'Isian',
            default => $type,
        };
    }

    public static function formatCorrectAnswer(Question $question): string
    {
        if ($question->question_type === self::TYPE_MULTI) {
            return strtoupper(implode(', ', self::normalizeCorrectOptions($question->correct_options ?? [])));
        }

        if ($question->question_type === self::TYPE_MATRIX) {
            $rows = self::normalizeMatrixRows($question->matrix_rows ?? []);
            $leftLabel = trim((string) ($question->matrix_left_label ?? 'Kolom Kiri'));
            $rightLabel = trim((string) ($question->matrix_right_label ?? 'Kolom Kanan'));

            return collect($rows)->map(function (array $row, int $index) use ($leftLabel, $rightLabel) {
                $label = $row['correct_answer'] === 'right' ? $rightLabel : $leftLabel;
                return ($index + 1) . '. ' . $label;
            })->implode("\n");
        }

        if ($question->question_type === self::TYPE_ESSAY) {
            return (string) ($question->answer_text ?? '');
        }

        return strtoupper((string) ($question->correct_option ?? ''));
    }

    public static function formatStudentAnswer(Question $question, object|null $answer): string
    {
        if ($question->question_type === self::TYPE_MULTI) {
            return strtoupper(implode(', ', self::normalizeCorrectOptions($answer?->selected_options ?? [])));
        }

        if ($question->question_type === self::TYPE_MATRIX) {
            $rows = self::normalizeMatrixRows($question->matrix_rows ?? []);
            $matrixAnswers = self::normalizeMatrixAnswers($answer?->matrix_answers ?? [], count($rows));
            $leftLabel = trim((string) ($question->matrix_left_label ?? 'Kolom Kiri'));
            $rightLabel = trim((string) ($question->matrix_right_label ?? 'Kolom Kanan'));

            return collect($matrixAnswers)->map(function ($value, int $index) use ($leftLabel, $rightLabel) {
                $label = $value === 'right' ? $rightLabel : ($value === 'left' ? $leftLabel : '-');
                return ($index + 1) . '. ' . $label;
            })->implode("\n");
        }

        if ($question->question_type === self::TYPE_ESSAY) {
            return (string) ($answer?->answer_text ?? '');
        }

        return strtoupper((string) ($answer?->selected_option ?? ''));
    }
}
