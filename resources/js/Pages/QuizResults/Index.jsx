import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { results } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-slate-800">
                    Hasil Saya
                </h2>
            }
        >
            <Head title="Hasil Quiz" />

            <div className="space-y-4">
                {results.map((result) => (
                    <div key={result.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="text-lg font-semibold text-slate-900">
                                    {result.question_package?.name ?? 'Hasil Quiz'}
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                    {result.course?.name ?? '-'}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                                    Skor {result.score}
                                </div>
                                <Link
                                    href={route('quiz-results.show', result.id)}
                                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                >
                                    Detail
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {results.length === 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
                        Belum ada hasil quiz.
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
