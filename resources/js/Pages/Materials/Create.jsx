import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Create() {
    const { courses, groups } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        file: null,
        link_url: '',
        content: '',
        course_id: '',
        group_id: '',
        is_published: true,
    });

    const availableGroups = groups
        .filter((group) => String(group.course_id) === String(data.course_id))
        .sort((a, b) => a.position - b.position);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('materials.store'), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-black text-slate-900">
                        Upload / Tambah Materi Baru
                    </h2>
                    <p className="text-sm text-slate-600 font-medium mt-0.5">
                        Tambahkan materi berupa Berkas Dokumen (PDF, PPT, DOC) atau Link Tautan (Google Drive, YouTube, dll).
                    </p>
                </div>
            }
        >
            <Head title="Upload Materi Baru" />

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Judul Materi */}
                    <div>
                        <label className="mb-1.5 block text-sm font-bold text-slate-800">
                            Judul Materi <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Modul Bab 1 - Rumus Fisika Dasar"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                        />
                        {errors.title && <p className="mt-1.5 text-xs font-bold text-rose-500">{errors.title}</p>}
                    </div>

                    {/* File Upload */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <label className="mb-1 block text-sm font-bold text-slate-800">
                            Upload File Dokumen (PDF / PPT / DOCX)
                        </label>
                        <p className="text-xs text-slate-500 font-medium mb-3">Format yang didukung: .pdf, .ppt, .pptx, .doc, .docx (Maks. 20MB)</p>
                        <input
                            type="file"
                            accept=".pdf,.ppt,.pptx,.doc,.docx"
                            onChange={(e) => setData('file', e.target.files[0])}
                            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-700"
                        />
                        {errors.file && <p className="mt-1.5 text-xs font-bold text-rose-500">{errors.file}</p>}
                    </div>

                    {/* Link Tautan (Google Drive / Video / Zoom) */}
                    <div>
                        <label className="mb-1 block text-sm font-bold text-slate-800">
                            Link Tautan / URL (Opsional)
                        </label>
                        <p className="text-xs text-slate-500 font-medium mb-2">Tautan luar seperti Google Drive, Canva Presentation, Video YouTube, dll.</p>
                        <input
                            type="url"
                            placeholder="https://drive.google.com/file/d/..."
                            value={data.link_url}
                            onChange={(e) => setData('link_url', e.target.value)}
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-medium"
                        />
                        {errors.link_url && <p className="mt-1.5 text-xs font-bold text-rose-500">{errors.link_url}</p>}
                    </div>

                    {/* Opsional Penugasan Kursus Langsung */}
                    <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                            Penugasan Ke Kursus (Opsional)
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-700">Pilih Kursus</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => {
                                        const nextCourseId = e.target.value;
                                        const nextGroupId = groups
                                            .filter((group) => String(group.course_id) === String(nextCourseId))
                                            .sort((a, b) => a.position - b.position)[0]?.id ?? '';
                                        setData('course_id', nextCourseId);
                                        setData('group_id', nextGroupId);
                                    }}
                                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Simpan di Bank Materi Dulu</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>

                            {data.course_id && (
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">Pilih Bab / Group</label>
                                    <select
                                        value={data.group_id}
                                        onChange={(e) => setData('group_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Pilih Bab Tujuan</option>
                                        {availableGroups.map((group) => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-sm text-white transition hover:bg-blue-700 disabled:opacity-70 shadow-md"
                        >
                            Simpan Materi
                        </button>
                        <Link href={route('materials.index')} className="rounded-xl bg-slate-100 px-6 py-2.5 font-bold text-sm text-slate-700 transition hover:bg-slate-200">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
