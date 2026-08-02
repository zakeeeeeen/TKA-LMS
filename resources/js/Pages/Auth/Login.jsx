import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthSplitLayout from '@/Components/AuthSplitLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout title="Masuk Akun - TKA LMS">
            {/* Pill Badge */}
            <div className="mb-4">
                <span className="inline-block rounded-full bg-[#89d0f0] px-4 py-1.5 text-xs font-black text-slate-900 shadow-sm">
                    Login Portal
                </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Selamat Datang!
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-2">
                    Masuk ke akun Anda untuk melanjutkan pembelajaran
                </p>
            </div>

            {status && (
                <div className="mb-6 text-center text-sm font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                    {status}
                </div>
            )}

            {/* Login Form (FIRST) */}
            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Nama Pengguna atau Email" className="font-bold text-slate-700 text-xs mb-1.5" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="nama@email.com"
                            className="block w-full rounded-full border-slate-200 focus:border-[#89d0f0] focus:ring-[#89d0f0] text-sm py-3.5 pl-12 pr-4 shadow-sm"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs font-semibold" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" className="font-bold text-slate-700 text-xs mb-1.5" />
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            className="block w-full rounded-full border-slate-200 focus:border-[#89d0f0] focus:ring-[#89d0f0] text-sm py-3.5 pl-12 pr-12 shadow-sm"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1l22 22" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5 text-xs font-semibold" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-[#89d0f0]"
                        />
                        <span className="ms-2 text-xs font-bold text-slate-700">Ingat Saya?</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs font-bold text-slate-900 hover:underline"
                        >
                            Lupa Kata Sandi?
                        </Link>
                    )}
                </div>

                {/* Primary Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-6 py-4 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-all duration-300 shadow-md hover:shadow-xl active:scale-98 disabled:opacity-50"
                >
                    Masuk
                </button>
            </form>

            {/* Divider */}
            <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <span className="relative bg-white px-4 text-xs font-bold text-slate-400">
                    Atau masuk dengan
                </span>
            </div>

            {/* Google Sign-In Button (SECOND) */}
            <a
                href={route('auth.google')}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm transition-all duration-200 shadow-sm active:scale-98 hover:border-slate-300"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                </svg>
                <span>Masuk dengan Google</span>
            </a>

            {/* Footer link */}
            <div className="mt-8 text-center text-xs font-semibold text-slate-500">
                Tidak memiliki akun?{' '}
                <Link href={route('register')} className="font-bold text-slate-900 hover:underline">
                    Daftar disini
                </Link>
            </div>
        </AuthSplitLayout>
    );
}
