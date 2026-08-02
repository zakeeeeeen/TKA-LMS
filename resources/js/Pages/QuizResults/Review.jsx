import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MathContent from '@/Components/MathContent';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const initialAiPrompt = 'Bahas soal ini dengan lengkap berdasarkan soal, pilihan jawaban, jawaban saya, dan jawaban yang benar.';
const followUpSuggestions = [
    'Jelaskan lebih sederhana',
    'Kenapa jawaban saya salah?',
    'Beri contoh serupa',
    'Buat latihan 5 soal',
];

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

export default function Review() {
    const { result, questions, canUseGemini } = usePage().props;

    const statItems = [
        { label: 'Skor', value: result.score, color: 'bg-blue-50 text-blue-700' },
        { label: 'Benar', value: result.total_correct, color: 'bg-emerald-50 text-emerald-700' },
        { label: 'Salah', value: result.total_wrong, color: 'bg-rose-50 text-rose-700' },
        { label: 'Kosong', value: result.total_empty, color: 'bg-amber-50 text-amber-700' },
    ];

    const initialMessageState = useMemo(() => {
        const map = {};
        (questions ?? []).forEach((question) => {
            map[question.id] = question.messages ?? [];
        });
        return map;
    }, [questions]);

    const [messagesByQuestion, setMessagesByQuestion] = useState(initialMessageState);
    const [openPembahasanByQuestion, setOpenPembahasanByQuestion] = useState({});
    const [draftByQuestion, setDraftByQuestion] = useState({});
    const [sendingQuestionId, setSendingQuestionId] = useState(null);
    const [sendErrorByQuestion, setSendErrorByQuestion] = useState({});

    const togglePembahasan = (questionId) => {
        setOpenPembahasanByQuestion((current) => ({
            ...current,
            [questionId]: !current[questionId],
        }));
    };

    const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const sendChat = async (questionId, message, appendUserMessage = true) => {
        if (!message.trim() || sendingQuestionId) {
            return;
        }

        setSendingQuestionId(questionId);
        setSendErrorByQuestion((current) => ({ ...current, [questionId]: '' }));

        if (appendUserMessage) {
            const userMessage = {
                id: `local-user-${questionId}-${Date.now()}`,
                role: 'user',
                content: message,
                created_at: new Date().toISOString(),
            };

            setMessagesByQuestion((current) => ({
                ...current,
                [questionId]: [...(current[questionId] ?? []), userMessage],
            }));
        }

        setDraftByQuestion((current) => ({ ...current, [questionId]: '' }));

        try {
            const response = await fetch(route('quiz-results.questions.chat', [result.id, questionId]), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken() ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload?.message || 'Gagal memproses AI. Coba lagi.');
            }

            if (!payload?.message) {
                throw new Error('Respons AI kosong.');
            }

            setMessagesByQuestion((current) => ({
                ...current,
                [questionId]: [...(current[questionId] ?? []), payload.message],
            }));
        } catch (error) {
            if (appendUserMessage) {
                setMessagesByQuestion((current) => ({
                    ...current,
                    [questionId]: (current[questionId] ?? []).filter((messageItem) => !String(messageItem.id).startsWith(`local-user-${questionId}-`)),
                }));
            }

            setSendErrorByQuestion((current) => ({ ...current, [questionId]: error.message || 'Gagal memproses AI.' }));
        } finally {
            setSendingQuestionId(null);
        }
    };

    const getAnswerState = (question) => {
        if (question.question_type === 'multiple_choice') {
            const values = question.answer?.selected_options ?? [];
            if (!values.length) {
                return 'empty';
            }

            return question.answer?.is_correct ? 'correct' : 'wrong';
        }

        if (question.question_type === 'matrix_binary') {
            const values = question.answer?.matrix_answers ?? [];
            if (!values.length || values.includes(null)) {
                return 'empty';
            }
            return question.answer?.is_correct ? 'correct' : 'wrong';
        }

        if (question.question_type === 'essay') {
            const value = (question.answer?.answer_text ?? '').trim();
            if (!value) {
                return 'empty';
            }

            return question.answer?.is_correct ? 'correct' : 'wrong';
        }

        const selected = question.answer?.selected_option ?? null;
        if (!selected) {
            return 'empty';
        }

        return question.answer?.is_correct ? 'correct' : 'wrong';
    };

    const badge = (state) => {
        if (state === 'correct') {
            return { label: 'Benar', className: 'bg-emerald-50 text-emerald-700' };
        }

        if (state === 'wrong') {
            return { label: 'Salah', className: 'bg-rose-50 text-rose-700' };
        }

        return { label: 'Kosong', className: 'bg-amber-50 text-amber-700' };
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const totalQuestions = (questions ?? []).length;
    const totalPages = Math.ceil(totalQuestions / itemsPerPage) || 1;

    const currentQuestions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return (questions ?? []).slice(start, start + itemsPerPage);
    }, [questions, currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Pembahasan Quiz
                    </h2>
                </div>
            }
        >
            <Head title="Pembahasan Quiz" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-2xl font-bold text-slate-900">
                        {result.question_package?.name ?? 'Hasil Quiz'}
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                        Course: {result.course?.name ?? '-'}
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

                {/* Pagination Controls Top */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                        <div className="text-xs font-bold text-slate-600">
                            Menampilkan Soal <span className="text-slate-900 font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 font-black">{Math.min(currentPage * itemsPerPage, totalQuestions)}</span> dari <span className="text-slate-900 font-black">{totalQuestions}</span> Soal
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ← Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`h-9 min-w-[36px] rounded-xl text-xs font-extrabold transition shadow-sm ${
                                        currentPage === page
                                            ? 'bg-slate-900 text-white shadow'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {currentQuestions.map((question, relativeIndex) => {
                        const index = (currentPage - 1) * itemsPerPage + relativeIndex;
                        const state = getAnswerState(question);
                        const badgeInfo = badge(state);
                        const isCorrectAnswer = state === 'correct';
                        const cardBorderClass = isCorrectAnswer
                            ? 'border-2 border-emerald-500'
                            : 'border-2 border-rose-500';

                        const isOpen = Boolean(openPembahasanByQuestion[question.id]);
                        const selected = (question.answer?.selected_option ?? '').toLowerCase();
                        const correctOption = (question.correct_option ?? '').toLowerCase();
                        const selectedOptions = (question.answer?.selected_options ?? []).map((value) => String(value).toLowerCase());
                        const correctOptions = (question.correct_options ?? []).map((value) => String(value).toLowerCase());
                        const messages = messagesByQuestion[question.id] ?? [];
                        const visibleMessages = messages.filter((message) => !(message.role === 'user' && message.content === initialAiPrompt));
                        const assistantMessages = messages.filter((message) => message.role === 'assistant');
                        const latestAssistantMessage = assistantMessages[assistantMessages.length - 1] ?? null;
                        const studentAnswerLabel = question.question_type === 'multiple_choice'
                            ? formatOptionList(question.answer?.selected_options)
                            : question.question_type === 'matrix_binary'
                                ? formatMatrixAnswers(question, question.answer?.matrix_answers)
                                : question.question_type === 'essay'
                            ? ((question.answer?.answer_text ?? '').trim() || '-')
                            : ((question.answer?.selected_option ?? '').toUpperCase() || '-');
                        const correctAnswerLabel = question.question_type === 'multiple_choice'
                            ? formatOptionList(question.correct_options)
                            : question.question_type === 'matrix_binary'
                                ? formatMatrixAnswers(question, (question.matrix_rows ?? []).map((row) => row.correct_answer))
                                : question.question_type === 'essay'
                            ? ((question.correct_answer_text ?? '').trim() || '-')
                            : ((question.correct_option ?? '').toUpperCase() || '-');

                        return (
                            <div key={question.id} className={`rounded-2xl bg-white p-6 shadow-sm ${cardBorderClass}`}>
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-slate-500">Soal {index + 1}</div>
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                            <span className={`rounded-full px-3 py-1 font-semibold ${badgeInfo.className}`}>
                                                {badgeInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <MathContent
                                        content={question.question_text ?? ''}
                                        isHtml
                                        className="prose prose-slate max-w-none text-slate-800"
                                    />

                                    {question.image_url && (
                                        <div className="mt-4">
                                            <img
                                                src={question.image_url}
                                                alt="Gambar soal"
                                                className="max-h-[420px] rounded-2xl border border-slate-200 object-contain"
                                            />
                                        </div>
                                    )}
                                </div>

                                {question.question_type === 'matrix_binary' ? (
                                    <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pernyataan</th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                        {question.matrix_left_label || 'Kiri'}
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                        {question.matrix_right_label || 'Kanan'}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white">
                                                {(question.matrix_rows ?? []).map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        <td className="px-4 py-4 font-semibold text-slate-700">{rowIndex + 1}</td>
                                                        <td className="px-4 py-4">
                                                            <MathContent
                                                                content={row.statement ?? ''}
                                                                className="whitespace-pre-wrap text-sm text-slate-800"
                                                            />
                                                        </td>
                                                        <td className={`px-4 py-4 text-center text-sm font-semibold ${
                                                            (question.answer?.matrix_answers ?? [])[rowIndex] === 'left'
                                                                ? row.correct_answer === 'left'
                                                                    ? 'bg-emerald-50 text-emerald-700'
                                                                    : 'bg-rose-50 text-rose-700'
                                                                : row.correct_answer === 'left'
                                                                    ? 'text-slate-700'
                                                                    : 'text-slate-400'
                                                        }`}>
                                                            {(question.answer?.matrix_answers ?? [])[rowIndex] === 'left' ? 'Jawabanmu' : row.correct_answer === 'left' ? 'Benar' : ''}
                                                        </td>
                                                        <td className={`px-4 py-4 text-center text-sm font-semibold ${
                                                            (question.answer?.matrix_answers ?? [])[rowIndex] === 'right'
                                                                ? row.correct_answer === 'right'
                                                                    ? 'bg-emerald-50 text-emerald-700'
                                                                    : 'bg-rose-50 text-rose-700'
                                                                : row.correct_answer === 'right'
                                                                    ? 'text-slate-700'
                                                                    : 'text-slate-400'
                                                        }`}>
                                                            {(question.answer?.matrix_answers ?? [])[rowIndex] === 'right' ? 'Jawabanmu' : row.correct_answer === 'right' ? 'Benar' : ''}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : question.question_type === 'essay' ? (
                                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <div className="text-sm font-semibold text-slate-700">Jawaban Kamu</div>
                                            <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                                                {(question.answer?.answer_text ?? '').trim() || '-'}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                            <div className="text-sm font-semibold text-slate-700">Jawaban Benar</div>
                                            <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                                                {(question.correct_answer_text ?? '').trim() || '-'}
                                            </div>
                                        </div>
                                    </div>
                                ) : question.question_type === 'multiple_choice' ? (
                                    <div className="mt-6 space-y-3">
                                        {optionRows(question).map((row) => {
                                            const isCorrect = correctOptions.includes(row.key);
                                            const isSelected = selectedOptions.includes(row.key);

                                            const base = 'flex items-start gap-4 rounded-2xl border px-4 py-4 text-left';
                                            const style = isCorrect
                                                ? 'border-emerald-200 bg-emerald-50'
                                                : isSelected
                                                    ? 'border-rose-200 bg-rose-50'
                                                    : 'border-slate-200 bg-white';

                                            const badgeColor = isCorrect
                                                ? 'bg-emerald-600 text-white'
                                                : isSelected
                                                    ? 'bg-rose-600 text-white'
                                                    : 'bg-slate-100 text-slate-700';

                                            return (
                                                <div key={row.key} className={`${base} ${style}`}>
                                                    <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${badgeColor}`}>
                                                        {row.label}
                                                    </span>
                                                    <div className="flex-1 text-sm leading-6 text-slate-800">
                                                        {row.value && (
                                                            <MathContent
                                                                content={row.value}
                                                                className="whitespace-pre-wrap"
                                                            />
                                                        )}
                                                        {row.imageUrl && (
                                                            <img
                                                                src={row.imageUrl}
                                                                alt={`Opsi ${row.label}`}
                                                                className="mt-3 max-h-40 rounded-xl border border-slate-200 object-contain"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 text-xs font-semibold text-slate-600">
                                                        {isCorrect ? 'Kunci' : isSelected ? 'Jawabanmu' : ''}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="mt-6 space-y-3">
                                        {optionRows(question).map((row) => {
                                            const isCorrect = row.key === correctOption;
                                            const isSelected = row.key === selected;

                                            const base = 'flex items-start gap-4 rounded-2xl border px-4 py-4 text-left';
                                            const style = isCorrect
                                                ? 'border-emerald-200 bg-emerald-50'
                                                : isSelected
                                                    ? 'border-rose-200 bg-rose-50'
                                                    : 'border-slate-200 bg-white';

                                            const badgeColor = isCorrect
                                                ? 'bg-emerald-600 text-white'
                                                : isSelected
                                                    ? 'bg-rose-600 text-white'
                                                    : 'bg-slate-100 text-slate-700';

                                            return (
                                                <div key={row.key} className={`${base} ${style}`}>
                                                    <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${badgeColor}`}>
                                                        {row.label}
                                                    </span>
                                                    <div className="flex-1 text-sm leading-6 text-slate-800">
                                                        {row.value && (
                                                            <MathContent
                                                                content={row.value}
                                                                className="whitespace-pre-wrap"
                                                            />
                                                        )}
                                                        {row.imageUrl && (
                                                            <img
                                                                src={row.imageUrl}
                                                                alt={`Opsi ${row.label}`}
                                                                className="mt-3 max-h-40 rounded-xl border border-slate-200 object-contain"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="shrink-0 text-xs font-semibold text-slate-600">
                                                        {isCorrect ? 'Benar' : isSelected ? 'Jawabanmu' : ''}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div
                                        onClick={() => togglePembahasan(question.id)}
                                        className="flex cursor-pointer items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 transition hover:bg-slate-100/80"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-slate-900">Pembahasan</span>
                                            {isOpen && (
                                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                                    Terbuka
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                        >
                                            {isOpen ? 'Sembunyikan Pembahasan ▲' : 'Lihat Pembahasan ▼'}
                                        </button>
                                    </div>

                                    {isOpen && (
                                        <div>
                                            {(question.explanation ?? '').trim() && (
                                                <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
                                                    <MathContent
                                                        content={question.explanation}
                                                        className="whitespace-pre-wrap text-sm leading-7 text-slate-800"
                                                    />
                                                </div>
                                            )}

                                            <div className="grid gap-4 border-b border-slate-100 px-6 py-5 md:grid-cols-2">
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jawaban Anda</div>
                                                    <div className="mt-2 whitespace-pre-wrap text-sm font-semibold text-slate-900">{studentAnswerLabel}</div>
                                                </div>
                                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                                                    <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Jawaban Benar</div>
                                                    <div className="mt-2 whitespace-pre-wrap text-sm font-semibold text-emerald-900">{correctAnswerLabel}</div>
                                                </div>
                                            </div>

                                            {!latestAssistantMessage ? (
                                                <div className="px-6 py-5">
                                                    <button
                                                        type="button"
                                                        disabled={!canUseGemini || sendingQuestionId === question.id}
                                                        onClick={() => sendChat(question.id, initialAiPrompt, false)}
                                                        className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                                                    >
                                                        {sendingQuestionId === question.id ? 'AI sedang membahas...' : 'Bahas dengan AI'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 px-6 py-5">
                                                    {visibleMessages.map((message) => {
                                                        const isAssistant = message.role === 'assistant';

                                                        return (
                                                            <div key={message.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                                                                <div
                                                                    className={`max-w-full rounded-2xl px-4 py-3 text-sm leading-7 md:max-w-[90%] ${
                                                                        isAssistant
                                                                            ? 'border border-blue-100 bg-blue-50 text-slate-800'
                                                                            : 'border border-slate-200 bg-slate-100 text-slate-800'
                                                                    }`}
                                                                >
                                                                    <div className={`mb-1 text-xs font-semibold ${isAssistant ? 'text-blue-700' : 'text-slate-500'}`}>
                                                                        {isAssistant ? 'AI' : 'Kamu'}
                                                                    </div>
                                                                    <MathContent content={message.content} isMarkdown className="leading-7 text-slate-800" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    <div className="flex flex-wrap gap-2">
                                                        {followUpSuggestions.map((preset) => (
                                                            <button
                                                                key={preset}
                                                                type="button"
                                                                disabled={!canUseGemini || sendingQuestionId === question.id}
                                                                onClick={() => sendChat(question.id, preset)}
                                                                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {preset}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="flex flex-col gap-3 md:flex-row">
                                                        <input
                                                            value={draftByQuestion[question.id] ?? ''}
                                                            onChange={(event) => setDraftByQuestion((current) => ({ ...current, [question.id]: event.target.value }))}
                                                            onKeyDown={(event) => {
                                                                if (event.key === 'Enter' && !event.shiftKey) {
                                                                    event.preventDefault();
                                                                    sendChat(question.id, draftByQuestion[question.id] ?? '');
                                                                }
                                                            }}
                                                            disabled={!canUseGemini || sendingQuestionId === question.id}
                                                            placeholder="Masih bingung? Tulis pertanyaan ke AI di sini..."
                                                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-slate-50"
                                                        />
                                                        <button
                                                            type="button"
                                                            disabled={!canUseGemini || sendingQuestionId === question.id}
                                                            onClick={() => sendChat(question.id, draftByQuestion[question.id] ?? '')}
                                                            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {sendingQuestionId === question.id ? 'Mengirim...' : 'Kirim'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {sendErrorByQuestion[question.id] && (
                                                <div className="border-t border-slate-100 px-6 py-5">
                                                    <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                                        {sendErrorByQuestion[question.id]}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination Controls Bottom */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm mt-6">
                        <div className="text-xs font-bold text-slate-600">
                            Menampilkan Soal <span className="text-slate-900 font-black">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900 font-black">{Math.min(currentPage * itemsPerPage, totalQuestions)}</span> dari <span className="text-slate-900 font-black">{totalQuestions}</span> Soal
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ← Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`h-9 min-w-[36px] rounded-xl text-xs font-extrabold transition shadow-sm ${
                                        currentPage === page
                                            ? 'bg-slate-900 text-white shadow'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
