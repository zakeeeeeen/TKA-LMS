import { Head, Link } from '@inertiajs/react';

export default function AuthSplitLayout({ children, title = 'Portal Akun TKA' }) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen w-full bg-[#f4fafd] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-slate-900 selection:text-white">
                <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 grid grid-cols-1 lg:grid-cols-12 min-h-[640px] relative">
                    
                    {/* Left Column - Visual Area (Hidden on Mobile/Tablet, 50% / 6 cols on Desktop) */}
                    <div className="hidden lg:flex lg:col-span-6 bg-[#89d0f0] p-10 relative overflow-hidden flex-col justify-between items-center text-slate-900">
                        {/* Background subtle decoration shapes */}
                        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/20 blur-xl pointer-events-none"></div>
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/30 blur-2xl pointer-events-none"></div>

                        {/* Top Branding */}
                        <div className="w-full flex items-center gap-3 z-10">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white font-black text-xl shadow-md">
                                TKA
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-900">
                                TKA <span className="text-blue-950 font-extrabold">LMS</span>
                            </span>
                        </div>

                        {/* Centered Image with Floating Animation */}
                        <div className="relative my-auto z-10 flex flex-col items-center justify-center w-full">
                            <div className="relative w-72 h-80 sm:w-80 sm:h-96 flex items-end justify-center">
                                <img
                                    src="/murid.png"
                                    alt="Siswa TKA LMS"
                                    className="w-full h-full object-contain animate-[float_4s_easeInOut_infinite] filter drop-shadow-xl"
                                />
                            </div>
                            <div className="mt-6 text-center max-w-xs z-10">
                                <h4 className="text-xl font-black text-slate-900">Belajar Lebih Cerdas Bersama AI</h4>
                                <p className="text-xs text-slate-800 font-semibold mt-1">
                                    Akses simulasi kuis, bank soal terlengkap, dan asisten pintar Waho.
                                </p>
                            </div>
                        </div>

                        {/* Footer info */}
                        <div className="text-xs font-bold text-slate-700 z-10">
                            © 2026 TKA LMS Indonesia. All rights reserved.
                        </div>
                    </div>

                    {/* Right Column - Form Area (Full width on Mobile, 50% / 6 cols on Desktop) */}
                    <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
                        {/* Close / Return to Landing Page Button "X" */}
                        <Link
                            href="/"
                            title="Kembali ke Beranda"
                            className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-all duration-200 shadow-sm active:scale-95 group"
                        >
                            <svg className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Link>

                        {/* Mobile Header Logo */}
                        <div className="flex lg:hidden items-center gap-2.5 mb-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-sm shadow-md">
                                TKA
                            </div>
                            <span className="text-lg font-black tracking-tight text-slate-900">
                                TKA <span className="text-blue-950">LMS</span>
                            </span>
                        </div>

                        {/* Children Form */}
                        {children}
                    </div>
                </div>
            </div>

            {/* Custom keyframes for subtle float animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
            `}</style>
        </>
    );
}
