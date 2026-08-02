<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $package = \App\Models\QuestionPackage::first();
        $students = \App\Models\User::where('role', 'siswa')->get();
        $admin = \App\Models\User::where('role', 'admin')->first();
        
        $exam = \App\Models\Exam::create([
            'name' => 'Try Out TKA Gelombang 1',
            'user_id' => $admin->id,
            'question_package_id' => $package->id,
            'start_time' => now()->addDays(1),
            'end_time' => now()->addDays(1)->addHours(1),
            'duration' => 60,
            'status' => 'not_started',
        ]);
        
        $exam->students()->sync($students->pluck('id'));
    }
}
