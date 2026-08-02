import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MathContent from '@/Components/MathContent';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const optionRows = (question) => {
    return [
        { key: 'a', label: 'A', value: question.option_a, imageUrl: question.option_a_image_url },
        { key: 'b', label: 'B', value: question.option_b, imageUrl: question.option_b_image_url },
        { key: 'c', label: 'C', value: question.option_c, imageUrl: question.option_c_image_url },
        { key: 'd', label: 'D', value: question.option_d, imageUrl: question.option_d_image_url },
        { key: 'e', label: 'E', value: question.option_e, imageUrl: question.option_e_image_url },
    ].filter((row) => row.value || row.imageUrl);
};

const formatOptionList = (values) => {
    const normalized = (values ?? []).filter(Boolean).map((value) => String(value).toUpperCase());
    return normalized.length ? normalized.join(', ') : '-';
};

const formatMatrixAnswers = (question, answers) => {
    const leftLabel = question.matrix_left_label || 'Kiri';
    const rightLabel = question.matrix_right_label || 'Kanan';
    const rows = question.matrix_rows ?? [];
    const normalizedAnswers = answers ?? [];

    if (!rows.length) {
        return '-';
    }

    return rows.map((row, index) => {
        const value = normalizedAnswers[index];
        const label = value === 'right' ? rightLabel : value === 'left' ? leftLabel : '-';
        return `${index + 1}. ${label}`;
    }).join('\n');
};

