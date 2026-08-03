# <p align="center">🎓 TKA-LMS 🎓</p>

<p align="center">
  <strong>Platform Learning Management System (LMS) Modern untuk Persiapan Tes Kemampuan Akademik (TKA)</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-red?style=for-the-badge&logo=laravel" alt="Laravel 12.x">
  <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" alt="React 18.x">
  <img src="https://img.shields.io/badge/Inertia.js-2.0-purple?style=for-the-badge&logo=inertia" alt="Inertia.js 2.0">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x/4.x-38bdf8?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Google_Gemini-Integration-orange?style=for-the-badge&logo=google-gemini" alt="Google Gemini">
</p>

---

## 📌 Tentang TKA-LMS

**TKA-LMS** adalah platform pembelajaran berbasis web (LMS) modern yang dirancang khusus untuk memfasilitasi persiapan **Tes Kemampuan Akademik (TKA)**. Dengan arsitektur SPA (Single Page Application) bertenaga **Laravel 12**, **Inertia.js 2.0**, dan **React**, sistem ini memberikan pengalaman belajar yang mulus, responsif, dan interaktif seperti aplikasi desktop (native-like).

Platform ini dilengkapi dengan teknologi **Kecerdasan Buatan (AI)** melalui integrasi **Google Gemini API** yang bertindak sebagai tutor pribadi siswa untuk menjelaskan pembahasan soal secara mendalam dan interaktif.

---

## 🚀 Fitur Utama

### 👥 1. Sistem Multi-Role (RBAC)
*   **Admin**: Manajemen pengguna, konfigurasi global aplikasi, laporan statistik, dan pengaturan situs.
*   **Guru**: Pembuat materi, bank soal, paket kuis/ujian, verifikasi pendaftaran kursus siswa, serta pemantau hasil ujian siswa.
*   **Siswa**: Mengikuti kursus, membaca materi, mengerjakan kuis/ujian, melihat statistik belajar, serta berinteraksi dengan AI Tutor.

### 📝 2. Bank Soal & Variasi Soal Lanjutan
*   Mendukung format **Pilihan Ganda (sampai 5 opsi: A - E)** lengkap dengan dukungan gambar pada soal maupun pilihan jawaban.
*   Mendukung format **Soal Matriks** (mencocokkan baris dengan label kiri/kanan).
*   Mendukung **Multi-correct Options** (jawaban benar lebih dari satu).
*   **Formula Matematika (KaTeX)** & Editor teks kaya (Rich Text) terintegrasi menggunakan **TipTap Editor**.

### 📥 3. Impor Soal Massal via Excel
*   Mengunggah ratusan soal sekaligus menggunakan file template Excel yang telah disediakan:
    *   `template-import-soal.xls` (Pilihan Ganda standar)
    *   `template-soal.xls` (Template Kuis)
    *   `form-soal-ganda (1).xls` (Form khusus guru)

### 🤖 4. AI Learning Companion (Tutor Pintar)
*   **Tutor AI (Tanya Pembahasan)**: Ketika melihat hasil ujian, siswa dapat mengobrol langsung dengan AI tentang soal tertentu. AI akan menganalisis jawaban siswa, memberikan pembahasan langkah demi langkah, dan memberikan tips cepat dalam bahasa Indonesia yang ramah.
*   **WAHO Chatbot**: Asisten AI resmi berwajah ceria di platform yang membantu siswa menjawab berbagai pertanyaan umum seputar tips belajar, navigasi platform, dan materi.

### 📚 5. Manajemen Kursus & Materi Dinamis
*   Pengelompokan konten materi pembelajaran secara rapi berdasarkan kategori/bab.
*   Materi dapat berupa teks interaktif, unggahan file (PDF/Dokumen), atau tautan eksternal.
*   Sistem pendaftaran kursus (*enrollment request*) dengan verifikasi dari guru atau admin.

