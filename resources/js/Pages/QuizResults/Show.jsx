import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show() {
    const { result } = usePage().props;

    const statItems = [
        { label: 'Skor', value: result.score, color: 'bg-blue-50 text-blue-700' },
        { label: 'Benar', value: result.total_correct, color: 'bg-emerald-50 text-emerald-700' },
        { label: 'Salah', value: result.total_wrong, color: 'bg-rose-50 text-rose-700' },
        { label: 'Kosong', value: result.total_empty, color: 'bg-amber-50 text-amber-700' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Detail Hasil
                    </h2>
                </div>
            }
        >
            <Head title="Nilai Quiz" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-2xl font-bold text-slate-900">
                        Nilai Quiz Kamu
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                        {result.question_package?.name ?? 'Hasil Quiz'} - {result.course?.name ?? '-'}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {statItems.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="text-sm font-medium text-slate-500">{item.label}</div>
                            <div className={`mt-3 inline-flex rounded-xl px-4 py-2 text-2xl font-bold ${item.color}`}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="text-center">
                        <div className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                            Skor Akhir
                        </div>
                        <div className="mt-4 text-6xl font-bold text-slate-900">
                            {result.score}
                        </div>
                        <div className="mt-3 text-sm leading-7 text-slate-600">
                            Kamu menjawab benar <span className="font-semibold text-slate-900">{result.total_correct}</span> soal,
                            salah <span className="font-semibold text-slate-900">{result.total_wrong}</span> soal,
                            dan kosong <span className="font-semibold text-slate-900">{result.total_empty}</span> soal.
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-3">
                        <Link
                            href={route('quiz-results.review', result.id)}
                            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Lihat Pembahasan
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
