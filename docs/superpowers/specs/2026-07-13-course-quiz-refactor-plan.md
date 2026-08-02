# Course + Quiz Refactor Implementation Plan

Tanggal: 2026-07-13

## Ringkasan

Plan ini menurunkan desain `Course + Quiz Refactor` menjadi urutan implementasi yang aman dan bertahap. Fokus utama:

- mengganti istilah `Question Package` menjadi `Quiz`
- menambahkan `Course` dan `Course Material`
- memindahkan flow siswa ke `Course -> Quiz`
- mengganti engine `Exam` menjadi `Quiz Attempt`
- mempertahankan hasil, pembahasan, dan AI discussion

## Prinsip Eksekusi

- lakukan perubahan bertahap agar flow lama tidak langsung rusak
- prioritaskan perubahan istilah dan struktur navigasi lebih dulu
- gunakan tabel `question_packages` sebagai basis transisi `Quiz`
- hasil quiz yang sama harus terpisah per `course_id`
- `Exam` tidak dihapus total sebelum flow baru benar-benar siap

## Gelombang 1: Rename `Question Package` menjadi `Quiz`

### Tujuan

Menyamakan bahasa sistem dengan konsep yang sudah disepakati user.

### Pekerjaan backend

- audit controller, model, route, dan response inertia yang masih memakai istilah `Question Package`
- pertahankan model/tabel lama untuk sementara, tetapi ubah label dan copy di UI menjadi `Quiz`
- ubah statistik dashboard yang masih menyebut package menjadi quiz

### Pekerjaan frontend

- ganti label sidebar/menu dari `Question Packages` menjadi `Quiz`
- ganti judul halaman, tombol, empty state, form label, dan pesan sukses/error
- ganti istilah `package aktif` menjadi `quiz aktif`

### Hasil akhir gelombang

- user hanya melihat istilah `Quiz`
- secara internal tabel lama masih boleh dipakai

## Gelombang 2: Bangun fondasi `Course`

### Tujuan

Menyediakan wadah pembelajaran yang berisi materi dan quiz.

### Pekerjaan database

Tambah migration:

- `courses`
- `course_materials`
- `course_quiz`

### Pekerjaan backend

Tambah:

- model `Course`
- model `CourseMaterial`
- relasi `Course <-> Quiz`
- controller CRUD `Course`
- controller CRUD `CourseMaterial`
- endpoint attach/detach/reorder quiz di dalam course

### Pekerjaan frontend

Tambah halaman admin/guru:

- daftar course
- create/edit course
- detail/edit course
- manajemen materi di dalam course
- pilih quiz untuk dimasukkan ke course

### Hasil akhir gelombang

- admin dapat membuat course
- admin dapat menambah materi
- admin dapat memasukkan banyak quiz ke banyak course

## Gelombang 3: Flow siswa berbasis `Course`

### Tujuan

Menggeser pintu masuk siswa dari package/exam lama ke course.

### Pekerjaan backend

- tambahkan route daftar course siswa
- tambahkan route detail course siswa
- query course aktif beserta materi dan quiz aktif

### Pekerjaan frontend

Tambah halaman siswa:

- daftar course
- detail course
- daftar materi
- daftar quiz

### Perubahan dashboard

- dashboard siswa menampilkan course aktif
- hilangkan ketergantungan dashboard pada `activePackages`
- tampilkan quiz dari context course

### Hasil akhir gelombang

- siswa masuk dari course, bukan dari exam

## Gelombang 4: Bangun engine `Quiz Attempt`

### Tujuan

Menghapus ketergantungan hasil ke `Exam`.

### Pekerjaan database

Tambah migration:

- `quiz_attempts`
- `quiz_answers`

Opsional tahap lanjutan:

- tambahkan `quiz_attempt_id` ke `ai_question_messages`

### Pekerjaan backend

Tambah:

- model `QuizAttempt`
- model `QuizAnswer`
- controller/flow pengerjaan quiz
- endpoint simpan jawaban
- endpoint submit quiz
- halaman hasil ringkas berbasis `QuizAttempt`
- halaman pembahasan berbasis `QuizAttempt`
- AI discussion membaca `QuizAttempt` dan `QuizAnswer`

### Aturan penting

- scope hasil wajib memakai `user_id + course_id + quiz_id`
- quiz yang sama di dua course tidak boleh berbagi nilai

### Hasil akhir gelombang

- hasil siswa tidak lagi bergantung pada `Exam`

## Gelombang 5: Pensiunkan `Exam`

### Tujuan

Merapikan domain dan menghapus konsep yang tidak lagi dipakai.

### Pekerjaan backend

- hapus atau nonaktifkan route `Exam`
- hapus akses UI ke controller `Exam`
- putuskan relasi dashboard/result yang masih berbasis exam
- audit fallback lama di controller hasil dan AI

### Pekerjaan frontend

- hapus menu `Exams`
- hapus halaman exam lama dari navigasi
- pastikan semua tombol siswa mengarah ke flow course/quiz baru

### Hasil akhir gelombang

- `Exam` tidak lagi muncul di experience user

## Daftar File yang Kemungkinan Tersentuh

### Backend

- `routes/web.php`
- `app/Models/QuestionPackage.php`
- model baru `Course`, `CourseMaterial`, `QuizAttempt`, `QuizAnswer`
- controller `QuestionPackageController` untuk penyesuaian istilah quiz
- controller baru `CourseController`
- controller baru `CourseMaterialController`
- controller hasil/review/AI untuk pindah dari exam ke attempt

### Frontend

- `resources/js/Layouts/AuthenticatedLayout.jsx`
- `resources/js/Pages/Dashboard.jsx`
- `resources/js/Pages/QuestionPackages/*` menjadi tampilan `Quiz`
- halaman baru `resources/js/Pages/Courses/*`
- halaman siswa untuk course detail dan pengerjaan quiz
- halaman hasil dan pembahasan

## Risiko Implementasi

### Risiko 1

Istilah `Quiz` di UI tetapi backend masih bercampur dengan `QuestionPackage`.

Mitigasi:

- konsisten rename label di satu gelombang penuh
- hindari campuran istilah di halaman yang sama

### Risiko 2

Flow siswa masih nyangkut ke exam lama.

Mitigasi:

- gelombang 3 harus mengganti entry point dashboard siswa
- tambahkan redirect dari route lama bila perlu

### Risiko 3

AI discussion masih membaca `ExamResult`.

Mitigasi:

- pindahkan AI ke `QuizAttempt` saat gelombang 4
- pertahankan fallback hanya sementara

## Urutan Eksekusi Teknis yang Direkomendasikan

1. rename `Question Package` menjadi `Quiz`
2. tambah migration/model/controller `Course`
3. tambah management `Course Material`
4. tambah attach quiz ke course
5. buat halaman siswa daftar/detail course
6. buat migration/model/controller `QuizAttempt`
7. pindahkan result/review/AI ke `QuizAttempt`
8. hapus `Exam` dari navigasi dan flow utama

## Definition of Done

Plan ini dianggap selesai bila implementasi nanti menghasilkan:

- menu `Quiz` menggantikan `Question Package`
- menu `Courses` tersedia
- course berisi materi dan quiz
- satu quiz bisa dipakai di banyak course
- siswa mengerjakan quiz dari dalam course
- nilai dan pembahasan tersimpan terpisah per course
- `Exam` tidak lagi dipakai oleh user akhir
