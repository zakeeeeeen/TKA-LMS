<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseMaterial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseMaterialController extends Controller
{
    private function ensureCanManage(): void
    {
        abort_unless(in_array(auth()->user()?->role, ['admin', 'guru'], true), 403);
    }

    public function index(Course $course)
    {
        $this->ensureCanManage();
        
        return Inertia::render('CourseMaterials/Index', [
            'course' => $course->load('materials'),
        ]);
    }

    public function create(Course $course)
    {
        $this->ensureCanManage();
        
        return Inertia::render('CourseMaterials/Create', [
            'course' => $course,
        ]);
    }

    public function store(Request $request, Course $course)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'file' => 'nullable|file|max:20480|mimes:pdf,ppt,pptx,doc,docx', // 20MB max
            'is_published' => 'nullable|boolean',
        ]);

        $nextPosition = ((int) $course->materials()->max('position')) + 1;

        $materialData = [
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'position' => $nextPosition,
            'is_published' => (bool) ($validated['is_published'] ?? true),
        ];

        if ($request->hasFile('file')) {
            $materialData['file_path'] = $request->file('file')->store('course_materials', 'public');
            $materialData['file_type'] = $request->file('file')->getClientMimeType();
        }

        $course->materials()->create($materialData);

        return redirect()
            ->route('courses.materials.index', $course)
            ->with('success', 'Materi berhasil ditambahkan.');
    }

    public function show(Course $course, CourseMaterial $courseMaterial)
    {
        $this->ensureCanManage();
        abort_unless($courseMaterial->course_id === $course->id, 404);
        
        return Inertia::render('CourseMaterials/Show', [
            'course' => $course,
            'material' => $courseMaterial,
        ]);
    }

    public function edit(Course $course, CourseMaterial $courseMaterial)
    {
        $this->ensureCanManage();
        abort_unless($courseMaterial->course_id === $course->id, 404);
        
        return Inertia::render('CourseMaterials/Edit', [
            'course' => $course,
            'material' => $courseMaterial,
        ]);
    }

    public function update(Request $request, Course $course, CourseMaterial $courseMaterial)
    {
        $this->ensureCanManage();
        abort_unless($courseMaterial->course_id === $course->id, 404);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'file' => 'nullable|file|max:20480|mimes:pdf,ppt,pptx,doc,docx',
            'is_published' => 'nullable|boolean',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'file_path' => $courseMaterial->file_path,
            'file_type' => $courseMaterial->file_type,
        ];

        if ($request->hasFile('file')) {
            $updateData['file_path'] = $request->file('file')->store('course_materials', 'public');
            $updateData['file_type'] = $request->file('file')->getClientMimeType();
        }

        $courseMaterial->update($updateData);

        return redirect()
            ->route('courses.materials.index', $course)
            ->with('success', 'Materi berhasil diperbarui.');
    }

    public function move(Request $request, Course $course, CourseMaterial $courseMaterial)
    {
        $this->ensureCanManage();
        abort_unless($courseMaterial->course_id === $course->id, 404);

        $validated = $request->validate([
            'direction' => 'required|in:up,down',
        ]);

        $orderedMaterials = $course->materials()->orderBy('position')->pluck('id')->values()->all();
        $currentIndex = array_search($courseMaterial->id, $orderedMaterials, true);

        if ($currentIndex === false) {
            return redirect()->back();
        }

        $swapIndex = $validated['direction'] === 'up' ? $currentIndex - 1 : $currentIndex + 1;

        if (!isset($orderedMaterials[$swapIndex])) {
            return redirect()->back();
        }

        $swapMaterial = CourseMaterial::find($orderedMaterials[$swapIndex]);
        if ($swapMaterial) {
            $tempPosition = $courseMaterial->position;
            $courseMaterial->update(['position' => $swapMaterial->position]);
            $swapMaterial->update(['position' => $tempPosition]);
        }

        return redirect()->back()->with('success', 'Urutan materi berhasil diperbarui.');
    }

    public function destroy(Course $course, CourseMaterial $courseMaterial)
    {
        $this->ensureCanManage();
        abort_unless($courseMaterial->course_id === $course->id, 404);

        $deletedPosition = $courseMaterial->position;
        $courseMaterial->delete();

        $course->materials()
            ->where('position', '>', $deletedPosition)
            ->decrement('position');

        return redirect()
            ->route('courses.materials.index', $course)
            ->with('success', 'Materi berhasil dihapus.');
    }
}
