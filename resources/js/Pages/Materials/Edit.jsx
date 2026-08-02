import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { material, courses, groups } = usePage().props;
    const initialGroupId = material.group_id ?? groups.find((group) => String(group.course_id) === String(material.course_id))?.id ?? '';
    const { data, setData, put, processing, errors } = useForm({
        course_id: material.course_id,
        group_id: initialGroupId,
        title: material.title,
        content: material.content ?? '',
        file: null,
        is_published: Boolean(material.is_published),
    });

    const availableGroups = groups
        .filter((group) => String(group.course_id) === String(data.course_id))
        .sort((a, b) => a.position - b.position);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('materials.update', material), { forceFormData: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Edit Materi
                    </h2>
                </div>
            }
        >
            <Head title="Edit Materi" />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Pilih Kursus</label>
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
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </select>
                        {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Pilih Group</label>
                        <select
                            value={data.group_id}
                            onChange={(e) => setData('group_id', e.target.value)}
                            required
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Pilih Group</option>
                            {availableGroups.map((group) => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                        {errors.group_id && <p className="mt-1 text-sm text-red-500">{errors.group_id}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Judul Materi</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Konten (Teks)</label>
                        <textarea
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            rows={6}
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">File (PDF/PPT/DOC)</label>
                        {material.file_path && (
                            <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-sm text-slate-700">File saat ini: {material.file_path.split('/').pop()}</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept=".pdf,.ppt,.pptx,.doc,.docx"
                            onChange={(e) => setData('file', e.target.files[0])}
                            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
                    </div>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                            className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">
                            Publikasikan Materi
                        </span>
                    </label>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            Simpan
                        </button>
                        <Link href={route('materials.index')} className="rounded-xl bg-slate-200 px-6 py-2 font-medium text-slate-800 transition hover:bg-slate-300">
                            Batal
                        </Link>
                        <ConfirmDeleteButton
                            href={route('materials.destroy', material)}
                            itemName={`materi ${material.title}`}
                            className="rounded-xl border border-red-200 px-6 py-2 font-medium text-red-600 transition hover:bg-red-50"
                            buttonText="Hapus"
                        />
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
