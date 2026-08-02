import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { results, auth } = usePage().props;
    const isStudent = auth.user.role === 'siswa';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-slate-800">
                    {isStudent ? 'Hasil Exam Lama' : 'Legacy Results'}
                </h2>
            }
        >
            <Head title="Legacy Results" />

            <div className="space-y-4">
                {!isStudent && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <div className="text-sm font-semibold text-amber-900">Modul Hasil Lama</div>
                        <div className="mt-2 text-sm leading-7 text-amber-800">
                            Halaman ini menampilkan hasil dari flow <span className="font-semibold">Legacy Exams</span>.
                            Hasil flow utama siswa sekarang ada di <span className="font-semibold">Quiz Results</span>.
                        </div>
                    </div>
                )}
                {results.map((result) => {
                    const exam = result.exam;
                    const studentName = exam?.students?.[0]?.name ?? '-';

                    return (
                        <div key={result.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="text-lg font-semibold text-slate-900">
                                        {exam?.name ?? exam?.question_package?.name ?? 'Hasil Exam Lama'}
                                    </div>
                                    <div className="mt-1 text-sm text-slate-500">
                                        {exam?.question_package?.name ?? '-'}
                                        {!isStudent && ` • ${studentName}`}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                                        Skor {result.score}
                                    </div>
                                    <Link
                                        href={route('results.show', result.id)}
                                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                    >
                                        Detail
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {results.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
                        Belum ada hasil exam lama.
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
