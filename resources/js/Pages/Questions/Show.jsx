import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MathContent from '@/Components/MathContent';
import { Head, Link } from '@inertiajs/react';

const typeLabels = {
    single_choice: 'Pilihan Ganda 1 Jawaban',
    multiple_choice: 'Pilihan Ganda Multi Jawaban',
    matrix_binary: 'Tabel 2 Kolom',
    essay: 'Isian / Essay',
};

export default function Show({ question }) {
    const optionList = [
        { label: 'A', text: question.option_a, imageUrl: question.option_a_image_url, key: 'a' },
        { label: 'B', text: question.option_b, imageUrl: question.option_b_image_url, key: 'b' },
        { label: 'C', text: question.option_c, imageUrl: question.option_c_image_url, key: 'c' },
        { label: 'D', text: question.option_d, imageUrl: question.option_d_image_url, key: 'd' },
        { label: 'E', text: question.option_e, imageUrl: question.option_e_image_url, key: 'e' },
    ].filter((item) => item.text || item.imageUrl);

    const correctOption = (question.correct_option ?? '').toLowerCase();
    const correctOptions = (question.correct_options ?? []).map((val) => String(val).toLowerCase());

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('questions.index')}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                            ← Kembali
                        </Link>
                        <h2 className="text-2xl font-bold text-slate-800">
                            Detail Soal #{question.id}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('questions.edit', question.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
                        >
                            Edit Soal
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Detail Soal #${question.id}`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            Subject: {question.subject?.name ?? 'Tanpa Subject'}
                        </span>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                            Tingkat: {question.grade_level ?? 'SD'}
                        </span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Tipe: {typeLabels[question.question_type] ?? question.question_type}
                        </span>
                    </div>

                    <div>
                        <div className="text-sm font-semibold text-slate-500 mb-2">Isi Soal:</div>
                        <MathContent
                            content={question.question_text ?? ''}
                            isHtml
                            className="prose prose-slate max-w-none text-slate-900 text-base leading-7"
                        />

                        {question.image_url && (
                            <div className="mt-4">
                                <img
                                    src={question.image_url}
                                    alt="Gambar Soal"
                                    className="max-h-80 rounded-2xl border border-slate-200 object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {question.question_type === 'matrix_binary' ? (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">Pernyataan</th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                                            {question.matrix_left_label || 'Kiri'}
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-500">
                                            {question.matrix_right_label || 'Kanan'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {(question.matrix_rows ?? []).map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">{idx + 1}</td>
                                            <td className="px-4 py-3 text-sm text-slate-800">
                                                <MathContent content={row.statement ?? ''} />
                                            </td>
                                            <td className={`px-4 py-3 text-center text-xs font-semibold ${row.correct_answer === 'left' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'}`}>
                                                {row.correct_answer === 'left' ? '✓ Kunci' : '-'}
                                            </td>
                                            <td className={`px-4 py-3 text-center text-xs font-semibold ${row.correct_answer === 'right' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400'}`}>
                                                {row.correct_answer === 'right' ? '✓ Kunci' : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : question.question_type === 'essay' ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="text-xs font-semibold uppercase text-emerald-700">Kunci / Jawaban Benar</div>
                            <div className="mt-2 text-sm font-semibold text-emerald-900 whitespace-pre-wrap">
                                {question.correct_answer_text || '-'}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-sm font-semibold text-slate-500">Pilihan Jawaban:</div>
                            {optionList.map((opt) => {
                                const isCorrect = question.question_type === 'multiple_choice'
                                    ? correctOptions.includes(opt.key)
                                    : opt.key === correctOption;

                                return (
                                    <div
                                        key={opt.key}
                                        className={`flex items-start gap-4 rounded-2xl border p-4 ${
                                            isCorrect ? 'border-emerald-300 bg-emerald-50/80' : 'border-slate-200 bg-white'
                                        }`}
                                    >
                                        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {opt.label}
                                        </span>
                                        <div className="flex-1 text-sm leading-6 text-slate-800">
                                            {opt.text && <MathContent content={opt.text} className="whitespace-pre-wrap" />}
                                            {opt.imageUrl && (
                                                <img
                                                    src={opt.imageUrl}
                                                    alt={`Opsi ${opt.label}`}
                                                    className="mt-2 max-h-36 rounded-xl border border-slate-200 object-contain"
                                                />
                                            )}
                                        </div>
                                        {isCorrect && (
                                            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                                                Kunci Jawaban
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-sm font-semibold text-slate-700">Pembahasan / Penjelasan:</div>
                        {question.explanation ? (
                            <MathContent
                                content={question.explanation}
                                className="mt-2 text-sm leading-7 text-slate-700 whitespace-pre-wrap"
                            />
                        ) : (
                            <div className="mt-2 text-sm text-slate-400 italic">Belum ada pembahasan.</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
