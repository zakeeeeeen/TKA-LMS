<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    private function googleRedirectUri(): string
    {
        return config('services.google.redirect') ?: route('auth.google.callback');
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->redirectUrl($this->googleRedirectUri())
            ->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl($this->googleRedirectUri())
                ->user();

            $user = User::where('google_id', $googleUser->id)
                ->orWhere('email', $googleUser->email)
                ->first();

            if ($user) {
                // Update google_id or avatar if missing
                $user->update([
                    'google_id' => $user->google_id ?? $googleUser->id,
                    'avatar' => $user->avatar ?? $googleUser->avatar,
                ]);
            } else {
                // Create new student user via Google
                $user = User::create([
                    'name' => $googleUser->name ?? $googleUser->nickname ?? 'Pengguna Google',
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                    'role' => 'siswa',
                    'password' => null,
                ]);
            }

            Auth::login($user, true);

            return redirect()->intended(route('dashboard'));
        } catch (\Exception $e) {
            $message = 'Gagal login dengan Google.';

            if (str_contains(strtolower($e->getMessage()), 'redirect_uri_mismatch')) {
                $message = 'Gagal login dengan Google. Redirect URI belum sesuai dengan konfigurasi Google Console.';
            }

            return redirect()->route('login')->with('status', $message);
        }
    }
}
