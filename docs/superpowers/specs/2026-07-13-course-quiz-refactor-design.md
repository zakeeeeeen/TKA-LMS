# Course + Quiz Refactor Design

Tanggal: 2026-07-13

## Ringkasan

Sistem LMS saat ini masih berpusat pada `Question Package -> Exam -> Result`. Struktur ini terasa kurang natural untuk pembelajaran mandiri karena:

- user tidak memahami peran `Exam`
- `Question Package` secara praktik diperlakukan sebagai quiz
- quiz aktif diharapkan bisa dikerjakan kapan saja, tidak harus serentak
- nantinya beberapa quiz perlu dikelompokkan ke dalam `Course`

Desain baru memindahkan model sistem menjadi:

- `Question Bank` sebagai gudang soal
- `Quiz` sebagai kumpulan soal
- `Course` sebagai kumpulan materi dan quiz
- `Quiz Attempt` sebagai hasil pengerjaan siswa per quiz per course

`Exam` dipensiunkan dari flow user dan secara bertahap dihapus dari backend.

## Tujuan

- Mengganti konsep `Question Package` menjadi `Quiz`
- Menghapus kebutuhan konsep `Exam`
- Menambahkan `Course` yang dapat berisi banyak materi dan banyak quiz
- Mengizinkan satu `Quiz` digunakan di banyak `Course`
- Menyimpan hasil pengerjaan siswa secara terpisah per `Course`
- Mempertahankan flow hasil nilai, pembahasan, dan AI discussion

## Non-Tujuan

- Tidak membangun live class atau pengerjaan serentak
- Tidak membangun enrollment kompleks di tahap awal
- Tidak memigrasikan semua histori exam lama ke struktur baru di hari pertama
- Tidak mengubah question bank dasar selain penyesuaian istilah dan relasi

## Keputusan Utama

### 1. Konsep domain

- `Question Package` diubah menjadi `Quiz`
- `Exam` dihapus dari experience user
- `Course` menjadi wadah utama pembelajaran
- `Course` dapat berisi:
  - banyak `Materi`
  - banyak `Quiz`
- satu `Quiz` boleh masuk ke banyak `Course`
- hasil siswa untuk quiz yang sama harus tetap terpisah per course

### 2. Flow siswa

Siswa akan:

1. melihat daftar course
2. membuka detail course
3. membaca materi yang tersedia
4. mengerjakan quiz aktif di dalam course
5. setelah submit langsung melihat nilai ringkas
6. membuka halaman pembahasan
7. menggunakan `Bahas dengan AI` dan chat lanjutan bila diperlukan

### 3. Flow admin/guru

Admin/guru akan:

1. membuat soal di `Question Bank`
2. memilih soal dan memasukkannya ke `Quiz`
3. membuat `Course`
4. menambahkan `Materi` ke `Course`
5. memasukkan satu atau lebih `Quiz` ke `Course`
6. mengatur urutan materi dan quiz di dalam course
7. mengaktifkan quiz/course sesuai kebutuhan

## Model Data

### Tabel baru

#### `courses`

- `id`
- `user_id`
- `name`
- `description`
- `thumbnail` nullable
- `active` boolean
- timestamps

#### `course_materials`

- `id`
- `course_id`
- `title`
- `content`
- `position`
- `is_published` boolean
- timestamps

#### `course_quiz`

- `id`
- `course_id`
- `quiz_id`
- `position`
- timestamps

Pivot ini dipakai karena satu quiz boleh masuk banyak course.

#### `quiz_attempts`

- `id`
- `user_id`
- `course_id`
- `quiz_id`
- `score`
- `total_correct`
- `total_wrong`
- `total_empty`
- `started_at`
- `finished_at`
- timestamps

Penyimpanan `course_id` di tabel ini wajib agar hasil quiz yang sama tetap terpisah antar course.

#### `quiz_answers`

- `id`
- `quiz_attempt_id`
- `question_id`
- `selected_option` nullable
- `answer_text` nullable
- `is_correct` boolean nullable
- `is_marked` boolean
- timestamps

### Tabel yang dipertahankan tetapi berubah konsep

#### `question_packages`

Pada tahap transisi, tabel ini tetap dipakai sebagai basis data `Quiz`.

Field yang tetap relevan:

- `name`
- `duration`
- `total_questions`
- `min_score`
- `shuffle_questions`
- `shuffle_options`
- `active`
- `description`

Strategi implementasi awal:

- backend model boleh tetap memakai tabel lama untuk menghindari migrasi data berat
- di UI dan route, istilah yang tampil ke user diubah menjadi `Quiz`
- rename fisik tabel dapat dilakukan belakangan bila diperlukan

### Tabel yang dipensiunkan

#### `exams`

Tidak lagi menjadi bagian dari flow utama.

#### `exam_answers`

Diganti oleh `quiz_answers`.

#### `exam_results`

Diganti oleh `quiz_attempts`.

## Relasi

