<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = \App\Models\Question::all();
        $guru = \App\Models\User::where('role', 'guru')->first();
        
        $pkg = \App\Models\QuestionPackage::create([
            'user_id' => $guru->id,
            'name' => 'Try Out TKA 1',
            'description' => 'Try Out Tes Kemampuan Akademik 1',
            'duration' => 60,
            'total_questions' => $questions->count(),
            'min_score' => 70,
            'shuffle_questions' => true,
            'shuffle_options' => true,
            'active' => true,
        ]);
        
        $pkg->questions()->sync($questions->pluck('id'));
    }
}
