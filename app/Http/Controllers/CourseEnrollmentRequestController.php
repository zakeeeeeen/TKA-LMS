<?php

namespace App\Http\Controllers;

use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseEnrollmentRequestController extends Controller
{
    private function ensureCanManage(): void
    {
        abort_unless(in_array(auth()->user()?->role, ['admin', 'guru'], true), 403);
    }

    public function index()
    {
        $this->ensureCanManage();

        $requests = CourseEnrollment::query()
            ->where('status', 'pending')
            ->with([
                'course:id,name',
                'user:id,name,email',
            ])
            ->latest('requested_at')
            ->latest('id')
            ->get()
            ->map(function (CourseEnrollment $enrollment) {
                return [
                    'id' => $enrollment->id,
                    'requested_at' => $enrollment->requested_at,
                    'course' => [
                        'id' => $enrollment->course?->id,
                        'name' => $enrollment->course?->name,
                    ],
                    'user' => [
                        'id' => $enrollment->user?->id,
                        'name' => $enrollment->user?->name,
                        'email' => $enrollment->user?->email,
                    ],
                ];
            })
            ->values();

        return Inertia::render('CourseEnrollmentRequests/Index', [
            'requests' => $requests,
        ]);
    }

    public function approve(CourseEnrollment $courseEnrollment)
    {
        $this->ensureCanManage();

        $courseEnrollment->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        return redirect()
            ->route('course-enrollment-requests.index')
            ->with('success', 'Permintaan berhasil disetujui.');
    }

    public function reject(CourseEnrollment $courseEnrollment)
    {
        $this->ensureCanManage();

        $courseEnrollment->update([
            'status' => 'rejected',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        return redirect()
            ->route('course-enrollment-requests.index')
            ->with('success', 'Permintaan berhasil ditolak.');
    }
}

