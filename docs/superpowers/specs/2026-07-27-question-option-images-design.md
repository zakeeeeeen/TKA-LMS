# Question Option Images Design

## Tujuan

Menambahkan dukungan gambar pada setiap opsi jawaban untuk soal `single_choice` dan `multiple_choice`.

Setiap opsi tetap memiliki teks sebagai isi utama. Gambar bersifat pelengkap visual per opsi.

## Cakupan

- Tambah field gambar untuk opsi `A-E`.
- Tambah preview gambar per opsi pada form `Add Question` dan `Edit Question`.
- Tambah upload gambar per opsi dengan pola yang sama seperti gambar soal utama:
  - klik file picker
  - drag-drop
  - paste dari clipboard
- Simpan file gambar opsi ke storage publik Laravel.
- Kirim URL gambar opsi ke frontend admin, halaman pengerjaan, dan halaman review hasil.
- Tampilkan gambar opsi di UI siswa dan review hasil.

## Di Luar Cakupan

- Gambar untuk tipe `matrix_binary`.
- Gambar lebih dari satu per opsi.
- Crop, editor, anotasi, atau kompresi manual.
- Perubahan model scoring.
- Perubahan format import CSV pada tahap ini.

## Keputusan Desain

- Pendekatan yang dipakai adalah kolom per opsi, bukan JSON atau tabel relasi baru.
- Struktur data mengikuti pola existing `option_a` sampai `option_e`.
- Setiap opsi dapat memiliki:
  - teks opsi
  - gambar opsi
- Jika opsi tidak diisi, gambar opsi untuk key tersebut tidak dipakai.
- Jika opsi diisi tanpa gambar, sistem tetap valid.
- Jika gambar opsi diganti saat edit, file lama untuk opsi tersebut dihapus dari storage publik.

## Perubahan Data Model

Tabel `questions` menambah kolom nullable:

- `option_a_image_path`
- `option_b_image_path`
- `option_c_image_path`
- `option_d_image_path`
- `option_e_image_path`

Model `Question` menambah:

- field fillable untuk semua kolom gambar opsi
- accessor URL siap pakai untuk semua gambar opsi

Disarankan pola accessor mengikuti `image_url` yang sudah ada, misalnya:

- `option_a_image_url`
- `option_b_image_url`
- `option_c_image_url`
- `option_d_image_url`
- `option_e_image_url`

## Backend

### Validasi

`QuestionController` menambah validasi file untuk:

- `option_a_image`
- `option_b_image`
- `option_c_image`
- `option_d_image`
- `option_e_image`

Aturan validasi:

- nullable
- image
- batas ukuran mengikuti gambar soal utama agar konsisten

### Penyimpanan

- Semua file gambar opsi disimpan di `storage/app/public/questions/options`.
- Pada create:
  - jika file gambar opsi ada, simpan path relatif ke kolom yang sesuai
  - jika tidak ada, simpan `null`
- Pada update:
  - jika file baru diunggah, hapus file lama untuk opsi itu lalu simpan file baru
  - jika tidak ada upload baru, pertahankan path lama

### Payload Frontend

Payload form edit, take quiz, take exam, review quiz, dan review legacy result menyertakan:

- `option_a_image_url`
- `option_b_image_url`
- `option_c_image_url`
- `option_d_image_url`
- `option_e_image_url`

Path mentah tidak perlu dipakai langsung di frontend.

## Frontend Admin

### Form Add Question

Untuk soal `single_choice` dan `multiple_choice`:

- Di bawah setiap input teks opsi, tampilkan area upload gambar kecil.
- Area upload memakai komponen reusable yang sama pola interaksinya dengan gambar soal utama.
- Tiap opsi menampilkan:
  - status nama file bila ada
  - preview gambar bila ada
  - error validasi per opsi bila ada

Untuk soal `matrix_binary`:

- Upload gambar opsi tidak ditampilkan.

### Form Edit Question

Untuk soal `single_choice` dan `multiple_choice`:

- Jika opsi sudah punya gambar tersimpan, preview tampil dari URL lama.
- Jika user memilih gambar baru, preview langsung berganti ke file baru.
- Jika teks opsi dikosongkan, implementasi perlu menetapkan apakah gambar ikut dibersihkan agar data tetap konsisten.

