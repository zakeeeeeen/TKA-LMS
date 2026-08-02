<?php

namespace Tests\Feature;

use App\Http\Controllers\QuestionImportController;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Response;
use Tests\TestCase;

class QuestionImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_page_returns_inertia_response(): void
    {
        $response = app(QuestionImportController::class)->create();

        $this->assertInstanceOf(Response::class, $response);
    }

    public function test_admin_can_import_questions_from_csv(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $csvContent = implode("\n", [
            'subject,question_type,question_text,option_a,option_b,option_c,option_d,option_e,correct_option,correct_options,matrix_left_label,matrix_right_label,matrix_statement_1,matrix_answer_1,matrix_statement_2,matrix_answer_2,matrix_statement_3,matrix_answer_3,explanation',
            '"Matematika","single_choice","Jika 2 + 3 x 4 = ...","14","20","24","12","10","a","","","","","","","","","","Perkalian didahulukan lalu penjumlahan."',
            '"Bahasa Indonesia","multiple_choice","Sinonim kata indah adalah ...","buruk","cantik","elok","cepat","","","b|c","","","","","","","","","Sinonim indah adalah cantik dan elok."',
        ]);

        $file = UploadedFile::fake()->createWithContent('questions.csv', $csvContent);

        $response = $this->actingAs($admin)->post(route('questions.import.store'), [
            'file' => $file,
        ]);

        $response->assertRedirect(route('questions.index'));

        $this->assertDatabaseHas('subjects', [
            'name' => 'Matematika',
        ]);

        $this->assertDatabaseHas('questions', [
            'question_text' => 'Jika 2 + 3 x 4 = ...',
            'correct_option' => 'a',
            'user_id' => $admin->id,
        ]);

        $this->assertDatabaseCount('questions', 2);
    }

    public function test_template_can_be_downloaded(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('questions.import.template'));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