export default function Review({ result, questions }) {
    const [openPembahasanByQuestion, setOpenPembahasanByQuestion] = useState({});

    const togglePembahasan = (questionId) => {
        setOpenPembahasanByQuestion((current) => ({
            ...current,
            [questionId]: !current[questionId],
        }));
    };

    const statItems = [
        { label: 'Skor', value: result.score, color: 'bg-blue-50 text-blue-700' },
        { label: 'Benar', value: result.total_correct, color: 'bg-emerald-50 text-emerald-700' },
        { label: 'Salah', value: result.total_wrong, color: 'bg-rose-50 text-rose-700' },
        { label: 'Kosong', value: result.total_empty, color: 'bg-amber-50 text-amber-700' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">
                            Detail Jawaban Peserta
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Siswa: <span className="font-bold text-slate-800">{result.user?.name}</span> ({result.user?.email})
                        </p>
                    </div>

                    <Link
                        href={route('admin.quiz-reports.index')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                    >
                        <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Kembali ke Laporan Kuis
                    </Link>
                </div>
            }
        >
            <Head title={`Review Jawaban: ${result.user?.name}`} />

            <div className="space-y-6">
                {/* Information Header Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-4">
                            {result.user?.avatar_url ? (
                                <img
                                    src={result.user.avatar_url}
                                    alt={result.user.name}
                                    className="h-14 w-14 rounded-full object-cover border border-slate-200"
                                />
                            ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white text-2xl shadow-sm">
                                    {result.user?.name?.charAt(0).toUpperCase() || 'S'}
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900">{result.user?.name}</h3>
                                <div className="text-xs text-slate-500 font-medium">{result.user?.email}</div>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                                        <Icon icon="lucide:file-text" className="w-3 h-3" /> {result.questionPackage?.name}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                                        <Icon icon="lucide:book-open" className="w-3 h-3" /> {result.course?.name || 'Kuis Mandiri'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right text-xs font-medium text-slate-500">
                            <div>Selesai: <span className="font-bold text-slate-800">{result.finished_at}</span></div>
                            {result.duration_spent && (
                                <div>Durasi: <span className="font-bold text-slate-800">{Math.round(result.duration_spent / 60)} Menit</span></div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {statItems.map((item) => (
                            <div key={item.label} className={`rounded-xl p-4 text-center ${item.color}`}>
                                <div className="text-xs font-bold uppercase tracking-wider opacity-80">{item.label}</div>
                                <div className="mt-1 text-2xl font-black">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Question Cards List */}
                <div className="space-y-6">
                    {(questions ?? []).map((question, index) => {
                        const answer = question.answer;
                        const isCorrect = Boolean(answer?.is_correct);

                        let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                        let statusLabel = 'Salah / Kosong';

                        if (isCorrect) {
                            badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            statusLabel = 'Benar';
                        }

                        const options = optionRows(question);
                        const isPembahasanOpen = Boolean(openPembahasanByQuestion[question.id]);

                        return (
                            <div key={question.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-black text-white">
                                            Soal #{index + 1}
                                        </span>
                                        {question.subject && (
                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                                {question.subject}
                                            </span>
                                        )}
                                    </div>

                                    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeColor}`}>
                                        {statusLabel}
                                    </span>
                                </div>

                                <div className="mt-4 text-slate-900 leading-relaxed font-medium">
                                    <MathContent content={question.question_text ?? ''} isHtml />
                                </div>

                                {question.image_url && (
                                    <div className="mt-4">
                                        <img
                                            src={question.image_url}
                                            alt={`Gambar Soal ${index + 1}`}
                                            className="max-h-72 rounded-xl border border-slate-200 object-contain"
                                        />
                                    </div>
                                )}

                                {/* Question Options */}
                                {question.question_type === 'matrix_binary' ? (
                                    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 text-slate-700 font-bold">
                                                <tr>
                                                    <th className="p-3">Pernyataan</th>
                                                    <th className="p-3 text-center">{question.matrix_left_label || 'Pilihan 1'}</th>
                                                    <th className="p-3 text-center">{question.matrix_right_label || 'Pilihan 2'}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-800">
                                                {(question.matrix_rows ?? []).map((row, rIdx) => {
                                                    const userAns = (answer?.matrix_answers ?? [])[rIdx];
                                                    const correctAns = row.correct_answer;
                                                    return (
                                                        <tr key={rIdx} className="hover:bg-slate-50">
                                                            <td className="p-3 font-medium">{row.statement}</td>
                                                            <td className={`p-3 text-center font-bold ${userAns === 'left' ? (userAns === correctAns ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50') : (correctAns === 'left' ? 'text-emerald-600 font-extrabold' : 'text-slate-400')}`}>
                                                                {userAns === 'left' ? (userAns === correctAns ? '✓ (Dijawab)' : '✗ (Dijawab)') : (correctAns === 'left' ? '★ Kunci' : '-')}
                                                            </td>
                                                            <td className={`p-3 text-center font-bold ${userAns === 'right' ? (userAns === correctAns ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50') : (correctAns === 'right' ? 'text-emerald-600 font-extrabold' : 'text-slate-400')}`}>
                                                                {userAns === 'right' ? (userAns === correctAns ? '✓ (Dijawab)' : '✗ (Dijawab)') : (correctAns === 'right' ? '★ Kunci' : '-')}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : options.length > 0 ? (
                                    <div className="mt-6 space-y-3">
                                        {options.map((opt) => {
                                            const isUserSelected = question.question_type === 'multiple_choice'
                                                ? (answer?.selected_options ?? []).includes(opt.key)
                                                : answer?.selected_option === opt.key;

                                            const isKeyCorrect = question.question_type === 'multiple_choice'
                                                ? (question.correct_options ?? []).includes(opt.key)
                                                : question.correct_option === opt.key;

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
                                                    className={`flex items-start justify-between gap-4 rounded-xl border p-4 text-xs transition ${borderStyle}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                                                            {opt.label}
                                                        </span>
                                                        <div>
                                                            {opt.value && <MathContent content={opt.value} className="text-slate-800 text-sm" />}
                                                            {opt.imageUrl && (
                                                                <img
                                                                    src={opt.imageUrl}
                                                                    alt={`Gambar Opsi ${opt.label}`}
                                                                    className="mt-2 max-h-40 rounded-lg border border-slate-200 object-contain"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {badgeText && (
                                                        <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-bold ${
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

                                {/* Answer Summary Grid */}
                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="font-semibold text-slate-500">Jawaban Peserta:</div>
                                        <div className="mt-1 font-bold text-slate-900 text-sm">
                                            {question.question_type === 'matrix_binary'
                                                ? <pre className="font-sans whitespace-pre-wrap">{formatMatrixAnswers(question, answer?.matrix_answers)}</pre>
                                                : question.question_type === 'multiple_choice'
                                                ? formatOptionList(answer?.selected_options)
                                                : answer?.selected_option ? answer.selected_option.toUpperCase() : '-'}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                                        <div className="font-semibold text-emerald-700">Kunci Jawaban:</div>
                                        <div className="mt-1 font-bold text-emerald-900 text-sm">
                                            {question.question_type === 'matrix_binary'
                                                ? <pre className="font-sans whitespace-pre-wrap">{formatMatrixAnswers(question, (question.matrix_rows ?? []).map(r => r.correct_answer))}</pre>
                                                : question.question_type === 'multiple_choice'
                                                ? formatOptionList(question.correct_options)
                                                : question.correct_option ? String(question.correct_option).toUpperCase() : '-'}
                                        </div>
                                    </div>
                                </div>

                                {/* Pembahasan Button & Content */}
                                <div className="mt-6 border-t border-slate-100 pt-4">
                                    <button
                                        onClick={() => togglePembahasan(question.id)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                                    >
                                        <Icon icon="lucide:lightbulb" className="w-4 h-4 text-amber-500" />
                                        <span>{isPembahasanOpen ? 'Sembunyikan Pembahasan' : 'Lihat Pembahasan'}</span>
                                    </button>

                                    {isPembahasanOpen && (
                                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs">
                                            <div className="font-extrabold text-amber-900 text-sm mb-2">Penjelasan / Pembahasan:</div>
                                            {question.explanation ? (
                                                <MathContent content={question.explanation} className="text-amber-950 leading-relaxed" />
                                            ) : (
                                                <div className="text-amber-700 italic">Belum ada teks pembahasan khusus untuk soal ini.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
