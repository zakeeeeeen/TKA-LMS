import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { questionPackage, existingAttempt, latestCompletedAttemptId, course, availableCourses } = usePage().props;
    const totalQuestions = questionPackage.total_questions ?? questionPackage.questions_count ?? 0;
    const canStart = totalQuestions > 0;
    const hasOngoing = Boolean(existingAttempt && existingAttempt.status === 'ongoing');
    const needsCourseSelection = !course;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-slate-800">
                    Detail Quiz
                </h2>
            }
        >
            <Head title="Detail Quiz" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                            <div className="text-2xl font-bold text-slate-900">{questionPackage.name}</div>
                            {questionPackage.description && (
                                <div className="mt-2 text-sm text-slate-600">{questionPackage.description}</div>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                    {totalQuestions} soal
                                </span>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                                    {questionPackage.duration} menit
                                </span>
                            </div>
                        </div>

                        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto">
                            {course ? (
                                <>
                                    {hasOngoing ? (
                                        <Link
                                            href={route('quiz-attempts.show', existingAttempt.id)}
                                            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            Lanjutkan
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('student.packages.start', { questionPackage: questionPackage.id, course_id: course.id })}
                                            method="post"
                                            as="button"
                                            disabled={!canStart}
                                            className={`inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white ${
                                                canStart ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-slate-300'
                                            }`}
                                        >
                                            Mulai
                                        </Link>
                                    )}

                                    <Link
                                        href={route('quiz-results.index')}
                                        className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                                    >
                                        Riwayat Hasil
                                    </Link>

                                    {latestCompletedAttemptId && (
                                        <Link
                                            href={route('quiz-results.show', latestCompletedAttemptId)}
                                            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                        >
                                            Lihat Hasil Terakhir
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-800">
                                    Quiz ini dipakai di beberapa course. Pilih course dulu di bagian bawah supaya hasilmu tercatat di course yang benar.
                                </div>
                            )}
                        </div>
                    </div>

                    {!canStart && (
                        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Quiz ini belum memiliki soal, jadi belum bisa dimulai.
                        </div>
                    )}
                </div>

                {needsCourseSelection ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-lg font-semibold text-slate-900">Pilih Course</div>
                                <div className="mt-1 text-sm text-slate-600">
                                    Karena hasil quiz dipisah per course, kamu perlu memilih course tempat quiz ini dikerjakan.
                                </div>
                            </div>
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                                {availableCourses?.length ?? 0} course
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {(availableCourses ?? []).map((courseItem) => (
                                <div key={courseItem.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="text-base font-semibold text-slate-900">{courseItem.name}</div>
                                        <div className="mt-1 text-sm text-slate-500">
                                            {courseItem.ongoing_attempt_id
                                                ? 'Kamu punya attempt yang masih berjalan di course ini.'
                                                : courseItem.latest_completed_attempt_id
                                                    ? 'Kamu sudah pernah menyelesaikan quiz ini di course ini.'
                                                    : 'Belum ada attempt di course ini.'}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {courseItem.latest_completed_attempt_id && (
                                            <Link
                                                href={route('quiz-results.show', courseItem.latest_completed_attempt_id)}
                                                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                            >
                                                Lihat Hasil
                                            </Link>
                                        )}

                                        <Link
                                            href={route('student.packages.show', { questionPackage: questionPackage.id, course_id: courseItem.id })}
                                            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                                        >
                                            Masuk via Course
                                        </Link>
                                    </div>
                                </div>
                            ))}

                            {(availableCourses ?? []).length === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500">
                                    Quiz ini belum dimasukkan ke course aktif mana pun.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-lg font-semibold text-slate-900">Status</div>
                                <div className="mt-1 text-sm text-slate-600">
                                    {hasOngoing ? 'Kamu sudah memulai pengerjaan quiz ini.' : 'Belum ada pengerjaan yang berjalan dari quiz ini.'}
                                </div>
                            </div>
                            {existingAttempt && (
                                <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                                    {existingAttempt.status}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
