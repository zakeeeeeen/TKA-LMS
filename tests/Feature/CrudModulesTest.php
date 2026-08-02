<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\Question;
use App\Models\QuestionPackage;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class CrudModulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_question(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $subject = Subject::create([
            'name' => 'Bahasa Indonesia',
            'description' => 'Pelajaran Bahasa Indonesia',
        ]);

        $response = $this->actingAs($admin)->post(route('questions.store'), [
            'subject_id' => $subject->id,
            'question_type' => 'single_choice',
            'question_text' => 'Antonim dari besar adalah ...',
            'option_a' => 'Tinggi',
            'option_b' => 'Kecil',
            'option_c' => 'Luas',
            'option_d' => 'Banyak',
            'option_e' => 'Sedikit',
            'correct_option' => 'b',
            'explanation' => 'Antonim besar adalah kecil.',
        ]);

        $response->assertRedirect(route('questions.index'));

        $this->assertDatabaseHas('questions', [
            'subject_id' => $subject->id,
            'correct_option' => 'b',
        ]);
    }

    public function test_admin_can_create_a_question_package_with_selected_questions(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $subject = Subject::create([
            'name' => 'Logika',
            'description' => 'Pelajaran Logika',
        ]);

        $questions = Question::insert([
            [
                'subject_id' => $subject->id,
                'user_id' => $admin->id,
                'question_type' => 'single_choice',
                'question_text' => '2 + 2 = ...',
                'option_a' => '3',
                'option_b' => '4',
                'option_c' => '5',
                'option_d' => '6',
                'option_e' => null,
                'correct_option' => 'b',
                'explanation' => 'Hasil penjumlahan adalah 4.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'subject_id' => $subject->id,
                'user_id' => $admin->id,
                'question_type' => 'single_choice',
                'question_text' => '3 x 3 = ...',
                'option_a' => '6',
                'option_b' => '8',
                'option_c' => '9',
                'option_d' => '12',
                'option_e' => null,
                'correct_option' => 'c',
                'explanation' => 'Hasil perkalian adalah 9.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $questionIds = Question::pluck('id')->all();

        $response = $this->actingAs($admin)->post(route('question-packages.store'), [
            'name' => 'Try Out Logika',
            'description' => 'Paket latihan logika',
            'duration' => 75,
            'min_score' => 70,
            'shuffle_questions' => true,
            'shuffle_options' => true,
            'active' => true,
            'question_ids' => $questionIds,
        ]);

        $response->assertRedirect(route('question-packages.index'));

        $package = QuestionPackage::first();

        $this->assertNotNull($package);
        $this->assertSame(2, $package->total_questions);
        $this->assertTrue($package->shuffle_questions);
        $this->assertTrue($package->shuffle_options);
        $this->assertTrue($package->active);
        $this->assertCount(2, $package->questions);
    }

    public function test_admin_can_create_an_exam_and_assign_students(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $studentA = User::factory()->create([
            'role' => 'siswa',
            'email_verified_at' => now(),
        ]);

        $studentB = User::factory()->create([
            'role' => 'siswa',
            'email_verified_at' => now(),
        ]);

        $package = QuestionPackage::create([
            'user_id' => $admin->id,
            'name' => 'Try Out TKA',
            'duration' => 90,
            'total_questions' => 30,
            'min_score' => 70,
            'shuffle_questions' => true,
            'shuffle_options' => true,
            'active' => true,
            'description' => 'Paket try out',
        ]);

        $startTime = '2026-07-12 08:00:00';

        $response = $this->actingAs($admin)->post(route('exams.store'), [
            'name' => 'Ujian TKA Gelombang 1',
            'question_package_id' => $package->id,
            'start_time' => $startTime,
            'duration' => 90,
            'status' => 'not_started',
            'student_ids' => [$studentA->id, $studentB->id],
        ]);

        $response->assertRedirect(route('exams.index'));

        $exam = Exam::with('students')->first();

        $this->assertNotNull($exam);
        $this->assertSame('Ujian TKA Gelombang 1', $exam->name);
        $this->assertSame(90, $exam->duration);
        $this->assertSame('not_started', $exam->status);
        $this->assertTrue($exam->end_time->equalTo(Carbon::parse($startTime)->addMinutes(90)));
        $this->assertCount(2, $exam->students);
    }
}
