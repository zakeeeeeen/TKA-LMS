import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit() {
    const { course } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        _method: 'put',
        name: course.name,
        description: course.description ?? '',
        active: Boolean(course.active),
        access_type: course.access_type ?? 'approval',
        thumbnail: null,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route('courses.update', course.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Edit Course
                    </h2>
                </div>
            }
        >
            <Head title="Edit Course" />

            <div className="mx-auto max-w-6xl space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Nama Course</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                            <input
                                type="checkbox"
                                checked={data.active}
                                onChange={(event) => setData('active', event.target.checked)}
                                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>
                                <span className="block text-sm font-medium text-slate-800">Aktif</span>
                                <span className="block text-xs text-slate-500">Course aktif siap dipakai pada flow siswa.</span>
                            </span>
                        </label>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <p className="text-sm font-medium text-slate-700">Pengaturan Akses Kursus</p>
                        <p className="mb-3 text-xs text-slate-500">Tentukan apakah siswa bisa langsung masuk ke kursus atau harus minta persetujuan dulu.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${data.access_type === 'direct' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <input
                                    type="radio"
                                    name="access_type"
                                    value="direct"
                                    checked={data.access_type === 'direct'}
                                    onChange={(e) => setData('access_type', e.target.value)}
                                    className="mt-1 border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>
                                    <span className="block text-sm font-semibold text-slate-800">Langsung Masuk</span>
                                    <span className="block text-xs text-slate-500">Siswa dapat langsung bergabung & mengakses kursus tanpa menunggu persetujuan.</span>
                                </span>
                            </label>

                            <label className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${data.access_type === 'approval' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                <input
                                    type="radio"
                                    name="access_type"
                                    value="approval"
                                    checked={data.access_type === 'approval'}
                                    onChange={(e) => setData('access_type', e.target.value)}
                                    className="mt-1 border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span>
                                    <span className="block text-sm font-semibold text-slate-800">Butuh Persetujuan Admin/Guru</span>
                                    <span className="block text-xs text-slate-500">Siswa harus mendaftar dan menunggu persetujuan Admin/Guru sebelum masuk.</span>
                                </span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Thumbnail Course</label>
                        {course.thumbnail && (
                            <div className="mb-3">
                                <img
                                    src={`/storage/${course.thumbnail}`}
                                    alt="Thumbnail"
                                    className="h-32 w-full rounded-xl object-cover"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => setData('thumbnail', event.target.files[0])}
                            className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {errors.thumbnail && <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
                        <textarea
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            rows={4}
                            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            Update Course
                        </button>
                        <Link href={route('courses.index')} className="rounded-xl bg-slate-200 px-6 py-2 font-medium text-slate-800 transition hover:bg-slate-300">
                            Cancel
                        </Link>
                        <ConfirmDeleteButton
                            href={route('courses.destroy', course.id)}
                            itemName={`course ${course.name}`}
                            className="rounded-xl border border-red-200 px-6 py-2 font-medium text-red-600 transition hover:bg-red-50"
                            buttonText="Delete"
                        >
                            Delete
                        </ConfirmDeleteButton>
                    </div>
                </form>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Quiz</h3>
                            <p className="text-sm text-slate-500">Kelola quiz di halaman terpisah.</p>
                        </div>
                        <div>
                            <Link
                                href={route('courses.quizzes.index', course.id)}
                                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Kelola Quiz
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
