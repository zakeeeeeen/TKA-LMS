import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Import() {
    const { supportedFormats, templateFormSoalUrl } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('questions.import.store'));
    };

    const downloadUrl = templateFormSoalUrl || route('questions.import.template-form-soal');

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Import Soal Massal</h2>
                </div>
            }
        >
            <Head title="Import Soal" />

            <div className="space-y-6">
                {/* TEMPLATE DOWNLOAD CARD */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex rounded-xl bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 mb-1">
                                Template Resmi Excel (.XLS)
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">1. Download Template Import Soal</h3>
                            <p className="text-sm text-slate-600">
                                Gunakan 1 file template <span className="font-semibold text-slate-800">template.xls</span> ini untuk semua tipe soal (Pilihan Ganda 1 Jawaban, Multi Jawaban, dan Benar/Salah).
                            </p>
                        </div>

                        <a
                            href={downloadUrl}
                            download="template-import-soal.xls"
                            className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white hover:bg-purple-700 shadow-md transition active:scale-95 whitespace-nowrap shrink-0"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Template Excel (.XLS)
                        </a>
                    </div>
                </div>

                {/* INFO PANDUAN PENGISIAN */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">💡 Kode Tingkat Pendidikan (Kolom H - Tingkat Pendidikan):</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="font-bold text-blue-700 block">Kode 1 = SD</span>
                            Isikan angka <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold">1</code> untuk tingkat Sekolah Dasar
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="font-bold text-indigo-700 block">Kode 2 = SMP</span>
                            Isikan angka <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold">2</code> untuk tingkat Sekolah Menengah Pertama
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="font-bold text-emerald-700 block">Kode 3 = SMA</span>
                            Isikan angka <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold">3</code> untuk tingkat Sekolah Menengah Atas
                        </div>
                    </div>
                </div>

                {/* TIPE JAWABAN EXPLANATION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* TIPE 1 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                1
                            </span>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                Tipe Jawaban = 1
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">Pilihan Ganda 1 Jawaban</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Soal standar pilihan ganda dengan 1 jawaban benar.
                        </p>
                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                            <p>• Header tabel ada di <span className="font-bold text-slate-800">Baris 1</span>.</p>
                            <p>• Isikan <span className="font-bold text-slate-800">Tipe Jawaban = 1</span> dan <span className="font-bold text-slate-800">Tingkat Pendidikan = 1/2/3</span> di baris SOAL.</p>
                            <p>• Isikan status <span className="font-bold text-emerald-600">1</span> hanya pada 1 baris JAWABAN yang benar (lainnya <span className="font-bold text-slate-500">0</span>).</p>
                        </div>
                    </div>

                    {/* TIPE 2 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                                2
                            </span>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                Tipe Jawaban = 2
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">Pilihan Ganda Multi Jawaban</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Soal pilihan ganda yang memiliki lebih dari 1 opsi jawaban benar.
                        </p>
                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                            <p>• Isikan <span className="font-bold text-slate-800">Tipe Jawaban = 2</span> di baris SOAL.</p>
                            <p>• Isikan status <span className="font-bold text-emerald-600">1</span> pada minimal 2 baris JAWABAN yang benar.</p>
                        </div>
                    </div>

                    {/* TIPE 3 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                                3
                            </span>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Tipe Jawaban = 3
                            </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">Benar / Salah (Tabel Statement)</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Soal berisi beberapa pernyataan dengan opsi pilihan Benar atau Salah.
                        </p>
                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                            <p>• Isikan <span className="font-bold text-slate-800">Tipe Jawaban = 3</span> di baris SOAL.</p>
                            <p>• Setiap baris JAWABAN diisi teks pernyataan, beri status <span className="font-bold text-emerald-600">1</span> (Benar) atau <span className="font-bold text-rose-500">0</span> (Salah).</p>
                        </div>
                    </div>
                </div>

                {/* UPLOAD & FORM */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">2. Upload File Excel / CSV</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Upload file yang sudah Anda isi. Sistem akan membaca seluruh tipe soal secara otomatis.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Pilih file <code className="bg-white px-2 py-0.5 rounded border text-purple-700 font-bold">template-import-soal.xls</code> yang siap diimport
                            </label>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv,.txt"
                                onChange={(e) => setData('file', e.target.files[0])}
                                className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800 cursor-pointer"
                            />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {supportedFormats.map((format) => (
                                    <span
                                        key={format}
                                        className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                                    >
                                        {format}
                                    </span>
                                ))}
                            </div>
                            {errors.file && <p className="mt-3 text-sm font-semibold text-rose-600">{errors.file}</p>}
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 shadow-sm"
                            >
                                {processing ? 'Memproses Import...' : 'Import Soal Sekarang'}
                            </button>
                            <Link
                                href={route('questions.index')}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
