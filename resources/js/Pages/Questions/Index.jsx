import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const typeLabels = {
    single_choice: '1 Jawaban',
    multiple_choice: 'Multi Jawaban',
    matrix_binary: 'Tabel 2 Kolom',
    essay: 'Isian Lama',
};

export default function Index() {
    const { auth, questions, subjects, questionPackages, filters = {}, selectedPackageId } = usePage().props;
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        quiz_ids: selectedPackageId ? [String(selectedPackageId)] : [],
        new_quiz_name: '',
        new_quiz_duration: 30,
        question_ids: [],
    });

    const handleFilterChange = (key, value) => {
        const nextFilters = {
            ...filters,
            [key]: value,
        };

        router.get(route('questions.index'), nextFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        router.get(route('questions.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const activeFilters = [
        filters.search ? `Cari: ${filters.search}` : null,
        filters.subject_id
            ? `Subject: ${subjects.find((subject) => String(subject.id) === String(filters.subject_id))?.name ?? ''}`
            : null,
        filters.grade_level ? `Tingkat: ${filters.grade_level}` : null,
        filters.question_type
            ? `Tipe: ${typeLabels[filters.question_type] ?? filters.question_type}`
            : null,
    ].filter(Boolean);

    const selectedVisibleCount = useMemo(
        () => questions.filter((question) => selectedQuestionIds.includes(question.id)).length,
        [questions, selectedQuestionIds]
    );

    const allVisibleSelected = questions.length > 0 && selectedVisibleCount === questions.length;

    const toggleQuestionSelection = (questionId) => {
        setSelectedQuestionIds((current) =>
            current.includes(questionId)
                ? current.filter((id) => id !== questionId)
                : [...current, questionId]
        );
    };

    const toggleAllVisibleQuestions = () => {
        if (allVisibleSelected) {
            setSelectedQuestionIds((current) => current.filter((id) => !questions.some((question) => question.id === id)));
            return;
        }

        setSelectedQuestionIds((current) => [
            ...new Set([...current, ...questions.map((question) => question.id)]),
        ]);
    };

    const openAssignModal = () => {
        setData('question_ids', selectedQuestionIds);
        setData('quiz_ids', selectedPackageId ? [String(selectedPackageId)] : data.quiz_ids);
        setShowAssignModal(true);
    };

    const closeAssignModal = () => {
        if (!processing) {
            setShowAssignModal(false);
        }
    };

    const submitAssignToPackage = (e) => {
        e.preventDefault();
        post(route('quizzes.attach-questions'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAssignModal(false);
                setSelectedQuestionIds([]);
                reset('quiz_ids', 'question_ids');
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Question Bank
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href={route('questions.import.create')}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Import Soal
                        </Link>
                        <Link
                            href={route('questions.create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition"
                        >
                            Add Question
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Question Bank" />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
                        <div className="xl:col-span-4">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Pencarian</label>
                            <input
                                type="text"
                                value={filters.search ?? ''}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Cari soal, subject, atau jawaban..."
                                className="w-full rounded-xl border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="xl:col-span-3">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
                            <select
                                value={filters.subject_id ?? ''}
                                onChange={(e) => handleFilterChange('subject_id', e.target.value)}
                                className="w-full rounded-xl border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Semua subject</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="xl:col-span-2">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tingkat</label>
                            <select
                                value={filters.grade_level ?? ''}
                                onChange={(e) => handleFilterChange('grade_level', e.target.value)}
                                className="w-full rounded-xl border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 font-semibold"
                            >
                                <option value="">Semua tingkat</option>
                                <option value="SD">SD</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA">SMA</option>
                            </select>
                        </div>
                        <div className="xl:col-span-3">
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tipe Soal</label>
                            <select
                                value={filters.question_type ?? ''}
                                onChange={(e) => handleFilterChange('question_type', e.target.value)}
                                className="w-full rounded-xl border-slate-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Semua tipe</option>
                                <option value="single_choice">Pilihan Ganda 1 Jawaban</option>
                                <option value="multiple_choice">Pilihan Ganda Multi Jawaban</option>
                                <option value="matrix_binary">Tabel 2 Kolom</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.length > 0 ? (
                                activeFilters.map((filterLabel) => (
                                    <span
                                        key={filterLabel}
                                        className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                                    >
                                        {filterLabel}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-slate-500">
                                    Belum ada filter aktif.
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">
                                {questions.length} soal ditampilkan
                            </span>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Reset Filter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-blue-900">Pilih soal dari Question Bank</p>
                        <p className="text-sm text-blue-800">
                            Centang satu atau banyak soal, lalu masukkan ke satu atau beberapa quiz sekaligus.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
                            {selectedQuestionIds.length} soal dipilih
                        </span>
                        <button
                            type="button"
                            onClick={openAssignModal}
                            disabled={selectedQuestionIds.length === 0}
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Masukkan ke Quiz
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={toggleAllVisibleQuestions}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Tingkat
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Question
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {questions.map((question) => (
                                <tr key={question.id} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestionIds.includes(question.id)}
                                            onChange={() => toggleQuestionSelection(question.id)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">
                                            {question.subject?.name || 'No Subject'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                                            {question.grade_level || 'SD'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            question.question_type === 'matrix_binary'
                                                ? 'bg-purple-100 text-purple-800'
                                                : question.question_type === 'multiple_choice'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : question.question_type === 'single_choice'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-indigo-100 text-indigo-800'
                                        }`}>
                                            {typeLabels[question.question_type] ?? question.question_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700 max-w-xs truncate">{question.question_text}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={route('questions.show', question.id)} className="text-emerald-600 hover:text-emerald-900 mr-3">
                                            View
                                        </Link>
                                        <Link href={route('questions.edit', question.id)} className="text-blue-600 hover:text-blue-900 mr-3">
                                            Edit
                                        </Link>
                                        {auth?.user?.role === 'admin' && (
                                            <ConfirmDeleteButton
                                                href={route('questions.destroy', question.id)}
                                                itemName={`soal "${question.question_text}"`}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </ConfirmDeleteButton>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {questions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                                        Tidak ada soal yang cocok dengan pencarian atau filter saat ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showAssignModal} onClose={closeAssignModal} maxWidth="lg">
                <form onSubmit={submitAssignToPackage} className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Masukkan Soal ke Quiz</h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {selectedQuestionIds.length} soal terpilih akan ditambahkan ke quiz.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeAssignModal}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50"
                        >
                            Tutup
                        </button>
                    </div>

                    <div className="mt-6 space-y-6">
                        {/* Section 1: Buat Quiz Baru */}
                        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
                            <h4 className="text-sm font-bold text-blue-900 mb-1">Buat Quiz Baru Langsung</h4>
                            <p className="text-xs text-blue-700 mb-3">
                                Isi nama quiz baru di bawah jika ingin langsung membuat quiz baru dan memasukkan soal ini ke dalamnya.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Nama Quiz Baru (Opsional)</label>
                                    <input
                                        type="text"
                                        value={data.new_quiz_name}
                                        onChange={(e) => setData('new_quiz_name', e.target.value)}
                                        placeholder="Contoh: Quiz Matematika SD Bab 1"
                                        className="w-full rounded-xl border-slate-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    {errors.new_quiz_name && <p className="mt-1 text-xs text-red-600">{errors.new_quiz_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Durasi (Menit)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.new_quiz_duration}
                                        onChange={(e) => setData('new_quiz_duration', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pilih Quiz yang Sudah Ada */}
                        <div className="rounded-2xl border border-slate-200">
                            <div className="border-b border-slate-200 px-4 py-3 bg-slate-50/50">
                                <p className="text-sm font-medium text-slate-800">Atau pilih quiz yang sudah ada</p>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-4">
                                <div className="grid grid-cols-1 gap-3">
                                    {questionPackages.map((pkg) => {
                                        const isChecked = data.quiz_ids.includes(String(pkg.id));

                                        return (
                                            <label
                                                key={pkg.id}
                                                className={`flex items-start gap-3 rounded-xl border p-3.5 transition ${
                                                    isChecked ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const nextIds = e.target.checked
                                                            ? [...data.quiz_ids, String(pkg.id)]
                                                            : data.quiz_ids.filter((id) => id !== String(pkg.id));
                                                        setData('quiz_ids', [...new Set(nextIds)]);
                                                    }}
                                                    className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-medium text-slate-900">{pkg.name}</span>
                                                    <span className="mt-0.5 block text-xs text-slate-500">
                                                        {pkg.total_questions ?? 0} soal saat ini • {pkg.duration} menit
                                                    </span>
                                                </span>
                                            </label>
                                        );
                                    })}
                                    {questionPackages.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                                            Belum ada quiz sebelumnya. Isi nama quiz baru di atas untuk membuat quiz pertama.
                                        </div>
                                    )}
                                </div>
                                {errors.quiz_ids && <p className="mt-3 text-sm text-red-600">{errors.quiz_ids}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeAssignModal}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || selectedQuestionIds.length === 0 || (!data.new_quiz_name.trim() && data.quiz_ids.length === 0)}
                            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Proses & Tambahkan ke Quiz'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