- `Course` many-to-many `Quiz`
- `Course` has-many `CourseMaterial`
- `Quiz` belongs-to-many `Course`
- `Quiz` belongs-to-many `Question`
- `QuizAttempt` belongs-to `User`
- `QuizAttempt` belongs-to `Course`
- `QuizAttempt` belongs-to `Quiz`
- `QuizAttempt` has-many `QuizAnswer`
- `QuizAnswer` belongs-to `QuizAttempt`
- `QuizAnswer` belongs-to `Question`

## UX dan Navigasi

### Menu admin/guru

Menu akhir yang diinginkan:

- Dashboard
- Users
- Subjects
- Chapters
- Question Bank
- Quiz
- Courses
- Results
- Statistics
- Settings

Menu `Exams` dihapus.

### Dashboard siswa

Dashboard siswa diubah agar berfokus pada:

- daftar course
- quiz aktif terbaru
- riwayat hasil quiz terbaru

### Detail course

Halaman detail course menampilkan:

- informasi course
- daftar materi
- daftar quiz
- urutan konten yang jelas

### Detail quiz

Quiz dikerjakan secara mandiri kapan saja selama aktif.

Tidak ada:

- jadwal serentak
- keterikatan ke peserta lain
- kebutuhan membuat sesi exam bersama

## Hasil dan Pembahasan

Setelah siswa submit quiz:

1. tampil halaman ringkasan nilai
2. tampil tombol `Lihat Pembahasan`
3. halaman pembahasan menampilkan:
   - soal
   - jawaban siswa
   - jawaban benar
   - pembahasan guru
   - `Bahas dengan AI`
   - suggestion follow-up
   - chat lanjutan ke AI

AI discussion harus membaca konteks dari `QuizAttempt` dan `QuizAnswer`, bukan dari `Exam`.

## Strategi Migrasi

### Tahap 1: Rename konsep di UI

- ganti semua label `Question Package` menjadi `Quiz`
- ganti istilah `package aktif` menjadi `quiz aktif`
- sembunyikan atau kurangi eksposur `Exam` dari UI

### Tahap 2: Fondasi course

- tambah model, migration, controller, dan halaman:
  - `Course`
  - `CourseMaterial`
  - pivot `CourseQuiz`
- admin dapat membuat course dan memasukkan quiz ke dalam course

### Tahap 3: Flow siswa berbasis course

- tambah daftar course siswa
- tambah halaman detail course
- quiz aktif dikerjakan dari dalam course

### Tahap 4: Ganti engine hasil

- tambah `QuizAttempt`
- tambah `QuizAnswer`
- pindahkan flow submit, nilai, review, dan AI ke struktur baru

### Tahap 5: Pensiunkan exam

- hapus menu `Exams`
- nonaktifkan route/controller exam dari flow utama
- hapus dependensi dashboard/result ke exam
- bersihkan model dan controller lama yang tidak lagi dipakai

## Backward Compatibility

Selama masa transisi:

- data `question_packages` tetap dipakai agar quiz lama tidak hilang
- flow lama berbasis exam boleh tetap hidup sementara untuk menghindari putus total
- UI baru harus mengarahkan penggunaan ke quiz/course flow

Tidak diwajibkan memindahkan histori `exam_results` lama ke `quiz_attempts` pada fase awal.

## Risiko dan Mitigasi

### Risiko 1: Domain campur aduk antara quiz baru dan exam lama

Mitigasi:

- gunakan istilah `Quiz` secara konsisten di UI
- batasi akses user ke flow `Exam`
- fokus implementasi baru langsung ke course dan quiz attempt

### Risiko 2: Quiz yang sama dipakai di banyak course menyebabkan nilai tercampur

Mitigasi:

- `quiz_attempts` wajib menyimpan `course_id`
- seluruh query hasil harus scoped oleh `user_id + course_id + quiz_id`

### Risiko 3: Refactor terlalu besar dan memutus flow yang sudah jalan

Mitigasi:

- implementasi bertahap
- pertahankan tabel/package lama sebagai basis quiz transisi
- hapus exam hanya setelah flow baru stabil

## Rencana Implementasi Tingkat Tinggi

### Gelombang 1

- rename `Question Package` menjadi `Quiz`
- tambah CRUD `Course`
- tambah CRUD `Course Material`
- tambah attach quiz ke course

### Gelombang 2

- buat halaman siswa:
  - daftar course
  - detail course
  - akses quiz dari course

### Gelombang 3

- buat `Quiz Attempt` dan `Quiz Answer`
- pindahkan nilai, review, dan AI discussion ke attempt baru
- hapus peran `Exam`

## Catatan Implementasi

- perubahan harus menjaga desktop tetap stabil bila hanya ada penyesuaian mobile
- tidak menjalankan testing otomatis
- tidak memakai browser tool
- perubahan React/Inertia tetap memerlukan build asset agar terlihat

## Kriteria Selesai

Desain ini dianggap selesai bila:

- user melihat `Quiz`, bukan `Question Package`
- user tidak lagi berinteraksi dengan konsep `Exam`
- course dapat berisi materi dan quiz
- satu quiz bisa dipakai di banyak course
- hasil siswa untuk quiz yang sama tetap terpisah per course
- alur nilai, pembahasan, dan AI tetap berfungsi di flow baru
