<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create Guru
        User::factory()->create([
            'name' => 'Guru User',
            'email' => 'guru@example.com',
            'password' => bcrypt('password'),
            'role' => 'guru',
        ]);

        // Create 10 Siswa
        for ($i = 1; $i <= 10; $i++) {
            User::factory()->create([
                'name' => "Siswa {$i}",
                'email' => "siswa{$i}@example.com",
                'password' => bcrypt('password'),
                'role' => 'siswa',
            ]);
        }

        // Call other seeders
        $this->call([
            SubjectSeeder::class,
            QuestionSeeder::class,
            QuestionPackageSeeder::class,
            ExamSeeder::class,
        ]);
    }
}
