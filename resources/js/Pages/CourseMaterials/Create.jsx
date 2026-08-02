import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ course }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        file: null,
        is_published: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('courses.materials.store', course));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Tambah Materi
                    </h2>
                </div>
            }
        >
            <Head title="Tambah Materi" />

            <div className="mx-auto max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Judul Materi</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Masukkan judul materi"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Konten Materi (Teks)</label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={6}
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Tulis konten teks materi di sini..."
                        />
                        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">File Materi (PDF/PPT/DOC)</label>
                        <input
                            type="file"
                            accept=".pdf,.ppt,.pptx,.doc,.docx"
                            onChange={(e) => setData('file', e.target.files[0])}
                            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <input
                            type="checkbox"
                            id="is_published"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                            className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="is_published">
                            <span className="block text-sm font-medium text-slate-800">Publikasikan Materi</span>
                            <span className="block text-xs text-slate-500">
                                Materi yang dipublikasikan akan muncul di halaman detail course siswa.
                            </span>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-70"
                        >
                            Simpan
                        </button>
                        <Link
                            href={route('courses.materials.index', course)}
                            className="rounded-xl bg-slate-200 px-6 py-2 font-medium text-slate-800 transition hover:bg-slate-300"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