## Aturan Konsistensi Data

Aturan yang dipakai:

- Opsi tanpa teks dianggap tidak aktif.
- Gambar untuk opsi tanpa teks tidak boleh ikut dianggap aktif di UI siswa.
- Saat payload disiapkan, opsi aktif tetap ditentukan dari field teks opsi.
- Exact match scoring tetap berbasis key opsi (`a-e`), tidak dipengaruhi oleh gambar.

Untuk edit data:

- Bila admin mengosongkan teks suatu opsi, sistem sebaiknya juga mengosongkan path gambar opsi tersebut agar tidak menyisakan file yatim pada data aktif.
- Bila implementasi ini diterapkan, file gambar lama untuk opsi tersebut juga dihapus dari storage.

## Frontend Siswa

### Take Quiz / Take Exam

Untuk soal `single_choice` dan `multiple_choice`:

- Setiap opsi menampilkan teks seperti sekarang.
- Jika URL gambar opsi tersedia, tampilkan gambar di bawah teks opsi.
- Layout opsi tetap berbentuk list/baris, bukan kartu visual besar.
- Gambar dibatasi ukurannya agar tidak merusak ritme baca di desktop maupun mobile.

## Review Hasil

Pada halaman review:

- Setiap opsi tetap tampil seperti sekarang.
- Jika opsi memiliki gambar, gambar ditampilkan bersama opsi tersebut.
- Status jawaban benar/salah tetap memakai penanda yang sudah ada.

## Komponen Frontend

Disarankan membuat komponen reusable khusus untuk upload gambar opsi, dengan dua pilihan pendekatan:

### Pendekatan A

Perluas komponen `QuestionImageUpload` agar bisa dipakai untuk gambar soal utama maupun gambar opsi melalui props label dan ukuran tampilan.

### Pendekatan B

Buat wrapper tipis untuk opsi, misalnya `QuestionOptionImageUpload`, yang menggunakan perilaku inti yang sama tetapi dengan label dan styling yang lebih ringkas.

Rekomendasi:

- Gunakan Pendekatan A bila ingin meminimalkan duplikasi logika klik, drag-drop, paste, dan preview.

## Error Handling

- Jika file bukan gambar, tampilkan error validasi pada opsi terkait.
- Jika ukuran file melebihi batas, tampilkan error validasi pada opsi terkait.
- Jika clipboard tidak berisi gambar, aksi paste diabaikan.
- Jika file drag-drop bukan gambar, file diabaikan.
- Jika opsi tidak memiliki gambar, UI tetap normal tanpa ruang kosong.

## Dampak File

Perubahan diperkirakan menyentuh:

- `database/migrations/...add_option_images_to_questions.php`
- `app/Models/Question.php`
- `app/Http/Controllers/QuestionController.php`
- `resources/js/Components/QuestionImageUpload.jsx`
- `resources/js/Pages/Questions/Create.jsx`
- `resources/js/Pages/Questions/Edit.jsx`
- `app/Http/Controllers/QuizAttemptController.php`
- `app/Http/Controllers/QuizResultController.php`
- `app/Http/Controllers/ExamResultController.php`
- `resources/js/Pages/QuizAttempts/Take.jsx`
- `resources/js/Pages/Exams/Take.jsx`
- `resources/js/Pages/QuizResults/Review.jsx`
- `resources/js/Pages/Results/Review.jsx`

## Risiko dan Catatan

- File handling bertambah karena sekarang ada sampai 5 gambar opsi tambahan per soal.
- Update logic harus hati-hati agar tidak menghapus gambar lama yang masih dipakai.
- UI form admin akan lebih padat, jadi area upload opsi harus dibuat ringkas.
- Import CSV belum diubah agar scope tetap terkendali.

## Implementasi Ringkas

1. Tambah kolom gambar per opsi di tabel `questions`.
2. Tambah fillable, accessor URL, dan transform payload di model.
3. Tambah validasi dan storage handling untuk gambar per opsi di controller.
4. Perluas komponen upload agar bisa dipakai di bawah tiap opsi.
5. Tampilkan gambar opsi di halaman pengerjaan dan review.
6. Pastikan exact match scoring tidak berubah.
