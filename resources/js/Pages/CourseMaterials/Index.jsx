import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { course } = usePage().props;
    const materials = course.materials.sort((a, b) => a.position - b.position);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            Materi: {course.name}
                        </h2>
                    </div>
                    <Link
                        href={route('courses.materials.create', course)}
                        className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
                    >
                        Tambah Materi
                    </Link>
                </div>
            }
        >
            <Head title={`Materi - ${course.name}`} />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {materials.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-slate-500">Belum ada materi untuk course ini.</p>
                        <Link
                            href={route('courses.materials.create', course)}
                            className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Tambah Materi Pertama
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {materials.map((material) => (
                            <div key={material.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                                        {material.position}
                                    </span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900">{material.title}</span>
                                            {material.is_published ? (
                                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    Dipublikasikan
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                    Draf
                                                </span>
                                            )}
                                        </div>
                                        {material.content && (
                                            <p className="mt-1 text-sm text-slate-500 line-clamp-2">{material.content}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('courses.materials.show', [course, material])}
                                        className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                                    >
                                        Lihat
                                    </Link>
                                    <Link
                                        href={route('courses.materials.edit', [course, material])}
                                        className="rounded-lg px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                                    >
                                        Edit
                                    </Link>
                                    {material.position > 1 && (
                                        <Link
                                            as="button"
                                            method="post"
                                            href={route('courses.materials.move', [course, material])}
                                            data={{ direction: 'up' }}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                                        >
                                            ↑
                                        </Link>
                                    )}
                                    {material.position < materials.length && (
                                        <Link
                                            as="button"
                                            method="post"
                                            href={route('courses.materials.move', [course, material])}
                                            data={{ direction: 'down' }}
                                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                                        >
                                            ↓
                                        </Link>
                                    )}
                                    <ConfirmDeleteButton
                                        href={route('courses.materials.destroy', [course, material])}
                                        itemName={`materi ${material.title}`}
                                        className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Hapus
                                    </ConfirmDeleteButton>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
