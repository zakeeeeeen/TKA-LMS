import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function Dashboard() {
    const { stats, activeCourses, auth } = usePage().props;
    const isStudent = auth.user.role === 'siswa';

    const statCards = [
        {
            label: 'Total Students',
            value: stats?.totalStudents || 0,
            change: '+12%',
            changeType: 'positive',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            gradient: 'from-blue-500 to-indigo-600',
        },
        {
            label: 'Total Questions',
            value: stats?.totalQuestions || 0,
            change: '+8%',
            changeType: 'positive',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-emerald-500 to-teal-600',
        },
        {
            label: 'Total Quiz',
            value: stats?.totalQuizzes || 0,
            change: '+5%',
            changeType: 'positive',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            gradient: 'from-purple-500 to-violet-600',
        },
        {
            label: 'Total Courses',
            value: stats?.totalCourses || 0,
            change: '+2',
            changeType: 'positive',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            gradient: 'from-orange-500 to-amber-600',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-slate-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            {isStudent ? (
                <div className="space-y-6">
                    {/* Welcome Banner */}
                    <div className="rounded-2xl bg-[#89d0f0] p-6 text-slate-900 shadow-md sm:p-8">
                        <h3 className="text-2xl font-bold">Selamat datang kembali, {auth.user.name}!</h3>
                        <p className="mt-2 text-sm text-slate-800 max-w-xl font-medium">
                            Kelola dan lanjutkan pembelajaran Anda pada daftar kursus terdaftar di bawah ini.
                        </p>
                    </div>

                    {/* Enrolled Courses */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Kursus Terdaftar</h3>
                                <p className="text-sm text-slate-500">Daftar semua kursus aktif yang sedang Anda ikuti.</p>
                            </div>
                            <Link
                                href={route('student.courses.index')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
                            >
                                Cari Kursus Lainnya
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {(activeCourses ?? []).map((course, idx) => (
                                <div key={course.id}>
                                    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md h-full">
                                        <div>
                                            {course.thumbnail_url ? (
                                                <div className="h-48 overflow-hidden border-b border-slate-100">
                                                    <img
                                                        src={course.thumbnail_url}
                                                        alt={course.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-48 items-center justify-center bg-[#89d0f0]">
                                                    <Icon icon="lucide:book-open" className="w-12 h-12 text-slate-800" />
                                                </div>
                                            )}

                                            <div className="p-5">
                                                <h4 className="text-lg font-bold text-slate-900">
                                                    {course.name}
                                                </h4>

                                                {course.description && (
                                                    <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
                                                        {course.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-5 pb-5 pt-2">
                                            <Link
                                                href={route('student.courses.show', course.id)}
                                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
                                            >
                                                Masuk Kursus
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(activeCourses ?? []).length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p className="mt-4 text-base font-semibold text-slate-700">Belum Ada Kursus Terdaftar</p>
                                <p className="mt-1 text-sm text-slate-500">Anda belum mendaftar atau menyetujui kursus apa pun saat ini.</p>
                                <Link
                                    href={route('student.courses.index')}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Jelajahi Katalog Kursus
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {statCards.map((card) => (
                            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">{card.label}</p>
                                        <p className="text-3xl font-black text-slate-900">{card.value}</p>
                                    </div>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                                        {card.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Real-time Feed: Pengerjaan Kuis Terbaru */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-6 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-extrabold text-slate-900">Pengerjaan Kuis Terbaru</h3>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">5 Siswa terakhir yang baru saja menyelesaikan kuis.</p>
                                            </div>
                                        <Link
                                            href={route('admin.quiz-reports.index', { mode: 'latest' })}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                        >
                                            Lihat Semua →
                                        </Link>
                                    </div>

                                    {(usePage().props.latestAttempts ?? []).length === 0 ? (
                                        <div className="py-10 text-center text-sm font-medium text-slate-500">
                                            Belum ada pengerjaan kuis terbaru.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {usePage().props.latestAttempts.map((attempt) => (
                                                <div key={attempt.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-slate-100/80">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-black text-sm shadow-sm">
                                                            {attempt.user_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-sm text-slate-900">{attempt.user_name}</div>
                                                            <div className="text-xs font-medium text-slate-500">
                                                                {attempt.quiz_name} • <span className="text-slate-700">{attempt.course_name}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-right">
                                                        <div>
                                                            <div className="font-black text-base text-slate-900">{attempt.score} <span className="text-xs font-semibold text-slate-500">pts</span></div>
                                                            <div className="text-[11px] font-medium text-slate-400">{attempt.finished_at}</div>
                                                        </div>
                                                        {attempt.passed ? (
                                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200">
                                                                Lulus
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-800 border border-rose-200">
                                                                Belum Lulus
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Panel */}
                        <div className="space-y-6">
                            <div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                    <h3 className="mb-4 text-base font-extrabold text-slate-900">Akses Pintar (Quick Actions)</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link href={route('quizzes.create')} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center transition-all duration-200 hover:bg-slate-100">
                                            <Icon icon="lucide:file-edit" className="w-6 h-6 text-blue-600" />
                                            <span className="text-xs font-extrabold text-slate-800">Buat Kuis Baru</span>
                                        </Link>
                                        <Link href={route('materials.create')} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center transition-all duration-200 hover:bg-slate-100">
                                            <Icon icon="lucide:folder-open" className="w-6 h-6 text-emerald-600" />
                                            <span className="text-xs font-extrabold text-slate-800">Upload Materi</span>
                                        </Link>
                                        <Link href={route('questions.import.create')} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center transition-all duration-200 hover:bg-slate-100">
                                            <Icon icon="lucide:file-up" className="w-6 h-6 text-indigo-600" />
                                            <span className="text-xs font-extrabold text-slate-800">Import Soal</span>
                                        </Link>
                                        <Link href={route('course-enrollment-requests.index')} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-center transition-all duration-200 hover:bg-slate-100">
                                            <Icon icon="lucide:clipboard-check" className="w-6 h-6 text-amber-600" />
                                            <span className="text-xs font-extrabold text-slate-800">Persetujuan</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AuthenticatedLayout>
    );
}
