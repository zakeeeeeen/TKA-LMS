# Google Login Local Design

## Tujuan

Memperbaiki login Google pada environment lokal Laravel agar tidak gagal dengan error `redirect_uri_mismatch`.

## Scope

Perubahan hanya untuk environment lokal.

- login Google via `auth/google`
- callback Google via `auth/google/callback`
- sinkronisasi `APP_URL` dan `GOOGLE_REDIRECT_URI`
- perbaikan pesan error login Google

Di luar scope:

- deployment produksi
- login email/password
- perubahan flow autentikasi lain

## Masalah Saat Ini

- App memakai `GOOGLE_REDIRECT_URI` dari `.env`
- Host lokal bisa bercampur antara `localhost` dan `127.0.0.1`
- Google OAuth mewajibkan redirect URI yang identik dengan yang terdaftar di Google Cloud Console
- Akibatnya login gagal dengan `Error 400: redirect_uri_mismatch`

## Pendekatan

Gunakan satu sumber callback URI yang konsisten di backend.

- `GoogleAuthController` memiliki helper internal untuk menentukan callback URI
- Prioritas nilai:
  1. `config('services.google.redirect')` jika ada
  2. `route('auth.google.callback')` sebagai fallback
- `redirectToGoogle()` dan `handleGoogleCallback()` wajib memakai URI yang sama persis

## Konfigurasi Lokal

`.env` lokal diselaraskan agar tidak ambigu.

- `APP_URL=http://localhost:8000`
- `GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback`

Jika user menjalankan app lewat `127.0.0.1`, maka nilai lokal boleh diganti konsisten ke:

- `APP_URL=http://127.0.0.1:8000`
- `GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback`

Tetapi untuk mencegah mismatch berulang, Google Console tetap perlu mendaftarkan keduanya.

## Google Cloud Console

Authorized JavaScript origins:

- `http://localhost:8000`
- `http://127.0.0.1:8000`

Authorized redirect URIs:

- `http://localhost:8000/auth/google/callback`
- `http://127.0.0.1:8000/auth/google/callback`

## Perubahan Kode

### `app/Http/Controllers/Auth/GoogleAuthController.php`

- Tambah helper internal untuk membaca redirect URI yang konsisten
- Gunakan helper yang sama pada proses redirect dan callback
- Rapikan pesan gagal login agar lebih singkat dan mudah dipahami

### `config/services.php`

- Tetap membaca `GOOGLE_REDIRECT_URI`
- Tidak perlu perubahan struktur config

### `.env`

- Sinkronkan `APP_URL` dan `GOOGLE_REDIRECT_URI` ke host lokal yang sama

## Error Handling

Jika Google callback gagal:

- user dikembalikan ke halaman login
- tampilkan pesan singkat bahwa login Google gagal
- hindari menampilkan exception mentah yang terlalu panjang ke user

## Keputusan

- Fokus hanya pada environment lokal
- Pilihan host default lokal adalah `localhost`
- Tetap siapkan `localhost` dan `127.0.0.1` di Google Console agar aman
- Tidak mengubah flow login selain Google OAuth
