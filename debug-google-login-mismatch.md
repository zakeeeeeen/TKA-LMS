# Debug Session: google-login-mismatch
- **Status**: [OPEN]
- **Issue**: Login Google masih gagal di lokal meskipun `.env` sudah memakai `http://localhost:8000/auth/google/callback`.
- **Debug Server**: not-started
- **Log File**: .dbg/trae-debug-log-google-login-mismatch.ndjson

## Reproduction Steps
1. Buka halaman login lokal Laravel di `http://localhost:8000`.
2. Klik login dengan Google.
3. Google menampilkan error login gagal / mismatch callback.
4. Bandingkan URI callback di aplikasi, `.env`, route Laravel, dan Google Cloud Console.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | Authorized redirect URI di Google Console masih salah | High | Low | Pending |
| B | App dibuka dari host berbeda dengan `.env` (`localhost` vs `127.0.0.1`) | High | Low | Pending |
| C | Config Laravel belum membaca nilai env terbaru | Medium | Low | Pending |
| D | Client ID/secret yang aktif bukan OAuth client yang sedang diedit | Medium | Medium | Pending |

## Log Evidence
- Belum ada log runtime. Bukti awal dari screenshot dan konfigurasi statis.

## Verification Conclusion
- Menunggu verifikasi hipotesis berdasarkan bukti konfigurasi dan, bila perlu, runtime.
