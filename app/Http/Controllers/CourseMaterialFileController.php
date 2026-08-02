<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseMaterialFileController extends Controller
{
    public function show(Course $course, CourseMaterial $courseMaterial)
    {
        abort_unless($courseMaterial->course_id === $course->id, 404);

        if (!$courseMaterial->file_path) {
            abort(404);
        }

        $path = storage_path('app/public/' . $courseMaterial->file_path);
        if (!file_exists($path)) {
            abort(404);
        }

        $headers = [
            'Content-Type' => $courseMaterial->file_type,
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"',
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'SAMEORIGIN',
            'X-Download-Options' => 'noopen',
            'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        ];

        return response()->file($path, $headers);
    }
}
