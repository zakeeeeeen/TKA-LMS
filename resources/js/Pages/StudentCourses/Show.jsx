import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function Show() {
    const { course } = usePage().props;
    const [confirmQuizModal, setConfirmQuizModal] = useState({ open: false, quiz: null });
    const [isStarting, setIsStarting] = useState(false);

    const groupHeaderColors = [
        'bg-orange-500',
        'bg-blue-600',
        'bg-cyan-500',
        'bg-indigo-600',
        'bg-emerald-500',
        'bg-violet-600',
    ];

    const buildGroupItems = (group) => {
        const materials = (group.materials ?? []).map((material) => ({
            id: `material-${material.id}`,
            realId: material.id,
            title: material.title,
            type: 'pdf',
            position: material.position ?? 0,
            href: route('student.courses.materials.show', [course, material]),
            actionLabel: 'Baca Materi',
            actionClassName: 'border border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100',
        }));

        const quizzes = (group.quizzes ?? []).map((quiz) => {
            const hasCompleted = quiz.has_completed || Boolean(quiz.completed_attempt_id);
            const score = quiz.score;

            return {
                id: `quiz-${quiz.id}`,
                realId: quiz.id,
                title: quiz.name,
                type: 'quiz',
                position: quiz.position ?? 0,
                hasCompleted: hasCompleted,
                completedAttemptId: quiz.completed_attempt_id,
                ongoingAttemptId: quiz.ongoing_attempt_id,
                score: score,
                href: hasCompleted
                    ? route('quiz-results.review', quiz.completed_attempt_id)
                    : (quiz.ongoing_attempt_id
                        ? route('quiz-attempts.show', quiz.ongoing_attempt_id)
                        : route('student.packages.show', quiz.id)),
                actionLabel: hasCompleted
                    ? `Nilai: ${score ?? 0}`
                    : (quiz.ongoing_attempt_id ? 'Lanjutkan' : 'Mulai'),
                actionClassName: hasCompleted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-sm'
                    : (quiz.ongoing_attempt_id
                        ? 'bg-blue-600 text-white hover:bg-blue-700 font-semibold'
                        : 'bg-orange-500 text-white hover:bg-orange-600 font-semibold'),
            };
        });

        return [...materials, ...quizzes].sort((a, b) => {
            if (a.position === b.position) {
                return a.type.localeCompare(b.type);
            }

            return a.position - b.position;
        });
    };

    const handleConfirmStartQuiz = () => {
        if (!confirmQuizModal.quiz || isStarting) return;
        setIsStarting(true);
        router.post(
            route('student.packages.start', confirmQuizModal.quiz.realId),
            { course_id: course.id },
            {
                onFinish: () => {
                    setIsStarting(false);
                    setConfirmQuizModal({ open: false, quiz: null });
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {course.name}
                    </h2>
                </div>
            }
        >
            <Head title={course.name} />

            <div className="w-full space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{course.name}</h1>
                </div>

                {course.description && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm leading-6 text-slate-600">{course.description}</p>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {(course.groups ?? []).length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                            Belum ada grup atau materi di kursus ini.
                        </div>
                    ) : (
                        (course.groups ?? []).map((group, index) => {
                            const items = buildGroupItems(group);

                            return (
                                <div key={group.id} className="w-full">
                                    <div
                                        className={`${
                                            groupHeaderColors[index % groupHeaderColors.length]
                                        } px-4 py-2.5 font-bold text-white text-base`}
                                    >
                                        <h3>{group.name}</h3>
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="border-b border-slate-200 px-4 py-3 text-sm text-slate-500 bg-white">
                                            Belum ada konten di group ini.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-200 bg-white">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => {
                                                        if (item.type === 'quiz') {
                                                            if (item.hasCompleted) {
                                                                router.visit(route('quiz-results.review', item.completedAttemptId));
                                                            } else if (item.ongoingAttemptId) {
                                                                router.visit(route('quiz-attempts.show', item.ongoingAttemptId));
                                                            } else {
                                                                setConfirmQuizModal({ open: true, quiz: item });
                                                            }
                                                        } else {
                                                            router.visit(item.href);
                                                        }
                                                    }}
                                                    className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-xs lowercase text-slate-500 mt-0.5">
                                                            {item.type}
                                                        </p>
                                                    </div>

                                                    {item.type === 'quiz' ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (item.hasCompleted) {
                                                                    router.visit(route('quiz-results.review', item.completedAttemptId));
                                                                } else if (item.ongoingAttemptId) {
                                                                    router.visit(route('quiz-attempts.show', item.ongoingAttemptId));
                                                                } else {
                                                                    setConfirmQuizModal({ open: true, quiz: item });
                                                                }
                                                            }}
                                                            className={`shrink-0 rounded-md px-3 py-1.5 text-xs transition ${item.actionClassName}`}
                                                        >
                                                            {item.actionLabel}
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={item.href}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${item.actionClassName}`}
                                                        >
                                                            {item.actionLabel}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <Modal
                show={confirmQuizModal.open}
                onClose={() => !isStarting && setConfirmQuizModal({ open: false, quiz: null })}
                maxWidth="md"
            >
                <div className="p-6">
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <Icon icon="lucide:monitor" className="w-5 h-5 text-blue-600" />
                        <span>Konfirmasi Pengerjaan Quiz</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Apakah Anda yakin mau mulai mengerjakan quiz <span className="font-bold text-slate-900">{confirmQuizModal.quiz?.title}</span>?
                    </p>

                    {/* Warning Box Fullscreen Requirement */}
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                        <div className="flex items-start gap-3">
                            <Icon icon="lucide:alert-triangle" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="text-xs font-semibold leading-relaxed">
                                <span className="font-bold text-amber-950 uppercase tracking-wide block mb-1">PERHATIAN PENTING:</span>
                                Pengerjaan kuis ini <span className="underline font-bold">Wajib dalam Mode Fullscreen (Layar Penuh)</span>. Apabila Anda memaksakan diri keluar dari mode fullscreen saat kuis berlangsung, layar soal akan terkunci dan pengerjaan tidak dapat dilanjutkan sampai Anda masuk kembali ke mode fullscreen.
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setConfirmQuizModal({ open: false, quiz: null })}
                            disabled={isStarting}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmStartQuiz}
                            disabled={isStarting}
                            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
                        >
                            {isStarting ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                'Ya, Kerjakan Sekarang'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
