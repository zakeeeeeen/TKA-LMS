# Question Math Toolbar Design

## Tujuan

Menambahkan kemampuan mengetik ekspresi matematika pada form soal TKA melalui toolbar klik, tanpa mengubah struktur database yang sudah ada.

## Scope

Fitur berlaku untuk field berikut:

- `question_text`
- `option_a` sampai `option_e`
- `explanation`
- `matrix_rows[].statement`

Fitur berlaku di:

- form tambah soal
- form edit soal
- tampilan pengerjaan soal
- tampilan review hasil

## Pendekatan

Pendekatan yang dipakai adalah `toolbar + syntax internal`.

- Admin mengetik pada field biasa.
- Toolbar menyisipkan syntax matematik ke posisi kursor.
- Nilai tetap disimpan sebagai string biasa di database.
- Preview render matematik ditampilkan di bawah field saat input.
- Halaman siswa dan review merender syntax yang sama agar tampil rapi.

## Tombol Minimal Toolbar

- pecahan: `\frac{}{}`  
- akar: `\sqrt{}`
- pangkat: `^{ }`
- subscript: `_{ }`
- kurung: `\left( \right)`
- simbol: `±`, `×`, `÷`, `≤`, `≥`, `≠`, `π`

## Komponen

Tambahkan komponen reusable, misalnya `MathTextInput`, yang menangani:

- input/textarea
- toolbar matematik
- penyisipan template di posisi kursor
- preview render matematik
- fallback tampilan normal jika tidak ada syntax matematik

## Render

- Konten lama tetap kompatibel.
- Field tanpa syntax matematik tetap tampil normal.
- Field dengan syntax matematik dirender rapi di admin preview, halaman pengerjaan, dan halaman review.

## Batasan

- Tidak mengubah schema tabel untuk fitur ini.
- Tidak membuat rich text editor penuh.
- Tidak membuat parser matematika custom.
- Fokus hanya pada penulisan dan render ekspresi matematik.

## Keputusan

- Menggunakan toolbar klik, bukan input simbol manual saja.
- Berlaku di semua field teks soal yang relevan.
- Menjaga format data tetap string agar integrasi ke validasi, scoring, dan review tetap sederhana.
