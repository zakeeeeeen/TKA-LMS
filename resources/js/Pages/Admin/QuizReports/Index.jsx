import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MathContent from '@/Components/MathContent';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';

export default function Index({
    mode = 'course',
    recentAttempts = { data: [], links: [], total: 0 },
    liveAttempts = [],
    courses = [],
    selectedCourseId = null,
    selectedCourse = null,
    quizzes = [],
    selectedQuizId = null,
    selectedQuiz = null,
    participants = [],
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'attempted', 'not_attempted'
    const [sortBy, setSortBy] = useState('latest'); // 'latest', 'oldest', 'score_desc', 'score_asc', 'name_asc', 'name_desc'
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleRefreshLive = () => {
        router.get(route('admin.quiz-reports.index'), {
            mode: 'live',
            filter_quiz_id: selectedQuizId || undefined,
            filter_course_id: selectedCourseId || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    // Filter live attempts
    const filteredLiveAttempts = useMemo(() => {
        let list = [...liveAttempts].filter((attempt) => {
            return (
                attempt.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attempt.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attempt.quiz_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attempt.course_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

        list.sort((a, b) => {
            if (sortBy === 'score_desc') return b.current_score - a.current_score;
            if (sortBy === 'score_asc') return a.current_score - b.current_score;
            if (sortBy === 'name_asc') return a.user_name.localeCompare(b.user_name);
            if (sortBy === 'name_desc') return b.user_name.localeCompare(a.user_name);
            if (sortBy === 'oldest') return a.remaining_seconds - b.remaining_seconds;
            return b.id - a.id;
        });

        return list;
    }, [liveAttempts, searchQuery, sortBy]);

    // Determine current active step (1, 2, or 3)
    const currentStep = useMemo(() => {
        if (selectedCourseId && selectedQuizId) return 3;
        if (selectedCourseId) return 2;
        return 1;
    }, [selectedCourseId, selectedQuizId]);

    // Filter recent attempts for Latest mode
    const filteredRecentAttempts = useMemo(() => {
        let list = [...(recentAttempts.data ?? [])].filter((attempt) => {
            return (
                attempt.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attempt.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attempt.quiz_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                attempt.course_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

        list.sort((a, b) => {
            if (sortBy === 'score_desc') return (b.score ?? 0) - (a.score ?? 0);
            if (sortBy === 'score_asc') return (a.score ?? 0) - (b.score ?? 0);
            if (sortBy === 'name_asc') return a.user_name.localeCompare(b.user_name);
            if (sortBy === 'name_desc') return b.user_name.localeCompare(a.user_name);
            if (sortBy === 'oldest') return a.id - b.id;
            return b.id - a.id; // 'latest'
        });

        return list;
    }, [recentAttempts.data, searchQuery, sortBy]);

    // Step 3 Filtering & Sorting logic
    const filteredParticipants = useMemo(() => {
        let list = (participants ?? []).filter((participant) => {
            const matchesSearch =
                participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                participant.email.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (statusFilter === 'attempted') return participant.has_attempted;
            if (statusFilter === 'not_attempted') return !participant.has_attempted;

            return true;
        });

        list.sort((a, b) => {
            const scoreA = a.attempt?.score ?? -1;
            const scoreB = b.attempt?.score ?? -1;

            if (sortBy === 'score_desc') return scoreB - scoreA;
            if (sortBy === 'score_asc') return scoreA - scoreB;
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
            if (sortBy === 'oldest') {
                const idA = a.attempt?.id ?? 0;
                const idB = b.attempt?.id ?? 0;
                return idA - idB;
            }
            // default 'latest'
            const idA = a.attempt?.id ?? 0;
            const idB = b.attempt?.id ?? 0;
            return idB - idA;
        });

        return list;
    }, [participants, searchQuery, statusFilter, sortBy]);

    const handleSwitchMode = (targetMode) => {
        router.get(route('admin.quiz-reports.index'), { mode: targetMode });
    };

    const handleSelectCourse = (courseId) => {
        router.get(route('admin.quiz-reports.index'), { mode: 'course', course_id: courseId }, { preserveState: true });
    };

    const handleSelectQuiz = (quizId) => {
        router.get(route('admin.quiz-reports.index'), { mode: 'course', course_id: selectedCourseId, quiz_id: quizId }, { preserveState: true });
    };

    const handleBackToCourses = () => {
        router.get(route('admin.quiz-reports.index'), { mode: 'course' });
    };

    const handleBackToQuizzes = () => {
        router.get(route('admin.quiz-reports.index'), { mode: 'course', course_id: selectedCourseId });
    };

    const openModalDetail = (participant) => {
        setSelectedParticipant(participant);
        setShowDetailModal(true);
    };

    const openModalDetailForAttempt = (attempt) => {
        setSelectedParticipant({
            user_id: attempt.user_id,
            name: attempt.user_name,
            email: attempt.user_email,
            avatar_url: attempt.user_avatar,
            has_attempted: true,
            attempt: attempt,
        });
        setShowDetailModal(true);
    };

    const closeModalDetail = () => {
        setShowDetailModal(false);
        setSelectedParticipant(null);
    };

    const formatRemainingSeconds = (seconds) => {
        if (!seconds || seconds <= 0) return 'Waktu Habis';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    };

    useEffect(() => {
        if (mode !== 'live') return;
        const timer = setInterval(() => {
            handleRefreshLive();
        }, 10000);
        return () => clearInterval(timer);
    }, [mode]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            Hasil Kuis Peserta
                        </h2>
                        {/* Mode Switcher Tabs */}
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-slate-200/80 p-1">
                            <button
                                onClick={() => handleSwitchMode('course')}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    mode === 'course' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Icon icon="lucide:folder-tree" className="w-3.5 h-3.5" />
                                <span>Berdasarkan Kursus</span>
                            </button>
                            <button
                                onClick={() => handleSwitchMode('latest')}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    mode === 'latest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Icon icon="lucide:zap" className="w-3.5 h-3.5 text-amber-500" />
                                <span>Selesai Terbaru</span>
                            </button>
                            <button
                                onClick={() => handleSwitchMode('live')}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    mode === 'live' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-600 hover:bg-rose-100'
                                }`}
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                <Icon icon="lucide:radio" className="w-3.5 h-3.5" />
                                <span>Live Ujian Aktif ({liveAttempts.length})</span>
                            </button>
                        </div>
                    </div>

                    {mode === 'course' && currentStep > 1 && (
                        <div>
                            <button
                                onClick={currentStep === 3 ? handleBackToQuizzes : handleBackToCourses}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                ← Kembali
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Hasil Kuis Peserta" />

            <div className="space-y-6">
                {/* MODE LIVE: Monitoring Peserta Sedang Ujian */}
                {mode === 'live' && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                                        </span>
                                        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                                            <Icon icon="lucide:radio" className="w-5 h-5 text-rose-600" />
                                            <span>Live Monitoring Peserta Ujian</span>
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium mt-1">
                                        Memantau <span className="font-bold text-rose-600">{liveAttempts.length} siswa</span> yang saat ini sedang aktif mengerjakan ujian secara real-time.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={handleRefreshLive}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 transition active:scale-95"
                                    >
                                        <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
                                        <span>Update Data</span>
                                    </button>

                                    <input
                                        type="text"
                                        placeholder="Cari siswa / kuis..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full sm:w-44 rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                    />

                                    <select
                                        value={selectedQuizId ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            router.get(route('admin.quiz-reports.index'), {
                                                mode: 'live',
                                                filter_quiz_id: val || undefined,
                                                filter_course_id: selectedCourseId || undefined,
                                            }, { preserveState: true });
                                        }}
                                        className="w-full sm:w-auto rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Kuis</option>
                                        {quizzes.map((quiz) => (
                                            <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full sm:w-auto rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="latest">Terlama Sisa Waktu</option>
                                        <option value="score_desc">Skor Sementara Tertinggi</option>
                                        <option value="score_asc">Skor Sementara Terendah</option>
                                        <option value="name_asc">Nama (A - Z)</option>
                                    </select>
                                </div>
                            </div>

                            {filteredLiveAttempts.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-3">
                                        <Icon icon="lucide:coffee" className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-base font-bold text-slate-800">Tidak ada siswa yang sedang mengerjakan ujian</h4>
                                    <p className="text-xs text-slate-500 mt-1">Saat ada siswa yang mulai ujian, progress waktu dan nilainya akan muncul di sini secara otomatis.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-600">
                                        <thead className="bg-rose-50/70 text-xs font-bold uppercase text-slate-700">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-xl">Siswa</th>
                                                <th className="px-4 py-3">Nama Kuis / Kursus</th>
                                                <th className="px-4 py-3 text-center">Sisa Waktu</th>
                                                <th className="px-4 py-3 text-center">Progress Dijawab</th>
                                                <th className="px-4 py-3 text-center">Skor Sementara</th>
                                                <th className="px-4 py-3 text-right rounded-r-xl">Aktivitas Terakhir</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredLiveAttempts.map((attempt) => (
                                                <tr key={attempt.id} className="hover:bg-rose-50/30 transition">
                                                    <td className="px-4 py-3 font-semibold text-slate-900">
                                                        <div className="flex items-center gap-3">
                                                            {attempt.user_avatar ? (
                                                                <img
                                                                    src={attempt.user_avatar}
                                                                    alt={attempt.user_name}
                                                                    className="h-9 w-9 rounded-full object-cover border border-slate-200"
                                                                />
                                                            ) : (
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 font-bold text-white shadow-sm text-xs">
                                                                    {attempt.user_name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-bold text-slate-900">{attempt.user_name}</div>
                                                                <div className="text-xs text-slate-500 font-normal">{attempt.user_email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-slate-800">{attempt.quiz_name}</div>
                                                        <div className="text-xs text-slate-500">{attempt.course_name}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700 border border-rose-200">
                                                            <Icon icon="lucide:timer" className="w-3.5 h-3.5 text-rose-600" />
                                                            <span>{formatRemainingSeconds(attempt.remaining_seconds)}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="font-extrabold text-slate-800">
                                                            {attempt.answered_count} / {attempt.total_questions} Soal
                                                        </div>
                                                        <div className="w-24 bg-slate-200 rounded-full h-1.5 mx-auto mt-1.5 overflow-hidden">
                                                            <div
                                                                className="bg-blue-600 h-1.5 rounded-full"
                                                                style={{ width: `${attempt.total_questions > 0 ? (attempt.answered_count / attempt.total_questions) * 100 : 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="text-lg font-black text-emerald-600">
                                                            {attempt.current_score}
                                                        </span>
                                                        <span className="text-xs text-slate-400 block font-normal">
                                                            ({attempt.correct_count} Benar, {attempt.wrong_count} Salah)
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                                                        <div>{attempt.last_activity_formatted}</div>
                                                        <div className="text-[10px] text-slate-400">Mulai: {attempt.started_at_formatted}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODE LATEST: Hasil Kuis Terbaru Diselesaikan */}
                {mode === 'latest' && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                        <Icon icon="lucide:zap" className="w-5 h-5 text-amber-500" />
                                        <span>Hasil Kuis Paling Baru Diselesaikan</span>
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium">Daftar pengerjaan kuis siswa yang baru saja selesai disubmit (diurutkan dari yang paling baru).</p>
                                </div>
                                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Cari siswa / email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full sm:w-48 rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                                    />

                                    <select
                                        value={selectedQuizId ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            router.get(route('admin.quiz-reports.index'), {
                                                mode: 'latest',
                                                filter_quiz_id: val || undefined,
                                                filter_course_id: selectedCourseId || undefined,
                                            }, { preserveState: true });
                                        }}
                                        className="w-full sm:w-auto rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Kuis</option>
                                        {quizzes.map((quiz) => (
                                            <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={selectedCourseId ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            router.get(route('admin.quiz-reports.index'), {
                                                mode: 'latest',
                                                filter_quiz_id: selectedQuizId || undefined,
                                                filter_course_id: val || undefined,
                                            }, { preserveState: true });
                                        }}
                                        className="w-full sm:w-auto rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Kursus</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>{course.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full sm:w-auto rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="latest">Waktu Terbaru</option>
                                        <option value="oldest">Waktu Terlama</option>
                                        <option value="score_desc">Nilai Tertinggi</option>
                                        <option value="score_asc">Nilai Terendah</option>
                                        <option value="name_asc">Nama (A - Z)</option>
                                        <option value="name_desc">Nama (Z - A)</option>
                                    </select>
                                </div>
                            </div>

                            {filteredRecentAttempts.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">
                                    Belum ada data pengerjaan kuis terbaru.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-600">
                                        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-700">
                                            <tr>
                                                <th className="px-4 py-3 rounded-l-xl">Siswa</th>
                                                <th className="px-4 py-3">Nama Kuis</th>
                                                <th className="px-4 py-3">Kursus</th>
                                                <th className="px-4 py-3">Waktu Selesai</th>
                                                <th className="px-4 py-3 text-center">Nilai</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                                <th className="px-4 py-3 text-right rounded-r-xl">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredRecentAttempts.map((attempt) => (
                                                <tr key={attempt.id} className="hover:bg-slate-50 transition">
                                                    <td className="px-4 py-3 font-semibold text-slate-900">
                                                        <div>{attempt.user_name}</div>
                                                        <div className="text-xs text-slate-500 font-normal">{attempt.user_email}</div>
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-slate-800">{attempt.quiz_name}</td>
                                                    <td className="px-4 py-3 text-slate-600">{attempt.course_name}</td>
                                                    <td className="px-4 py-3 text-slate-500 text-xs font-medium">{attempt.finished_at}</td>
                                                    <td className="px-4 py-3 text-center font-black text-base text-slate-900">{attempt.score}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {attempt.passed ? (
                                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                                Lulus
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                                                                Belum Lulus
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link
                                                            href={route('admin.quiz-reports.review', attempt.id)}
                                                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition inline-block"
                                                        >
                                                            Detail Jawaban →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODE COURSE: 3-Step Hierarchy */}
                {mode === 'course' && currentStep === 1 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Pilih Kursus</h3>
                            <p className="text-sm text-slate-500">Pilih kursus di bawah ini untuk melihat rekapitulasi kuis peserta.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <div>
                                        {course.thumbnail ? (
                                            <div className="h-44 overflow-hidden border-b border-slate-100">
                                                <img
                                                    src={`/storage/${course.thumbnail}`}
                                                    alt={course.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-44 items-center justify-center bg-[#89d0f0] text-slate-900">
                                                <Icon icon="lucide:book-open" className="w-12 h-12" />
                                            </div>
                                        )}

                                        <div className="p-5">
                                            <h4 className="text-lg font-bold text-slate-900">{course.name}</h4>
                                            {course.description && (
                                                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{course.description}</p>
                                            )}

                                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                                                <span className="inline-flex items-center gap-1"><Icon icon="lucide:file-text" className="w-3.5 h-3.5 text-blue-600" /> {course.quizzes_count} Kuis</span>
                                                <span className="inline-flex items-center gap-1"><Icon icon="lucide:users" className="w-3.5 h-3.5 text-emerald-600" /> {course.enrolled_students_count} Peserta</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-5 pb-5 pt-1">
                                        <button
                                            onClick={() => handleSelectCourse(course.id)}
                                            className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                                        >
                                            Lihat Kuis →
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {courses.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500">
                                    Belum ada kursus aktif.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: Pilih Kuis dalam Kursus */}
                {currentStep === 2 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Daftar Kuis: {selectedCourse?.name}
                                </h3>
                                <p className="text-sm text-slate-500">Pilih salah satu kuis untuk melihat laporan rekapitulasi peserta.</p>
                            </div>
                            <button
                                onClick={handleBackToCourses}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
                            >
                                ← Ganti Kursus
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Judul Kuis</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">KKTP / KKM</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Jumlah Soal</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Durasi</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Sudah Mengerjakan</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {quizzes.map((quiz) => (
                                        <tr key={quiz.id} className="transition hover:bg-slate-50">
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {quiz.name}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                                    {quiz.passing_score}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-slate-600">
                                                {quiz.total_questions} Soal
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-slate-600">
                                                {quiz.duration} Menit
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    <Icon icon="lucide:users" className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>{quiz.attempted_students_count} Peserta</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleSelectQuiz(quiz.id)}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
                                                >
                                                    Laporan Hasil →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {quizzes.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                                                Belum ada kuis yang terhubung di kursus ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 3: Tabel Rekapitulasi Peserta */}
                {currentStep === 3 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Hasil: {selectedQuiz?.name}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Kursus: <span className="font-semibold text-slate-700">{selectedCourse?.name}</span>
                                </p>
                            </div>

                            {/* Search, Sort & Status Filters */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari nama / email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2 pl-9 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:w-56 font-medium"
                                    />
                                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="latest">Waktu Terbaru</option>
                                    <option value="oldest">Waktu Terlama</option>
                                    <option value="score_desc">Nilai Tertinggi</option>
                                    <option value="score_asc">Nilai Terendah</option>
                                    <option value="name_asc">Nama (A - Z)</option>
                                    <option value="name_desc">Nama (Z - A)</option>
                                </select>

                                <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                                    <button
                                        onClick={() => setStatusFilter('all')}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                    >
                                        Semua ({participants.length})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('attempted')}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === 'attempted' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                    >
                                        Sudah ({participants.filter(p => p.has_attempted).length})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('not_attempted')}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === 'not_attempted' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                    >
                                        Belum ({participants.filter(p => !p.has_attempted).length})
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama Peserta</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Waktu Selesai</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Nilai Akhir</th>
                                        <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Percobaan</th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {filteredParticipants.map((participant) => {
                                        const attempt = participant.attempt;

                                        return (
                                            <tr key={participant.user_id} className="transition hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {participant.avatar_url ? (
                                                            <img
                                                                src={participant.avatar_url}
                                                                alt={participant.name}
                                                                className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-sm">
                                                                {participant.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold text-slate-900">{participant.name}</div>
                                                            <div className="text-xs text-slate-500">{participant.email}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {participant.has_attempted ? (
                                                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                            Sudah Mengerjakan
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                                                            Belum Mengerjakan
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center text-sm text-slate-600 font-medium">
                                                    {attempt ? attempt.finished_at : '-'}
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {attempt ? (
                                                        <span className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold ${attempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                            {attempt.score}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">-</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                                    {attempt ? `Ke-${attempt.attempt_number}` : '-'}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    {attempt?.id ? (
                                                        <Link
                                                            href={route('admin.quiz-reports.review', attempt.id)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm"
                                                        >
                                                            Detail Jawaban →
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white cursor-not-allowed opacity-40 shadow-sm"
                                                        >
                                                            Detail Jawaban
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {filteredParticipants.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-500">
                                                Tidak ada peserta yang sesuai dengan kriteria filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 4: Modal Detail Jawaban */}
                <Modal show={showDetailModal} onClose={closeModalDetail} maxWidth="4xl">
                    {selectedParticipant && (
                        <div className="p-6">
                            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                                <div className="flex items-center gap-4">
                                    {selectedParticipant.avatar_url ? (
                                        <img
                                            src={selectedParticipant.avatar_url}
                                            alt={selectedParticipant.name}
                                            className="h-12 w-12 rounded-full object-cover border border-slate-200"
                                        />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white text-xl shadow-sm">
                                            {selectedParticipant.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{selectedParticipant.name}</h3>
                                        <p className="text-xs text-slate-500">{selectedParticipant.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModalDetail}
                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Summary stats */}
                            {selectedParticipant.attempt && (
                                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                        <div className="text-xs font-semibold text-slate-500">Nilai Akhir</div>
                                        <div className={`mt-1 text-xl font-bold ${selectedParticipant.attempt.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {selectedParticipant.attempt.score}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                        <div className="text-xs font-semibold text-slate-500">Benar / Salah</div>
                                        <div className="mt-1 text-sm font-bold text-slate-800">
                                            <span className="text-emerald-600">{selectedParticipant.attempt.total_correct}</span> / <span className="text-rose-600">{selectedParticipant.attempt.total_wrong}</span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                        <div className="text-xs font-semibold text-slate-500">Waktu Pengerjaan</div>
                                        <div className="mt-1 text-sm font-bold text-slate-800">
                                            {Math.round(selectedParticipant.attempt.duration_spent / 60)} Menit
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                                        <div className="text-xs font-semibold text-slate-500">Tanggal Selesai</div>
                                        <div className="mt-1 text-xs font-bold text-slate-800">
                                            {selectedParticipant.attempt.finished_at}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Questions list */}
                            <div className="mt-6 max-h-[65vh] overflow-y-auto space-y-5 pr-1">
                                {(selectedParticipant.attempt?.questions_detail ?? []).map((q) => {
                                    const optionRows = [
                                        { key: 'a', label: 'A', value: q.option_a, imageUrl: q.option_a_image_url },
                                        { key: 'b', label: 'B', value: q.option_b, imageUrl: q.option_b_image_url },
                                        { key: 'c', label: 'C', value: q.option_c, imageUrl: q.option_c_image_url },
                                        { key: 'd', label: 'D', value: q.option_d, imageUrl: q.option_d_image_url },
                                        { key: 'e', label: 'E', value: q.option_e, imageUrl: q.option_e_image_url },
                                    ].filter((row) => row.value || row.imageUrl);

                                    return (
                                        <div
                                            key={q.number}
                                            className={`rounded-2xl border p-5 transition ${q.is_correct ? 'border-emerald-200 bg-white' : 'border-rose-200 bg-white'}`}
                                        >
                                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                <span className="text-sm font-bold text-slate-800">Soal Nomor {q.number}</span>
                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${q.is_correct ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                                                    {q.is_correct ? '✓ Benar' : '✗ Salah / Belum Diisi'}
                                                </span>
                                            </div>

                                            {/* Question Body */}
                                            <div className="mt-4 text-sm text-slate-900 leading-relaxed font-medium">
                                                <MathContent content={q.question_text ?? ''} isHtml />
                                            </div>

                                            {q.image_url && (
                                                <div className="mt-3">
                                                    <img
                                                        src={q.image_url}
                                                        alt={`Gambar Soal ${q.number}`}
                                                        className="max-h-64 rounded-xl border border-slate-200 object-contain"
                                                    />
                                                </div>
                                            )}

                                            {/* Options / Answer Type Display */}
                                            {q.question_type === 'matrix_binary' ? (
                                                <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-slate-100 text-slate-700 font-bold">
                                                            <tr>
                                                                <th className="p-2.5">Pernyataan</th>
                                                                <th className="p-2.5 text-center">{q.matrix_left_label || 'Pilihan 1'}</th>
                                                                <th className="p-2.5 text-center">{q.matrix_right_label || 'Pilihan 2'}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 text-slate-800">
                                                            {(q.matrix_rows ?? []).map((row, rIdx) => {
                                                                const userAns = (q.matrix_answers ?? [])[rIdx];
                                                                const correctAns = row.correct_answer;
                                                                return (
                                                                    <tr key={rIdx} className="hover:bg-slate-50">
                                                                        <td className="p-2.5 font-medium">{row.statement}</td>
                                                                        <td className={`p-2.5 text-center font-bold ${userAns === 'left' ? (userAns === correctAns ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50') : (correctAns === 'left' ? 'text-emerald-600 font-extrabold' : 'text-slate-400')}`}>
                                                                            {userAns === 'left' ? (userAns === correctAns ? '✓ (Dijawab)' : '✗ (Dijawab)') : (correctAns === 'left' ? '★ Kunci' : '-')}
                                                                        </td>
                                                                        <td className={`p-2.5 text-center font-bold ${userAns === 'right' ? (userAns === correctAns ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50') : (correctAns === 'right' ? 'text-emerald-600 font-extrabold' : 'text-slate-400')}`}>
                                                                            {userAns === 'right' ? (userAns === correctAns ? '✓ (Dijawab)' : '✗ (Dijawab)') : (correctAns === 'right' ? '★ Kunci' : '-')}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : optionRows.length > 0 ? (
                                                <div className="mt-4 space-y-2">
                                                    {optionRows.map((opt) => {
                                                        const isUserSelected = q.question_type === 'multiple_choice'
                                                            ? (q.selected_options ?? []).includes(opt.key)
                                                            : q.selected_option === opt.key;

                                                        const isKeyCorrect = q.question_type === 'multiple_choice'
                                                            ? (q.correct_options ?? []).includes(opt.key)
                                                            : q.correct_option === opt.key;

                                                        let borderStyle = 'border-slate-200 bg-slate-50/50';
                                                        let badgeText = null;

                                                        if (isUserSelected && isKeyCorrect) {
                                                            borderStyle = 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold';
                                                            badgeText = '✓ Jawaban Siswa (Benar)';
                                                        } else if (isUserSelected && !isKeyCorrect) {
                                                            borderStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold';
                                                            badgeText = '✗ Jawaban Siswa (Salah)';
                                                        } else if (isKeyCorrect) {
                                                            borderStyle = 'border-emerald-300 bg-emerald-50/40 text-emerald-800';
                                                            badgeText = '★ Kunci Jawaban';
                                                        }

                                                        return (
                                                            <div
                                                                key={opt.key}
                                                                className={`flex items-start justify-between gap-3 rounded-xl border p-3 text-xs transition ${borderStyle}`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                                                                        {opt.label}
                                                                    </span>
                                                                    <div>
                                                                        {opt.value && <MathContent content={opt.value} className="text-slate-800" />}
                                                                        {opt.imageUrl && (
                                                                            <img
                                                                                src={opt.imageUrl}
                                                                                alt={`Gambar Opsi ${opt.label}`}
                                                                                className="mt-2 max-h-32 rounded-lg border border-slate-200 object-contain"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {badgeText && (
                                                                    <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${
                                                                        isUserSelected && isKeyCorrect
                                                                            ? 'bg-emerald-600 text-white'
                                                                            : isUserSelected
                                                                            ? 'bg-rose-600 text-white'
                                                                            : 'bg-emerald-100 text-emerald-800'
                                                                    }`}>
                                                                        {badgeText}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}

                                            {/* Summary text */}
                                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                    <div className="font-semibold text-slate-500">Jawaban Peserta:</div>
                                                    <div className="mt-1 font-bold text-slate-900">{q.user_answer ?? '-'}</div>
                                                </div>
                                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
                                                    <div className="font-semibold text-emerald-700">Kunci Jawaban:</div>
                                                    <div className="mt-1 font-bold text-emerald-900">
                                                        {q.correct_option ? String(q.correct_option).toUpperCase() : q.correct_options ? q.correct_options.join(', ').toUpperCase() : '-'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Explanation */}
                                            {q.explanation && (
                                                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs">
                                                    <div className="font-bold text-amber-900 mb-1">💡 Pembahasan / Penjelasan:</div>
                                                    <MathContent content={q.explanation} className="text-amber-900" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={closeModalDetail}
                                    className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
