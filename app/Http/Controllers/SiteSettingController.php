<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SiteSettingController extends Controller
{
    private function ensureAdmin(): void
    {
        abort_unless(auth()->user()?->role === 'admin', 403);
    }

    public function edit()
    {
        $this->ensureAdmin();

        $defaults = [
            'site_title' => 'TKA LMS - Tes Kemampuan Akademik',
            'site_description' => 'Platform simulasi ujian & latihan soal terintegrasi untuk SD, SMP, dan SMA dengan pembahasan AI.',
            'hero_badge' => '💡 AI-Powered Learning Platform TKA',
            'hero_title' => 'Tingkatkan Kemampuan Akademikmu Bersama',
            'hero_subtitle' => 'Platform simulasi ujian & latihan soal terintegrasi untuk SD, SMP, dan SMA. Dilengkapi analisis hasil mendalam serta pembahasan cerdas berbasis AI.',
            'hero_image' => '/murid.png',
            'favicon_image' => '/icon.png',
            'seo_keywords' => 'TKA LMS, Tryout SD, Tryout SMP, Tryout SMA, Simulasi Ujian, Pembahasan AI',
            'seo_author' => 'TKA LMS Team',
            'iconify_script' => '<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>',
        ];

        $settings = Setting::pluck('value', 'key')->all();
        $merged = array_merge($defaults, $settings);

        return Inertia::render('Admin/Settings/Edit', [
            'settings' => $merged,
        ]);
    }

    public function update(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'site_title' => 'nullable|string|max:255',
            'site_description' => 'nullable|string|max:1000',
            'hero_badge' => 'nullable|string|max:255',
            'hero_title' => 'nullable|string|max:255',
            'hero_subtitle' => 'nullable|string|max:1000',
            'seo_keywords' => 'nullable|string|max:500',
            'seo_author' => 'nullable|string|max:255',
            'iconify_script' => 'nullable|string|max:1000',
            'hero_image_file' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:5120',
            'favicon_image_file' => 'nullable|image|mimes:png,ico,svg|max:2048',
        ]);

        // Text settings
        $keys = [
            'site_title',
            'site_description',
            'hero_badge',
            'hero_title',
            'hero_subtitle',
            'seo_keywords',
            'seo_author',
            'iconify_script',
        ];

        foreach ($keys as $key) {
            if ($request->has($key)) {
                Setting::set($key, $request->input($key));
            }
        }

        // Handle Image Uploads
        if ($request->hasFile('hero_image_file')) {
            $path = $request->file('hero_image_file')->store('settings', 'public');
            Setting::set('hero_image', Storage::url($path));
        }

        if ($request->hasFile('favicon_image_file')) {
            $path = $request->file('favicon_image_file')->store('settings', 'public');
            Setting::set('favicon_image', Storage::url($path));
        }

        return redirect()->back()->with('success', 'Pengaturan situs berhasil disimpan.');
    }
}
