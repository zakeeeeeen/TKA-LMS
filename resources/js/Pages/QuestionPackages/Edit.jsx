import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

const typeLabels = {
    single_choice: '1 Jawaban',
    multiple_choice: 'Multi Jawaban',
    matrix_binary: 'Tabel 2 Kolom',
    essay: 'Isian Lama',
};

export default function Edit() {
    const { questionPackage } = usePage().props;
    const { data, setData, put, errors } = useForm({
        name: questionPackage.name,
        description: questionPackage.description ?? '',
        duration: questionPackage.duration,
        min_score: questionPackage.min_score ?? '',
        shuffle_questions: Boolean(questionPackage.shuffle_questions),
        shuffle_options: Boolean(questionPackage.shuffle_options),
        active: Boolean(questionPackage.active),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('quizzes.update', questionPackage.id));
    };

    const moveQuestion = (questionId, direction) => {
        router.post(route('quizzes.questions.move', [questionPackage.id, questionId]), {
            direction,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Edit Quiz
                    </h2>
                </div>
            }
        >
            <Head title="Edit Quiz" />

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Quiz</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Durasi (Menit)</label>
                            <input
                                type="number"
                                min="1"
                                value={data.duration}
                                onChange={(e) => setData('duration', e.target.value)}
                                className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nilai Minimum</label>
                            <input
                                type="number"
                                min="0"
                                value={data.min_score}
                                onChange={(e) => setData('min_score', e.target.value)}
                                className="w-full border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.min_score && <p className="text-red-500 text-sm mt-1">{errors.min_score}</p>}
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4 md:col-span-2">
                            <p className="text-sm font-medium text-slate-700">Pengaturan Quiz</p>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                                    <input
                                        type="checkbox"
                                        checked={data.shuffle_questions}
                                        onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-slate-800">Acak Soal</span>
                                        <span className="block text-xs text-slate-500">Urutan soal akan diacak.</span>
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                                    <input
                                        type="checkbox"
                                        checked={data.shuffle_options}
                                        onChange={(e) => setData('shuffle_options', e.target.checked)}
                                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-slate-800">Acak Opsi</span>
                                        <span className="block text-xs text-slate-500">Pilihan jawaban akan diacak.</span>
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                                    <input
                                        type="checkbox"
                                        checked={data.active}
                                        onChange={(e) => setData('active', e.target.checked)}
                                        className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-slate-800">Aktif</span>
                                        <span className="block text-xs text-slate-500">Quiz siap diakses siswa saat aktif.</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Soal dalam Quiz</h3>
                                <p className="text-sm text-slate-500">
                                    Tambahkan soal dari Question Bank, lalu atur urutannya khusus untuk quiz ini.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                    {questionPackage.questions.length} soal
                                </div>
                                <Link
                                    href={route('questions.index', { package_id: questionPackage.id })}
                                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                                >
                                    Tambah Soal dari Question Bank
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Urutan</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Soal</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Meta</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {questionPackage.questions.map((question, index) => (
                                            <tr key={question.id}>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-700">
                                                        {index + 1}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="max-w-xl text-sm font-medium text-slate-900">
                                                        {question.question_text}
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                            {question.subject?.name ?? 'Tanpa subject'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 align-top">
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            question.question_type === 'matrix_binary'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : question.question_type === 'multiple_choice'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : question.question_type === 'single_choice'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-indigo-100 text-indigo-700'
                                                        }`}>
                                                            {typeLabels[question.question_type] ?? question.question_type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveQuestion(question.id, 'up')}
                                                            disabled={index === 0}
                                                            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            Naik
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveQuestion(question.id, 'down')}
                                                            disabled={index === questionPackage.questions.length - 1}
                                                            className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        >
                                                            Turun
                                                        </button>
                                                        <ConfirmDeleteButton
                                            href={route('quizzes.questions.destroy', [questionPackage.id, question.id])}
                                                            itemName={`soal "${question.question_text}" dari quiz ${questionPackage.name}`}
                                                            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                            buttonText="Keluarkan"
                                                        >
                                                            Keluarkan
                                                        </ConfirmDeleteButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {questionPackage.questions.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-500">
                                                    Belum ada soal di quiz ini. Tambahkan dulu dari Question Bank.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition"
                        >
                            Update
                        </button>
                        <Link href={route('quizzes.index')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-2 rounded-xl font-medium transition">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
