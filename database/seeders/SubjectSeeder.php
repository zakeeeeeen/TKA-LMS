<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            ['name' => 'Matematika', 'description' => 'Ilmu tentang bilangan dan operasinya'],
            ['name' => 'Fisika', 'description' => 'Ilmu tentang alam dan fenomenanya'],
            ['name' => 'Kimia', 'description' => 'Ilmu tentang zat dan perubahannya'],
            ['name' => 'Biologi', 'description' => 'Ilmu tentang makhluk hidup'],
            ['name' => 'Bahasa Indonesia', 'description' => 'Ilmu tentang bahasa Indonesia'],
            ['name' => 'Bahasa Inggris', 'description' => 'Ilmu tentang bahasa Inggris'],
            ['name' => 'Ekonomi', 'description' => 'Ilmu tentang kegiatan ekonomi'],
            ['name' => 'Geografi', 'description' => 'Ilmu tentang bumi dan isinya'],
        ];

        foreach ($subjects as $subject) {
            \App\Models\Subject::create($subject);
        }
    }
}
