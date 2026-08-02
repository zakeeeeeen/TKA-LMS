# Question Image Upload Design

## Tujuan

Menambahkan upload gambar pada soal utama di form `Add Question` dan `Edit Question`, lalu menampilkan gambar tersebut pada halaman pengerjaan soal dan review hasil.

Fitur ini hanya berlaku untuk gambar pada soal utama. Opsi jawaban tidak memiliki gambar.

## Cakupan

- Tambah input file gambar pada form tambah soal.
- Tambah input file gambar pada form edit soal.
- Simpan file gambar ke storage publik Laravel.
- Sediakan URL gambar siap pakai untuk frontend.
- Tampilkan gambar di halaman pengerjaan soal.
- Tampilkan gambar di halaman review hasil.

## Di Luar Cakupan

- Gambar per opsi jawaban.
- Crop, resize manual, editor gambar, atau anotasi.
- Multiple images per soal.

## Data Model

Model `Question` sudah memiliki field `image_path` pada level aplikasi. Implementasi perlu memastikan:

- Kolom `image_path` tersedia pada tabel `questions`.
- Model menyediakan accessor `image_url`.
- URL yang dikirim ke frontend menggunakan path relatif `/storage/...` agar aman terhadap mismatch host.

## Backend

### Validasi

`QuestionController` menambahkan validasi:

- `image`: nullable, image, ukuran dibatasi agar tetap ringan

### Penyimpanan

- File disimpan ke `storage/app/public/questions`
- Path relatif disimpan ke `questions.image_path`
- Saat update:
  - bila admin upload gambar baru, path diganti ke file baru
  - bila tidak upload ulang, gambar lama tetap dipakai

### Payload Frontend

Response create/edit/review/take perlu menyertakan:

- `image_path`
- `image_url`

## Frontend Admin

### Add Question

- Tambah field file `image`
- Area upload mendukung klik, drag-drop, dan paste dari clipboard
- Tambah preview sederhana jika file dipilih
- Submit menggunakan `forceFormData: true`

### Edit Question

- Tampilkan preview gambar yang sudah tersimpan jika ada
- Jika admin memilih file baru, preview berganti ke file baru
- Area upload mendukung klik, drag-drop, dan paste dari clipboard
- Submit menggunakan `forceFormData: true`

## Frontend Siswa

### Take Quiz / Take Exam

- Gambar ditampilkan di bawah teks soal
- Gambar hanya tampil jika `image_url` tersedia
- Ukuran gambar dibatasi agar tetap rapi di desktop dan mobile

### Review Hasil

- Gambar soal tampil pada blok soal sebelum pilihan jawaban / tabel jawaban

## Error Handling

- Jika file bukan gambar atau terlalu besar, tampilkan error validasi biasa di form
- Jika soal tidak punya gambar, UI tetap normal tanpa ruang kosong berlebih
- Jika clipboard tidak berisi gambar, paste diabaikan
- Jika file yang di-drag bukan gambar, file diabaikan

## Keputusan Desain

- Satu soal hanya memiliki satu gambar
- File upload dilakukan melalui storage publik Laravel
- URL gambar dikirim dalam bentuk URL siap tampil, bukan path mentah
- Fitur tidak mengubah struktur tipe soal yang sudah ada
- Sumber gambar yang diterima: file picker, drag-drop, dan clipboard image

## Dampak File

Perubahan utama diperkirakan menyentuh:

- `app/Http/Controllers/QuestionController.php`
- `app/Models/Question.php`
- `resources/js/Pages/Questions/Create.jsx`
- `resources/js/Pages/Questions/Edit.jsx`
- `resources/js/Pages/QuizAttempts/Take.jsx`
- `resources/js/Pages/Exams/Take.jsx`
- `resources/js/Pages/QuizResults/Review.jsx`
- `resources/js/Pages/Results/Review.jsx`
- migration tambahan bila kolom `image_path` belum ada di database

## Implementasi Ringkas

1. Pastikan kolom `image_path` ada di database.
2. Tambah accessor `image_url` pada model.
3. Ubah controller agar menerima upload file.
4. Ubah form admin agar memakai `FormData`.
5. Tampilkan gambar pada halaman pengerjaan dan review.
