import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MathContent from '@/Components/MathContent';
import Modal from '@/Components/Modal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const optionLabels = ['a', 'b', 'c', 'd', 'e'];

const getOptionRows = (question) => optionLabels
    .map((option) => ({
        key: option,
        label: option.toUpperCase(),
        value: question?.[`option_${option}`],
        imageUrl: question?.[`option_${option}_image_url`],
    }))
    .filter((row) => row.value || row.imageUrl);

const getDefaultAnswer = (question) => ({
    selected_option: null,
    selected_options: [],
    matrix_answers: (question?.matrix_rows ?? []).map(() => null),
    answer_text: '',
    is_marked: false,
});

const isQuestionAnswered = (question, answer) => {
    if (!question || !answer) {
        return false;
    }

    if (question.question_type === 'multiple_choice') {
        return (answer.selected_options ?? []).length > 0;
    }

    if (question.question_type === 'matrix_binary') {
        return (answer.matrix_answers ?? []).some((val) => val !== null);
    }

    if (question.question_type === 'essay') {
        return Boolean((answer.answer_text ?? '').trim());
    }

    return Boolean(answer.selected_option);
};

export default function Take() {
    const { attempt, questions, answers: initialAnswers } = usePage().props;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState(initialAnswers ?? {});
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(() => {
        if (!attempt.end_time) {
            return attempt.duration * 60;
        }

        const target = new Date(attempt.end_time).getTime();
        return Math.max(0, Math.floor((target - Date.now()) / 1000));
    });
    const isFinishingRef = useRef(false);

    const [fontSize, setFontSize] = useState('base');

    const fontSizeClass = {
        sm: 'text-sm leading-6',
        base: 'text-base leading-7',
        lg: 'text-xl leading-8',
    }[fontSize];

    const currentQuestion = questions[currentIndex];
    const currentAnswer = {
        ...getDefaultAnswer(currentQuestion),
        ...(answers[currentQuestion?.id] ?? {}),
    };

    useEffect(() => {
        if (remainingSeconds <= 0 || isFinishingRef.current) {
            return;
        }

        const timer = window.setInterval(() => {
            setRemainingSeconds((value) => {
                if (value <= 1) {
                    window.clearInterval(timer);
                    isFinishingRef.current = true;
                    router.post(route('quiz-attempts.finish', attempt.id));
                    return 0;
                }

                return value - 1;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [remainingSeconds, attempt.id]);

    const isFullscreenSupported = typeof document !== 'undefined' && Boolean(
        document.documentElement.requestFullscreen ||
        document.documentElement.webkitRequestFullscreen ||
        document.documentElement.msRequestFullscreen
    );

    const [isFullscreen, setIsFullscreen] = useState(true);

    const requestFullscreen = () => {
        if (!isFullscreenSupported) return;
        const element = document.documentElement;
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(() => {});
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    };

    useEffect(() => {
        if (!isFullscreenSupported) {
            setIsFullscreen(true);
            return;
        }

        // Initial check on mount
        const initialIsFull = Boolean(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
        setIsFullscreen(initialIsFull);
        requestFullscreen();

        const handleFullscreenChange = () => {
            const isFull = Boolean(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsFullscreen(isFull);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        const preventCopy = (e) => {
            e.preventDefault();
        };

        const preventRefreshKeys = (e) => {
            // Prevent F5, Ctrl+F5, Ctrl+R, Cmd+R
            if (
                e.key === 'F5' ||
                (e.ctrlKey && e.key === 'r') ||
                (e.ctrlKey && e.key === 'R') ||
                (e.ctrlKey && e.key === 'F5') ||
                (e.metaKey && e.key === 'r')
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener('copy', preventCopy);
        document.addEventListener('cut', preventCopy);
        document.addEventListener('contextmenu', preventCopy);
        document.addEventListener('keydown', preventRefreshKeys);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            document.removeEventListener('copy', preventCopy);
            document.removeEventListener('cut', preventCopy);
            document.removeEventListener('contextmenu', preventCopy);
            document.removeEventListener('keydown', preventRefreshKeys);
        };
    }, []);

    const summary = useMemo(() => {
        const answered = questions.filter((question) => isQuestionAnswered(question, answers[question.id])).length;

        const marked = questions.filter((question) => answers[question.id]?.is_marked).length;

        return {
            answered,
            marked,
            empty: questions.length - answered,
        };
    }, [answers, questions]);

    const formatTime = (seconds) => {
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');

        return `${hours}:${minutes}:${secs}`;
    };

    const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const saveAnswer = async (questionId, payload, successText = 'Jawaban tersimpan.') => {
        setIsSaving(true);
        setSaveMessage('Menyimpan...');

        try {
            const response = await fetch(route('quiz-attempts.answer', attempt.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken() ?? '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    question_id: questionId,
                    ...payload,
                }),
            });

            if (!response.ok) {
                throw new Error('Gagal menyimpan jawaban.');
            }

            setSaveMessage(successText);
        } catch (error) {
            setSaveMessage(error.message || 'Gagal menyimpan jawaban.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateLocalAnswer = (questionId, changes) => {
        const question = questions.find((item) => item.id === questionId);
        setAnswers((current) => ({
            ...current,
            [questionId]: {
                ...getDefaultAnswer(question),
                ...(current[questionId] ?? {}),
                ...changes,
            },
        }));
    };

    const handleSelectOption = (option) => {
        if (!currentQuestion) {
            return;
        }

        const nextAnswer = {
            ...currentAnswer,
            selected_option: currentAnswer.selected_option === option ? null : option,
            answer_text: '',
        };

        updateLocalAnswer(currentQuestion.id, nextAnswer);
        saveAnswer(currentQuestion.id, nextAnswer);
    };

    const handleToggleMultiOption = (option) => {
        if (!currentQuestion) {
            return;
        }

        const selectedOptions = currentAnswer.selected_options?.includes(option)
            ? currentAnswer.selected_options.filter((item) => item !== option)
            : [...(currentAnswer.selected_options ?? []), option];

        const nextAnswer = {
            ...currentAnswer,
            selected_option: null,
            selected_options: selectedOptions,
            answer_text: '',
        };

        updateLocalAnswer(currentQuestion.id, nextAnswer);
        saveAnswer(currentQuestion.id, nextAnswer);
    };

    const handleSelectMatrixAnswer = (rowIndex, value) => {
        if (!currentQuestion) {
            return;
        }

        const nextMatrixAnswers = [...(currentAnswer.matrix_answers ?? (currentQuestion.matrix_rows ?? []).map(() => null))];
        nextMatrixAnswers[rowIndex] = value;

        const nextAnswer = {
            ...currentAnswer,
            selected_option: null,
            selected_options: [],
            matrix_answers: nextMatrixAnswers,
            answer_text: '',
        };

        updateLocalAnswer(currentQuestion.id, nextAnswer);
        saveAnswer(currentQuestion.id, nextAnswer);
    };

    const handleEssayChange = (value) => {
        if (!currentQuestion) {
            return;
        }

        updateLocalAnswer(currentQuestion.id, {
            ...currentAnswer,
            answer_text: value,
            selected_option: null,
        });
    };

    const handleSaveEssay = () => {
        if (!currentQuestion) {
            return;
        }

        saveAnswer(currentQuestion.id, currentAnswer);
    };

    const handleToggleMarked = () => {
        if (!currentQuestion) {
            return;
        }

        const nextAnswer = {
            ...currentAnswer,
            is_marked: !currentAnswer.is_marked,
        };

        updateLocalAnswer(currentQuestion.id, nextAnswer);
        saveAnswer(currentQuestion.id, nextAnswer, nextAnswer.is_marked ? 'Soal ditandai ragu-ragu.' : 'Tanda ragu-ragu dihapus.');
    };

    const handleFinish = () => {
        if (isFinishingRef.current) {
            return;
        }

        isFinishingRef.current = true;
        router.post(route('quiz-attempts.finish', attempt.id));
    };

    if (!currentQuestion) {
        return null;
    }

    return (
        <AuthenticatedLayout
            cleanLayout={true}
            header={
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {attempt.name}
                    </h2>
                </div>
            }
        >
            <Head title={attempt.name} />

            {/* FULLSCREEN LOCK OVERLAY MODAL */}
            {!isFullscreen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
                    <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-2xl space-y-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-inner">
                            <Icon icon="lucide:shield-alert" className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900">Ujian Terkunci!</h3>
                            <p className="text-sm font-semibold text-rose-600">
                                Anda telah keluar dari mode Fullscreen (Layar Penuh).
                            </p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed pt-2">
                                Demi menjaga integritas dan kelancaran ujian, Anda <span className="font-bold text-slate-800">tidak dapat mengerjakan atau menjawab soal</span> selama berada di luar mode layar penuh.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={requestFullscreen}
                            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl hover:bg-slate-800 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Icon icon="lucide:maximize" className="w-4 h-4 text-white" />
                            <span>Masuk Mode Fullscreen Sekarang</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] select-none notranslate" translate="no">
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500">Ukuran Font:</span>
                                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setFontSize('sm')}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                                            fontSize === 'sm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                        title="Ukuran Font Kecil"
                                    >
                                        a
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFontSize('base')}
                                        className={`px-2.5 py-1 text-sm font-bold rounded-lg transition ${
                                            fontSize === 'base' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                        title="Ukuran Font Sedang"
                                    >
                                        A
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFontSize('lg')}
                                        className={`px-2.5 py-1 text-lg font-extrabold rounded-lg transition ${
                                            fontSize === 'lg' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                        title="Ukuran Font Besar"
                                    >
                                        A
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm font-bold text-amber-800">
                                Sisa Waktu {formatTime(remainingSeconds)}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <MathContent
                            content={currentQuestion.question_text ?? ''}
                            isHtml
                            className={`prose prose-slate max-w-none text-slate-800 ${fontSizeClass}`}
                        />

                        {currentQuestion.image_url && (
                            <div className="mt-4">
                                <img
                                    src={currentQuestion.image_url}
                                    alt="Gambar soal"
                                    className="max-h-[420px] rounded-2xl border border-slate-200 object-contain"
                                />
                            </div>
                        )}

                        {currentQuestion.question_type === 'matrix_binary' ? (
                            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Pernyataan</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {currentQuestion.matrix_left_label || 'Kiri'}
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                {currentQuestion.matrix_right_label || 'Kanan'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {(currentQuestion.matrix_rows ?? []).map((row, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-4 font-semibold text-slate-700">{index + 1}</td>
                                                <td className="px-4 py-4">
                                                    <MathContent
                                                        content={row.statement ?? ''}
                                                        className={`whitespace-pre-wrap text-slate-800 ${fontSizeClass}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        type="radio"
                                                        checked={(currentAnswer.matrix_answers ?? [])[index] === 'left'}
                                                        onChange={() => handleSelectMatrixAnswer(index, 'left')}
                                                        className="border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        type="radio"
                                                        checked={(currentAnswer.matrix_answers ?? [])[index] === 'right'}
                                                        onChange={() => handleSelectMatrixAnswer(index, 'right')}
                                                        className="border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : currentQuestion.question_type === 'essay' ? (
                            <div className="mt-6 space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Jawaban Isian</label>
                                <textarea
                                    value={currentAnswer.answer_text ?? ''}
                                    onChange={(event) => handleEssayChange(event.target.value)}
                                    rows={6}
                                    className={`w-full rounded-2xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${fontSizeClass}`}
                                    placeholder="Tulis jawabanmu di sini..."
                                />
                                <button
                                    type="button"
                                    onClick={handleSaveEssay}
                                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Simpan Jawaban
                                </button>
                            </div>
                        ) : currentQuestion.question_type === 'multiple_choice' ? (
                            <div className="mt-6 space-y-2">
                                {getOptionRows(currentQuestion).map((row) => {
                                    const isSelected = (currentAnswer.selected_options ?? []).includes(row.key);

                                    return (
                                        <button
                                            key={row.key}
                                            type="button"
                                            onClick={() => handleToggleMultiOption(row.key)}
                                            className="flex w-full items-start gap-4 px-3 py-3 text-left transition rounded-xl hover:bg-slate-50"
                                        >
                                            <span className="mt-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    readOnly
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </span>
                                            <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                                                isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {row.label}
                                            </span>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                {row.value && (
                                                    <MathContent
                                                        content={row.value}
                                                        className={`whitespace-pre-wrap text-slate-800 ${fontSizeClass} ${isSelected ? 'font-semibold text-blue-900' : ''}`}
                                                    />
                                                )}
                                                {row.imageUrl && (
                                                    <img
                                                        src={row.imageUrl}
                                                        alt={`Opsi ${row.label}`}
                                                        className="mt-2 max-h-40 rounded-xl border border-slate-200 object-contain"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="mt-6 space-y-2">
                                {getOptionRows(currentQuestion).map((row) => {
                                    const isSelected = currentAnswer.selected_option === row.key;

                                    return (
                                        <button
                                            key={row.key}
                                            type="button"
                                            onClick={() => handleSelectOption(row.key)}
                                            className="flex w-full items-start gap-4 px-3 py-3 text-left transition rounded-xl hover:bg-slate-50"
                                        >
                                            <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                                                isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {row.label}
                                            </span>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                {row.value && (
                                                    <MathContent
                                                        content={row.value}
                                                        className={`whitespace-pre-wrap text-slate-800 ${fontSizeClass} ${isSelected ? 'font-semibold text-blue-900' : ''}`}
                                                    />
                                                )}
                                                {row.imageUrl && (
                                                    <img
                                                        src={row.imageUrl}
                                                        alt={`Opsi ${row.label}`}
                                                        className="mt-2 max-h-40 rounded-xl border border-slate-200 object-contain"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
                            <button
                                type="button"
                                onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                                disabled={currentIndex === 0}
                                className="inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                            >
                                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-rose-500 text-xs font-extrabold">
                                    &lsaquo;
                                </span>
                                Soal sebelumnya
                            </button>

                            <button
                                type="button"
                                onClick={handleToggleMarked}
                                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 shadow-sm"
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(currentAnswer.is_marked)}
                                    readOnly
                                    className="mr-2.5 h-4 w-4 rounded border-white text-amber-600 focus:ring-0 cursor-pointer"
                                />
                                Ragu-ragu
                            </button>

                            <button
                                type="button"
                                onClick={() => setCurrentIndex((value) => Math.min(questions.length - 1, value + 1))}
                                disabled={currentIndex === questions.length - 1}
                                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                            >
                                Soal berikutnya
                                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600 text-xs font-extrabold">
                                    &rsaquo;
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="text-lg font-bold text-slate-900">Informasi Soal</div>
                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {questions.map((question, index) => {
                                const answer = answers[question.id];
                                const isAnswered = isQuestionAnswered(question, answer);
                                const isCurrent = index === currentIndex;
                                const isMarked = Boolean(answer?.is_marked);

                                let buttonStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium';

                                if (isCurrent) {
                                    buttonStyle = 'bg-slate-900 text-white font-bold ring-2 ring-offset-2 ring-slate-900';
                                } else if (isMarked) {
                                    buttonStyle = 'bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-sm';
                                } else if (isAnswered) {
                                    buttonStyle = 'bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm';
                                }

                                return (
                                    <button
                                        key={question.id}
                                        type="button"
                                        onClick={() => setCurrentIndex(index)}
                                        className={`h-11 rounded-xl text-sm transition ${buttonStyle}`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowFinishModal(true)}
                            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition shadow-sm"
                        >
                            Selesaikan Quiz
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                show={showFinishModal}
                onClose={() => setShowFinishModal(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900">
                        Konfirmasi Selesaikan Quiz
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Apakah Anda yakin ingin menyelesaikan quiz ini? Pastikan Anda telah memeriksa seluruh jawaban Anda.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setShowFinishModal(false)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowFinishModal(false);
                                handleFinish();
                            }}
                            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                        >
                            Ya, Selesaikan
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
