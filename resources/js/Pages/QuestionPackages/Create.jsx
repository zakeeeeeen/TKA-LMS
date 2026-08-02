import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        name: '',
        description: '',
        duration: '60',
        min_score: '',
        shuffle_questions: false,
        shuffle_options: false,
        active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('quizzes.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Tambah Quiz
                    </h2>
                </div>
            }
        >
            <Head title="Tambah Quiz" />

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
                                placeholder="Contoh: 70"
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

                    <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/70 p-4">
                        <h3 className="text-sm font-semibold text-blue-900">Cara menambahkan soal</h3>
                        <p className="mt-1 text-sm text-blue-800">
                            Setelah quiz dibuat, tambahkan soal dari halaman <span className="font-medium">Question Bank</span>.
                            Kamu bisa pilih banyak soal sekaligus lalu masukkan ke satu atau beberapa quiz.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition"
                        >
                            Simpan
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
