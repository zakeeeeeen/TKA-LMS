<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            // Matematika, user_id 2 (guru)
            [
                'subject_id' => 1,
                'user_id' => 2,
                'question_type' => 'single_choice',
                'question_text' => 'Berapa hasil dari 2 + 3 × 4?',
                'option_a' => '14',
                'option_b' => '20',
                'option_c' => '24',
                'option_d' => '12',
                'option_e' => null,
                'correct_option' => 'a',
                'correct_options' => null,
                'answer_text' => null,
                'matrix_left_label' => null,
                'matrix_right_label' => null,
                'matrix_rows' => null,
                'explanation' => 'Kerjakan perkalian terlebih dahulu: 3×4=12, kemudian tambah 2: 12+2=14',
            ],
            [
                'subject_id' => 1,
                'user_id' => 2,
                'question_type' => 'single_choice',
                'question_text' => 'Berapakah nilai x dari persamaan 2x + 5 = 15?',
                'option_a' => '5',
                'option_b' => '10',
                'option_c' => '7',
                'option_d' => '3',
                'option_e' => null,
                'correct_option' => 'a',
                'correct_options' => null,
                'answer_text' => null,
                'matrix_left_label' => null,
                'matrix_right_label' => null,
                'matrix_rows' => null,
                'explanation' => '2x = 15-5 = 10 → x=5',
            ],
            [
                'subject_id' => 1,
                'user_id' => 2,
                'question_type' => 'multiple_choice',
                'question_text' => 'Bilangan prima di bawah 10 adalah ...',
                'option_a' => '2',
                'option_b' => '3',
                'option_c' => '4',
                'option_d' => '5',
                'option_e' => '6',
                'correct_option' => null,
                'correct_options' => ['a', 'b', 'd'],
                'answer_text' => null,
                'matrix_left_label' => null,
                'matrix_right_label' => null,
                'matrix_rows' => null,
                'explanation' => 'Bilangan prima di bawah 10 adalah 2, 3, 5, dan 7. Dari opsi yang tersedia, yang benar adalah 2, 3, dan 5.',
            ],
            // Fisika
            [
                'subject_id' => 2,
                'user_id' => 2,
                'question_type' => 'single_choice',
                'question_text' => 'Apa satuan gaya dalam SI?',
                'option_a' => 'Joule',
                'option_b' => 'Newton',
                'option_c' => 'Watt',
                'option_d' => 'Pascal',
                'option_e' => null,
                'correct_option' => 'b',
                'correct_options' => null,
                'answer_text' => null,
                'matrix_left_label' => null,
                'matrix_right_label' => null,
                'matrix_rows' => null,
                'explanation' => 'Satuan gaya adalah Newton (N)',
            ],
            // Biologi
            [
                'subject_id' => 4,
                'user_id' => 2,
                'question_type' => 'matrix_binary',
                'question_text' => 'Perhatikan pernyataan tentang organel sel berikut.',
                'option_a' => null,
                'option_b' => null,
                'option_c' => null,
                'option_d' => null,
                'option_e' => null,
                'correct_option' => null,
                'correct_options' => null,
                'answer_text' => null,
                'matrix_left_label' => 'Benar',
                'matrix_right_label' => 'Salah',
                'matrix_rows' => [
                    ['statement' => 'Nukleus mengatur aktivitas sel.', 'correct_answer' => 'left'],
                    ['statement' => 'Mitokondria adalah inti sel.', 'correct_answer' => 'right'],
                    ['statement' => 'Ribosom berperan dalam sintesis protein.', 'correct_answer' => 'left'],
                ],
                'explanation' => 'Nukleus mengatur aktivitas sel, mitokondria bukan inti sel, dan ribosom berperan dalam sintesis protein.',
            ],
        ];

        foreach ($questions as $question) {
            \App\Models\Question::create($question);
        }
    }
}
