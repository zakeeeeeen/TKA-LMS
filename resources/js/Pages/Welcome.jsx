import { Head, Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import Reveal from '@/Components/Reveal';

export default function Welcome({ auth }) {
    const { siteSettings } = usePage().props;
    const heroImageSrc = siteSettings?.hero_image || '/murid.png';
    const heroBadgeText = siteSettings?.hero_badge || 'AI-Powered Learning Platform TKA';
    const heroTitleText = siteSettings?.hero_title || 'Tingkatkan Kemampuan Akademikmu Bersama';
    const heroSubtitleText = siteSettings?.hero_subtitle || 'Platform simulasi ujian & latihan soal terintegrasi untuk SD, SMP, dan SMA. Dilengkapi analisis hasil mendalam serta pembahasan cerdas berbasis AI.';

    return (
        <>
            <Head>
                <title>{siteSettings?.site_title || 'TKA LMS - Tes Kemampuan Akademik'}</title>
                <meta name="description" content={siteSettings?.site_description || 'Platform simulasi ujian & latihan soal terintegrasi untuk SD, SMP, dan SMA dengan pembahasan AI.'} />
                {siteSettings?.seo_keywords && <meta name="keywords" content={siteSettings.seo_keywords} />}
                {siteSettings?.seo_author && <meta name="author" content={siteSettings.seo_author} />}
            </Head>
            <div className="min-h-screen font-sans bg-[#89d0f0] text-slate-900 selection:bg-slate-900 selection:text-white">
                {/* Navbar Topbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-[#89d0f0] border-b border-blue-300/40 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            <div className="flex items-center gap-3">
                                <img
                                    src={siteSettings?.favicon_image || '/icon.png'}
                                    alt="TKA LMS Logo"
                                    className="h-11 w-11 object-contain transition hover:scale-105 duration-300"
                                />
                                <span className="text-2xl font-black tracking-tight text-slate-900">
                                    TKA <span className="text-blue-950 font-extrabold">LMS</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="group relative inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-xl text-sm overflow-hidden active:scale-95"
                                    >
                                        <span>Ke Dashboard</span>
                                        <Icon icon="lucide:arrow-right" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-slate-900 hover:text-blue-950 px-5 py-2.5 rounded-xl font-bold transition duration-200 text-sm active:scale-95"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="group relative inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-xl text-sm overflow-hidden active:scale-95"
                                        >
                                            <span>Daftar Sekarang</span>
                                            <Icon icon="lucide:arrow-right" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* SECTION 1: HERO */}
                <section className="relative min-h-[90vh] lg:min-h-screen pt-20 sm:pt-24 pb-0 px-4 sm:px-6 lg:px-12 bg-[#89d0f0] overflow-hidden flex items-stretch justify-between">
                    {/* Subtle Radial Glow Atmosphere */}
                    <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[700px] h-[350px] sm:h-[700px] bg-sky-200/50 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute right-[8%] top-[18%] h-[200px] sm:h-[360px] w-[200px] sm:w-[360px] rounded-full bg-cyan-100/35 blur-3xl pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto w-full relative z-10 pt-2 lg:pt-6">
                        <div className="grid lg:grid-cols-12 gap-8 items-start py-6 lg:py-10">
                            {/* Left Column Content */}
                            <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10 pt-4 sm:pt-8 lg:pt-14">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/55 bg-white/18 px-3.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white shadow-[0_0_18px_rgba(255,255,255,0.28)] backdrop-blur-sm [text-shadow:0_0_14px_rgba(255,255,255,0.55)]">
                                    <Icon icon="lucide:sparkles" className="w-4 h-4 text-amber-300" />
                                    <span>{heroBadgeText}</span>
                                </div>

                                {/* Title Text */}
                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] sm:leading-[1.12] tracking-tight">
                                    {heroTitleText}{' '}
                                    <span className="relative inline-flex">
                                        <span className="absolute inset-x-2 top-1/2 h-5 -translate-y-1/2 rounded-full bg-white/70 blur-xl"></span>
                                        <span className="absolute -inset-x-1 -inset-y-1 rounded-full bg-cyan-200/45 blur-2xl"></span>
                                        <span className="relative inline-block bg-gradient-to-b from-white via-cyan-50 to-blue-200 bg-clip-text text-transparent [text-shadow:0_1px_0_rgba(255,255,255,0.65),0_0_22px_rgba(186,230,253,0.85),0_6px_16px_rgba(30,64,175,0.18)]">
                                            TKA LMS
                                        </span>
                                    </span>
                                </h1>

                                {/* Subtitle Text */}
                                <p className="text-sm sm:text-lg lg:text-xl text-slate-800 font-medium leading-relaxed max-w-xl">
                                    {heroSubtitleText}
                                </p>

                                {/* Pill Badges / Tags (Grid 2 Kolom di HP) */}
                                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5 pt-1">
                                    <span className="px-3 sm:px-4 py-2 rounded-2xl sm:rounded-full border border-slate-900/20 bg-white/40 text-slate-900 text-xs sm:text-sm font-bold backdrop-blur-sm shadow-sm transition hover:bg-white/60 text-center">
                                        Simulasi Ujian
                                    </span>
                                    <span className="px-3 sm:px-4 py-2 rounded-2xl sm:rounded-full border border-slate-900/20 bg-white/40 text-slate-900 text-xs sm:text-sm font-bold backdrop-blur-sm shadow-sm transition hover:bg-white/60 text-center">
                                        Bank Soal SD, SMP, SMA
                                    </span>
                                    <span className="px-3 sm:px-4 py-2 rounded-2xl sm:rounded-full border border-slate-900/20 bg-white/40 text-slate-900 text-xs sm:text-sm font-bold backdrop-blur-sm shadow-sm transition hover:bg-white/60 text-center">
                                        Asisten AI Waho
                                    </span>
                                    <span className="px-3 sm:px-4 py-2 rounded-2xl sm:rounded-full border border-slate-900/20 bg-white/40 text-slate-900 text-xs sm:text-sm font-bold backdrop-blur-sm shadow-sm transition hover:bg-white/60 text-center">
                                        Analisis Realtime
                                    </span>
                                </div>

                                {/* Dual Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-3">
                                    {!auth.user ? (
                                        <>
                                            <Link
                                                href={route('register')}
                                                className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl text-center active:scale-95 hover:-translate-y-0.5"
                                            >
                                                Mulai Belajar Sekarang
                                            </Link>
                                            <Link
                                                href={route('login')}
                                                className="inline-flex items-center justify-center bg-transparent hover:bg-slate-900/10 text-slate-900 border-2 border-slate-900/40 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition duration-300 text-center active:scale-95"
                                            >
                                                Masuk Akun
                                            </Link>
                                        </>
                                    ) : (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-xl hover:shadow-2xl text-center active:scale-95 hover:-translate-y-0.5"
                                        >
                                            Buka Dashboard Pelajaran
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Cutout Student Image (Normal Centered on Mobile, Shifted Right on Desktop) */}
                            <div className="lg:col-span-5 relative z-10 flex justify-center lg:justify-end items-end self-end h-full mt-4 lg:mt-0">
                                <div className="relative w-full flex justify-center lg:justify-end items-end">
                                    {/* Student Image Cutout standing flush at the bottom section edge */}
                                    <div className="relative z-20 h-[340px] sm:h-[500px] lg:h-[620px] xl:h-[660px] translate-y-4 sm:translate-y-6 lg:translate-y-10 translate-x-0 lg:translate-x-16 mr-0 lg:-mr-16 flex items-end justify-center lg:justify-end filter drop-shadow-[0_20px_35px_rgba(15,23,42,0.2)] max-w-full">
                                        <img
                                            src={heroImageSrc}
                                            alt="Siswa TKA LMS Indonesia"
                                            className="h-full w-auto max-w-full lg:max-w-none object-contain object-bottom transition-transform duration-700 hover:scale-[1.02]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    SEKAT SECTION 1 & 2
                   ========================================== */}

                {/* ==========================================
                    SECTION 2: FITUR UNGGULAN (2 KOLOM DI HP)
                   ========================================== */}
                <section className="bg-white px-4 py-16 sm:py-24 text-slate-900 sm:px-6 lg:px-8 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Reveal>
                            <div className="text-center mb-10 sm:mb-16 space-y-3">
                                <span className="inline-block rounded-full bg-[#89d0f0] px-4 py-1.5 text-xs font-black text-slate-900 uppercase tracking-wider shadow-sm">
                                    Kenapa Memilih Kami?
                                </span>
                                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                    Fitur Unggulan TKA LMS
                                </h2>
                                <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                                    Dirancang khusus untuk mempermudah siswa belajar dan mengukur kesiapan menghadapi ujian.
                                </p>
                            </div>
                        </Reveal>

                        {/* Grid 2 Kolom di HP (grid-cols-2) dan 3 Kolom di Laptop (lg:grid-cols-3) */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                            {[
                                {
                                    icon: 'lucide:school',
                                    title: 'Tingkat SD, SMP, & SMA',
                                    desc: 'Bank soal dikelompokkan secara terstruktur berdasarkan jenjang pendidikan.',
                                },
                                {
                                    icon: 'lucide:bot',
                                    title: 'Pembahasan Cerdas AI Waho',
                                    desc: 'Setiap nomor soal dilengkapi asisten AI interaktif untuk menjelaskan langkah jawaban secara detail.',
                                },
                                {
                                    icon: 'lucide:bar-chart-3',
                                    title: 'Rekap & Analisis Nilai',
                                    desc: 'Pantau grafik perkembangan nilai, durasi pengerjaan, serta statistik kelulusan KKTP/KKM.',
                                },
                                {
                                    icon: 'lucide:file-text',
                                    title: 'Paket Kuis & Tryout Flexible',
                                    desc: 'Pilihan kuis per bab atau simulasi ujian penuh dengan sistem timer otomatis.',
                                },
                                {
                                    icon: 'lucide:smartphone',
                                    title: 'Tampilan Modern & Responsif',
                                    desc: 'Dapat diakses dengan nyaman melalui Laptop, Tablet, maupun Smartphone Anda.',
                                },
                                {
                                    icon: 'lucide:binary',
                                    title: 'Dukungan Kode Matematika',
                                    desc: 'Format rumus matematika KaTeX yang rapi, presisi, dan mudah dibaca oleh siswa.',
                                },
                            ].map((feature, idx) => (
                                <Reveal key={idx} delay={idx * 100}>
                                    <div
                                        className="group relative rounded-2xl sm:rounded-3xl border border-slate-200 sm:border-2 sm:border-slate-100 bg-slate-50/80 p-4 sm:p-8 transition-all duration-300 hover:border-[#89d0f0] hover:bg-white hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer h-full flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-[#89d0f0] text-slate-900 text-xl sm:text-3xl shadow-sm sm:shadow-md mb-3 sm:mb-6 transition-transform duration-300 group-hover:scale-110">
                                                <Icon icon={feature.icon} className="w-6 h-6 sm:w-8 sm:h-8" />
                                            </div>
                                            <h3 className="text-sm sm:text-xl font-extrabold sm:font-bold text-slate-900 mb-1.5 sm:mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                                                {feature.title}
                                            </h3>
                                            <p className="text-[11px] sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-4 sm:line-clamp-none">
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    SHAPE DIVIDER 2: Curved Shape (White -> #89d0f0)
                   ========================================== */}
                <div className="w-full overflow-hidden leading-none bg-[#89d0f0]">
                    <svg
                        className="relative block w-full h-16 sm:h-24 text-white"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        fill="currentColor"
                    >
                        <path d="M0,0 C150,90 350,-40 500,65 C650,165 900,10 1200,60 L1200,0 L0,0 Z"></path>
                    </svg>
                </div>

                {/* ==========================================
                    SECTION 3: JENJANG PENDIDIKAN (SCROLL REVEAL ANIMATION)
                   ========================================== */}
                <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#89d0f0] text-slate-900 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Reveal>
                            <div className="text-center mb-16 space-y-3">
                                <span className="inline-block rounded-full bg-white px-4 py-1.5 text-xs font-black text-slate-900 uppercase tracking-wider shadow-sm">
                                    Pilihan Program
                                </span>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                                    Jenjang Pembelajaran Tersedia
                                </h2>
                                <p className="text-base sm:text-lg text-slate-800 max-w-2xl mx-auto font-medium">
                                    Pilih jenjang sekolah sesuai dengan tingkat pendidikan siswa saat ini.
                                </p>
                            </div>
                        </Reveal>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* SD Card */}
                            <Reveal delay={100}>
                                <div className="group rounded-3xl bg-white p-8 shadow-xl border-4 border-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="inline-block rounded-2xl bg-red-100 text-red-600 font-black px-4 py-2 text-sm mb-4">
                                            Tingkat SD
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-red-600 transition-colors">
                                            Sekolah Dasar
                                        </h3>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                                            Latihan soal berstandar TKA SD mencakup Matematika Dasar, Bahasa Indonesia, dan Ilmu Pengetahuan.
                                        </p>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs font-bold text-slate-700">
                                        <span>Ribuan Soal SD</span>
                                        <span className="text-red-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Mulai Belajar →
                                        </span>
                                    </div>
                                </div>
                            </Reveal>

                            {/* SMP Card */}
                            <Reveal delay={200}>
                                <div className="group rounded-3xl bg-white p-8 shadow-xl border-4 border-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="inline-block rounded-2xl bg-blue-100 text-blue-600 font-black px-4 py-2 text-sm mb-4">
                                            Tingkat SMP
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            Sekolah Menengah Pertama
                                        </h3>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                                            Soal-soal analisis HOTS untuk persiapan ujian sekolah dan evaluasi akademik SMP secara komprehensif.
                                        </p>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs font-bold text-slate-700">
                                        <span>Ribuan Soal SMP</span>
                                        <span className="text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Mulai Belajar →
                                        </span>
                                    </div>
                                </div>
                            </Reveal>

                            {/* SMA Card */}
                            <Reveal delay={300}>
                                <div className="group rounded-3xl bg-white p-8 shadow-xl border-4 border-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="inline-block rounded-2xl bg-purple-100 text-purple-600 font-black px-4 py-2 text-sm mb-4">
                                            Tingkat SMA
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-purple-600 transition-colors">
                                            Sekolah Menengah Atas
                                        </h3>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                                            Simulasi TKA tingkat lanjut untuk persiapan kelulusan SMA dan seleksi perguruan tinggi.
                                        </p>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs font-bold text-slate-700">
                                        <span>Ribuan Soal SMA</span>
                                        <span className="text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            Mulai Belajar →
                                        </span>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    SHAPE DIVIDER 3: Asymmetrical Angle (#89d0f0 -> White)
                   ========================================== */}
                <div className="w-full overflow-hidden leading-none bg-white">
                    <svg
                        className="relative block w-full h-16 sm:h-24 text-[#89d0f0]"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        fill="currentColor"
                    >
                        <path d="M1200 0L0 0 598.97 78.46 1200 0z"></path>
                    </svg>
                </div>

                {/* ==========================================
                    SECTION 4: CALL TO ACTION (SCROLL REVEAL ANIMATION)
                   ========================================== */}
                <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white text-slate-900 text-center overflow-hidden">
                    <Reveal>
                        <div className="max-w-4xl mx-auto rounded-3xl bg-[#89d0f0] border-4 border-white p-10 sm:p-16 shadow-xl relative overflow-hidden">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
                                Siap Meningkatkan Nilai Akademikmu?
                            </h2>
                            <p className="text-base sm:text-lg text-slate-800 font-semibold max-w-2xl mx-auto mb-8">
                                Bergabunglah sekarang bersama ribuan siswa lainnya di seluruh Indonesia dan raih prestasi impianmu!
                            </p>

                            {!auth.user ? (
                                <Link
                                    href={route('register')}
                                    className="group inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 active:scale-95"
                                >
                                    <span>Daftar Gratis Sekarang</span>
                                    <Icon icon="lucide:sparkles" className="w-5 h-5 text-amber-300" />
                                    <Icon icon="lucide:arrow-right" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                                </Link>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="group inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition duration-300 active:scale-95"
                                >
                                    <span>Masuk ke Dashboard</span>
                                    <Icon icon="lucide:arrow-right" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                                </Link>
                            )}
                        </div>
                    </Reveal>
                </section>

                {/* ==========================================
                    FOOTER (DARK SLATE FOR SOLID CONTRAST)
                   ========================================== */}
                <footer className="bg-slate-900 text-slate-400 py-14 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#89d0f0] text-slate-900 font-black text-sm shadow-sm">
                                    TKA
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tight">TKA LMS</h4>
                            </div>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                Platform simulasi ujian & latihan soal terpercaya untuk jenjang SD, SMP, dan SMA di Indonesia.
                            </p>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Fitur</h5>
                            <ul className="space-y-2 text-sm font-medium">
                                <li>Bank Soal SD, SMP, SMA</li>
                                <li>Pembahasan AI Waho</li>
                                <li>Simulasi Quiz Online</li>
                                <li>Laporan Rekap Nilai</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigasi</h5>
                            <ul className="space-y-2 text-sm font-medium">
                                <li><Link href={route('login')} className="hover:text-white transition-colors">Masuk Akun</Link></li>
                                <li><Link href={route('register')} className="hover:text-white transition-colors">Pendaftaran Siswa</Link></li>
                                <li>Tentang Kami</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Kontak</h5>
                            <ul className="space-y-2 text-sm font-medium">
                                <li className="flex items-center gap-2"><Icon icon="lucide:mail" className="w-4 h-4 text-slate-400" /> support@tkalms.com</li>
                                <li className="flex items-center gap-2"><Icon icon="lucide:globe" className="w-4 h-4 text-slate-400" /> Indonesia</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs font-semibold text-slate-500">
                        © 2026 TKA LMS. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}
