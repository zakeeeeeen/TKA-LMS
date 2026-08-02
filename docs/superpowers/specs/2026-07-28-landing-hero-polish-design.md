# Landing Hero Polish Design

## Tujuan

Merombak hero section landing page agar lebih dekat dengan referensi visual user tanpa mengubah warna utama situs yang tetap biru.

## Scope

Perubahan hanya pada area hero landing page di `resources/js/Pages/Welcome.jsx`.

- mempertahankan palet biru yang sudah ada
- membesarkan gambar `siswa.png`
- menempatkan gambar siswa turun ke bawah hingga menembus batas section hero
- membuat teks `TKA LMS` pada judul utama terlihat glossy dan bercahaya
- mempertegas batas transisi hero ke section berikutnya agar posisi gambar terasa menyatu dengan perbatasan section

Di luar scope:

- perubahan warna global landing page
- perubahan isi copywriting
- perubahan layout section fitur, jenjang, CTA, dan footer

## Kondisi Saat Ini

- Hero sudah memakai layout dua kolom dengan gambar `siswa.png` di kanan
- Warna dasar landing page sudah biru dan ingin dipertahankan
- Gambar siswa masih belum cukup dominan pada batas bawah section
- Teks `TKA LMS` di headline belum memiliki efek glossy/glow sesuai permintaan user

## Pendekatan Visual

Hero tetap memakai fondasi layout saat ini, tetapi fokus visual dipindahkan ke dua elemen:

1. gambar siswa sebagai anchor kanan bawah yang lebih besar
2. teks `TKA LMS` sebagai aksen glossy bercahaya pada headline

Pendekatan ini menjaga identitas landing page saat ini, namun memberi kesan lebih premium dan dramatis pada area atas.

## Detail Perubahan

### 1. Gambar `siswa.png`

- ukuran gambar diperbesar secara signifikan pada desktop
- gambar di-anchor ke kanan bawah
- bagian bawah gambar dibuat turun melewati batas hero section
- gambar tetap responsif dan tidak mengganggu keterbacaan konten kiri
- di mobile, ukuran tetap dikendalikan agar tidak mendorong layout terlalu panjang

### 2. Headline `TKA LMS`

- hanya teks `TKA LMS` yang diberi efek glossy
- efek glossy dibentuk dengan kombinasi:
  - warna biru tua sebagai basis
  - highlight terang tipis
  - glow biru muda / putih lembut
  - kemungkinan gradient halus agar terlihat reflektif
- efek harus tetap readable dan tidak berubah menjadi neon berlebihan

### 3. Perbatasan Hero ke Section Berikutnya

- dibuat pemisah visual halus di bagian bawah hero
- tujuan utamanya bukan menambah ornamen besar, tetapi menegaskan bahwa gambar siswa berdiri pada area batas section
- section kedua tetap mempertahankan struktur existing

## Implementasi Teknis

File utama:

- `resources/js/Pages/Welcome.jsx`

Teknik yang dipakai:

- penyesuaian class Tailwind untuk sizing, positioning, z-index, shadow, dan overflow
- efek glossy/glow dibangun dari utility class Tailwind dan layer span tambahan bila diperlukan
- tidak menambah dependency baru
- tidak mengubah struktur route atau backend

## Responsiveness

- desktop: gambar tampil dominan dan turun melewati batas hero
- tablet: gambar masih besar, tetapi overlap dikurangi
- mobile: layout tetap satu kolom, gambar tetap hadir tetapi tinggi dibatasi agar tidak memakan layar berlebihan

## Keputusan

- warna utama landing page tetap biru
- fokus perubahan hanya hero section
- `siswa.png` dibuat lebih besar dan lebih rendah posisinya
- `TKA LMS` pada headline diberi efek glossy bercahaya
- section lain tidak dirombak pada iterasi ini