### ⚙️ 6. Pengaturan Situs & Autentikasi Google
*   Ubah nama aplikasi, logo, deskripsi SEO, dan kunci API Gemini langsung lewat dashboard admin.
*   Login cepat sekali klik menggunakan **Google Sign-In (Socialite)**.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Backend** | ![PHP](https://img.shields.io/badge/PHP-8.2%2B-777bb4?style=flat&logo=php) | Pemrosesan logika utama server |
| **Framework** | ![Laravel](https://img.shields.io/badge/Laravel-12.x-F05340?style=flat&logo=laravel) | Kerangka kerja PHP modern & aman |
| **Frontend Bridge**| ![InertiaJS](https://img.shields.io/badge/InertiaJS-2.0-8266ff?style=flat&logo=inertia) | Jembatan SPA tanpa membangun REST API terpisah |
| **Frontend UI** | ![React](https://img.shields.io/badge/React-18.x-61dafb?style=flat&logo=react) | Pembuatan antarmuka yang reaktif |
| **Styling** | ![Tailwind](https://img.shields.io/badge/TailwindCSS-v3/v4-38bdf8?style=flat&logo=tailwindcss) | Utility-first CSS untuk tampilan modern & responsif |
| **AI Engine** | ![Gemini](https://img.shields.io/badge/Google_Gemini-API-orange?style=flat&logo=google-gemini) | Pemrosesan LLM untuk Tutor AI dan Asisten WAHO |
| **Rich Editor** | ![TipTap](https://img.shields.io/badge/TipTap-Editor-black?style=flat) | Text editor kaya untuk pembuatan soal & materi |
| **Math Render** | ![KaTeX](https://img.shields.io/badge/KaTeX-Math-319795?style=flat) | Render rumus matematika cepat di browser |

---

## ⚙️ Persyaratan Sistem

Sebelum memulai instalasi, pastikan komputer Anda telah memenuhi spesifikasi berikut:
*   **PHP** $\ge$ 8.2 (dengan ekstensi `pdo_sqlite`, `gd`, `zip`, `mbstring`, `xml` aktif)
*   **Composer** $\ge$ 2.x
*   **Node.js** $\ge$ 18.x
*   **PNPM** $\ge$ 9.x (atau npm/yarn)
*   **Redis Server** (Opsional, untuk optimasi cache, session, dan queue di production)

---

## 🚀 Panduan Instalasi & Penggunaan

Ikuti langkah-langkah di bawah ini untuk menjalankan projek di lingkungan lokal Anda:

### 1. Klon Repositori
```bash
git clone https://github.com/zakeeeeeen/TKA-LMS
cd TKA-LMS
```

### 2. Pasang Dependensi PHP & Javascript
```bash
# Instal dependensi composer
composer install

# Instal dependensi frontend menggunakan pnpm (direkomendasikan)
pnpm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file konfigurasi `.env.example` ke `.env`:
```bash
copy .env.example .env
```
Sesuaikan konfigurasi database dan API key di file `.env`. Untuk menggunakan AI Tutor & WAHO Chatbot, pastikan Anda mengisi **Gemini API Key**:
```env
GEMINI_API_KEY=AIzaSyYourActualApiKeyHere
GEMINI_MODEL=gemini-2.5-flash-latest
```

### 4. Setup Database & Seeding
Secara default, projek ini menggunakan **SQLite** (opsi termudah untuk development).
```bash
# Buat file database SQLite kosong jika belum ada
touch database/database.sqlite

# Jalankan migrasi tabel database
php artisan migrate

# Isi database dengan data bawaan (seeder)
php artisan db:seed
```

### 5. Jalankan Aplikasi dalam Mode Development
Projek ini memiliki shortcut perintah `composer dev` yang sangat praktis. Perintah ini secara otomatis menjalankan server Laravel, listener antrean (queue), logging Laravel Pail, dan server bundler Vite secara bersamaan dalam satu baris perintah:
```bash
composer dev
```
Aplikasi Anda sekarang dapat diakses di: **[http://localhost:8000](http://localhost:8000)**.

---

## ⚡ Penggunaan & Konfigurasi Redis (Opsional)

Untuk meningkatkan performa aplikasi (terutama di server produksi/staging), Anda dapat menggunakan **Redis** untuk mengelola cache, session, serta antrean job (queue).

### 1. Prasyarat
Pastikan ekstensi PHP Redis (`phpredis`) telah terpasang di sistem Anda, atau gunakan package `predis/predis` dengan mengubah konfigurasi client di `.env`.

### 2. Konfigurasi Lingkungan (`.env`)
Ubah nilai driver pada `.env` Anda menjadi `redis` seperti berikut:

```env
# Gunakan Redis untuk cache sistem
CACHE_STORE=redis

# Gunakan Redis untuk penyimpanan session user
SESSION_DRIVER=redis

# Gunakan Redis untuk antrean tugas latar belakang (Job Queue)
QUEUE_CONNECTION=redis

# Konfigurasi Koneksi Redis
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 3. Keuntungan Penggunaan Redis di TKA-LMS
*   **Kecepatan Sesi (Session)**: Pengalaman login siswa dan status pengerjaan kuis/ujian tetap terjaga dengan latensi sangat rendah.
*   **Antrean Responsif (Queue)**: Mengirimkan pesan chat AI Tutor atau pemrosesan laporan kuis berat di latar belakang secara asinkron tanpa memperlambat loading halaman siswa.
*   **Caching Optimal**: Mempercepat pemuatan data statistik ujian admin, daftar materi, dan konfigurasi situs.

---

## 🔑 Akun Uji Coba Bawaan (Default Credentials)

Gunakan akun di bawah ini setelah Anda menjalankan perintah `php artisan db:seed`:

| Role | Email | Sandi |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password` |
| **Guru (Pengajar)** | `guru@example.com` | `password` |
| **Siswa (Contoh)** | `siswa1@example.com` | `password` |

*(Tersedia 10 akun siswa otomatis dari `siswa1@example.com` sampai `siswa10@example.com`)*.

---

## 📦 Struktur Folder Penting

Berikut adalah peta folder utama pada TKA-LMS untuk mempermudah navigasi Anda:
*   `app/Http/Controllers/` — Penanganan logika web/routing (AI Chat, Quiz, Kursus, Ujian).
*   `app/Models/` — Model database Eloquent (User, Course, Question, Exam, dll).
*   `database/migrations/` — Struktur skema tabel database.
*   `database/seeders/` — Data demo/bawaan untuk uji coba sistem.
*   `resources/js/` — Komponen React, Halaman SPA (Inertia), dan konfigurasi frontend.
*   `routes/web.php` — Seluruh definisi rute web dengan proteksi middleware Auth.

---

## 📄 Lisensi

Projek ini berbasis open-source di bawah lisensi [MIT License](LICENSE).
