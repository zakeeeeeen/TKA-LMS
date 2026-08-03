@php
    $defaults = [
        'site_title' => 'TKA LMS - Tes Kemampuan Akademik',
        'site_description' => 'Platform simulasi ujian & latihan soal terintegrasi untuk SD, SMP, dan SMA dengan pembahasan AI.',
        'favicon_image' => '/icon.png',
        'og_image' => '/icon.png',
        'seo_keywords' => 'TKA LMS, Tryout SD, Tryout SMP, Tryout SMA, Simulasi Ujian, Pembahasan AI',
        'seo_author' => 'TKA LMS Team',
    ];
    $dbSettings = \App\Models\Setting::pluck('value', 'key')->all();
    $s = array_merge($defaults, $dbSettings);

    $faviconUrl = asset($s['favicon_image'] ?? '/icon.png');
    $ogImageUrl = asset($s['og_image'] ?? $s['favicon_image'] ?? '/icon.png');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" translate="no" class="notranslate">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="google" content="notranslate">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ $s['site_title'] }}</title>
        <meta name="description" content="{{ $s['site_description'] }}">
        <meta name="keywords" content="{{ $s['seo_keywords'] }}">
        <meta name="author" content="{{ $s['seo_author'] }}">

        <!-- Open Graph / WhatsApp / Facebook / LinkedIn -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ $s['site_title'] }}">
        <meta property="og:description" content="{{ $s['site_description'] }}">
        <meta property="og:image" content="{{ $ogImageUrl }}">
        <meta property="og:image:secure_url" content="{{ $ogImageUrl }}">
        <meta property="og:site_name" content="{{ $s['site_title'] }}">

        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $s['site_title'] }}">
        <meta name="twitter:description" content="{{ $s['site_description'] }}">
        <meta name="twitter:image" content="{{ $ogImageUrl }}">

        <!-- Favicon / Icon -->
        <link rel="icon" type="image/png" href="{{ $faviconUrl }}">
        <link rel="apple-touch-icon" href="{{ $faviconUrl }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
