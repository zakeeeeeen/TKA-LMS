<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseContentGroup;
use App\Models\CourseMaterial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterialController extends Controller
{
    private function ensureCanManage(): void
    {
        abort_unless(in_array(auth()->user()?->role, ['admin', 'guru'], true), 403);
    }

    public function index()
    {
        $this->ensureCanManage();

        $materials = CourseMaterial::with('course')
            ->orderBy('created_at', 'desc')
            ->get();
        
        $courses = Course::orderBy('name')->get(['id', 'name']);
        $groups = CourseContentGroup::orderBy('course_id')->orderBy('position')->get(['id', 'course_id', 'name', 'position']);

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
            'courses' => $courses,
            'groups' => $groups,
        ]);
    }

    public function create()
    {
        $this->ensureCanManage();

        $courses = Course::orderBy('name')->get(['id', 'name']);
        $groups = CourseContentGroup::orderBy('course_id')->orderBy('position')->get(['id', 'course_id', 'name', 'position']);

        return Inertia::render('Materials/Create', [
            'courses' => $courses,
            'groups' => $groups,
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'course_id' => 'nullable|exists:courses,id',
            'group_id' => 'nullable|exists:course_content_groups,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'link_url' => 'nullable|url|max:1000',
            'file' => 'nullable|file|max:20480|mimes:pdf,ppt,pptx,doc,docx',
            'is_published' => 'nullable|boolean',
        ]);

        $groupId = null;
        $courseId = $validated['course_id'] ?? null;

        if ($courseId && !empty($validated['group_id'])) {
            $group = CourseContentGroup::where('id', $validated['group_id'])
                ->where('course_id', $courseId)
                ->first();
            if ($group) {
                $groupId = $group->id;
            }
        }

        $nextPosition = 1;
        if ($courseId && $groupId) {
            $nextPosition = (int) CourseMaterial::where('course_id', $courseId)
                ->where('group_id', $groupId)
                ->max('position') + 1;
        }

        $materialData = [
            'course_id' => $courseId,
            'group_id' => $groupId,
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'link_url' => $validated['link_url'] ?? null,
            'position' => $nextPosition,
            'is_published' => (bool) ($validated['is_published'] ?? true),
        ];

        if ($request->hasFile('file')) {
            $materialData['file_path'] = $request->file('file')->store('course_materials', 'public');
            $materialData['file_type'] = $request->file('file')->getClientMimeType();
        }

        CourseMaterial::create($materialData);

        return redirect()->route('materials.index')->with('success', 'Materi berhasil ditambahkan ke Bank Materi.');
    }

    public function edit(CourseMaterial $material)
    {
        $this->ensureCanManage();

        $courses = Course::orderBy('name')->get(['id', 'name']);
        $groups = CourseContentGroup::orderBy('course_id')->orderBy('position')->get(['id', 'course_id', 'name', 'position']);

        return Inertia::render('Materials/Edit', [
            'material' => $material,
            'courses' => $courses,
            'groups' => $groups,
        ]);
    }

    public function show(CourseMaterial $material)
    {
        $this->ensureCanManage();

        $material->load('course');

        if ($material->course) {
            return redirect()->route('courses.materials.show', [$material->course, $material]);
        }

        return redirect()->route('materials.index');
    }

    public function update(Request $request, CourseMaterial $material)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'course_id' => 'nullable|exists:courses,id',
            'group_id' => 'nullable|exists:course_content_groups,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'link_url' => 'nullable|url|max:1000',
            'file' => 'nullable|file|max:20480|mimes:pdf,ppt,pptx,doc,docx',
            'is_published' => 'nullable|boolean',
        ]);

        $courseId = $validated['course_id'] ?? null;
        $groupId = null;

        if ($courseId && !empty($validated['group_id'])) {
            $group = CourseContentGroup::where('id', $validated['group_id'])
                ->where('course_id', $courseId)
                ->first();
            if ($group) {
                $groupId = $group->id;
            }
        }

        $position = $material->position;
        if ($courseId && $groupId && ($material->course_id !== (int) $courseId || (int) $material->group_id !== (int) $groupId)) {
            $position = (int) CourseMaterial::where('course_id', $courseId)
                ->where('group_id', $groupId)
                ->max('position') + 1;
        }

        $updateData = [
            'course_id' => $validated['course_id'],
            'group_id' => $groupId,
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'link_url' => $validated['link_url'] ?? null,
            'is_published' => (bool) ($validated['is_published'] ?? false),
            'position' => $position,
            'file_path' => $material->file_path,
            'file_type' => $material->file_type,
        ];

        if ($request->hasFile('file')) {
            $updateData['file_path'] = $request->file('file')->store('course_materials', 'public');
            $updateData['file_type'] = $request->file('file')->getClientMimeType();
        }

        $material->update($updateData);

        return redirect()->route('materials.index')->with('success', 'Materi berhasil diperbarui.');
    }

    public function destroy(CourseMaterial $material)
    {
        $this->ensureCanManage();

        $material->delete();

        return redirect()->route('materials.index')->with('success', 'Materi berhasil dihapus.');
    }

    public function bulkMove(Request $request)
    {
        $this->ensureCanManage();

        $validated = $request->validate([
            'material_ids' => 'required|array',
            'material_ids.*' => 'exists:course_materials,id',
            'course_id' => 'required|exists:courses,id',
            'group_id' => 'required|exists:course_content_groups,id',
        ]);

        $group = CourseContentGroup::where('id', $validated['group_id'])
            ->where('course_id', $validated['course_id'])
            ->first();
        abort_unless($group, 422);

        $currentMax = (int) CourseMaterial::where('course_id', $validated['course_id'])
            ->where('group_id', $group->id)
            ->max('position');

        foreach ($validated['material_ids'] as $index => $materialId) {
            $material = CourseMaterial::findOrFail($materialId);
            $newPosition = $currentMax + $index + 1;
            
            $material->update([
                'course_id' => $validated['course_id'],
                'group_id' => $group->id,
                'position' => $newPosition,
            ]);
        }

        $targetCourse = Course::findOrFail($validated['course_id']);

        return redirect()
            ->route('materials.index')
            ->with('success', "Materi berhasil dipindahkan ke kursus: {$targetCourse->name}.");
    }
}
