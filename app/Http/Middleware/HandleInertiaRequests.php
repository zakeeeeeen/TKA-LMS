<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $pendingEnrollmentsCount = 0;

        if ($user && in_array($user->role, ['admin', 'guru'], true)) {
            $pendingEnrollmentsCount = \Illuminate\Support\Facades\DB::table('course_enrollments')
                ->where('status', 'pending')
                ->count();
        }

        $defaults = [
            'site_title' => 'TKA LMS - Tes Kemampuan Akademik',
            'site_description' => 'Platform simulasi ujian & latihan soal terintegrasi untuk SD, SMP, dan SMA dengan pembahasan AI.',
            'hero_badge' => 'AI-Powered Learning Platform TKA',
            'hero_title' => 'Tingkatkan Kemampuan Akademikmu Bersama',
            'hero_subtitle' => 'Platform simulasi ujian & latihan soal terintegrasi untuk SD, SMP, dan SMA. Dilengkapi analisis hasil mendalam serta pembahasan cerdas berbasis AI.',
            'hero_image' => '/murid.png',
            'favicon_image' => '/icon.png',
            'og_image' => '/icon.png',
            'seo_keywords' => 'TKA LMS, Tryout SD, Tryout SMP, Tryout SMA, Simulasi Ujian, Pembahasan AI',
            'seo_author' => 'TKA LMS Team',
            'iconify_script' => '<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>',
        ];

        $dbSettings = \App\Models\Setting::pluck('value', 'key')->all();
        $siteSettings = array_merge($defaults, $dbSettings);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'pendingEnrollmentsCount' => $pendingEnrollmentsCount,
            'siteSettings' => $siteSettings,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
