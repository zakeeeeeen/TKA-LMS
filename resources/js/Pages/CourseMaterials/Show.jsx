import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ course, material }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {material.title}
                        </h2>
                    </div>
                    <Link
                        href={route('courses.materials.edit', [course, material])}
                        className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
                    >
                        Edit
                    </Link>
                </div>
            }
        >
            <Head title={material.title} />

            <div className="mx-auto max-w-4xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                            {material.position}
                        </span>
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
                    <div className="space-y-6">
                        {material.content && (
                            <div className="prose prose-slate max-w-none">
                                <div className="whitespace-pre-wrap text-slate-700">{material.content}</div>
                            </div>
                        )}
                        
                        {material.file_path && (
                            <div>
                                {material.file_type === 'application/pdf' ? (
                                    <div className="relative w-full" style={{ height: '80vh' }} onContextMenu={(e) => e.preventDefault()}>
                                        <iframe
                                            src={route('courses.materials.file', [course, material])}
                                            className="w-full h-full rounded-xl border border-slate-200"
                                            title={material.title}
                                            onContextMenu={(e) => e.preventDefault()}
                                        />
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                                        <p className="text-slate-700 mb-3">File: {material.file_path.split('/').pop()}</p>
                                        <p className="text-sm text-slate-500">Silakan unduh file untuk melihatnya.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {!material.content && !material.file_path && (
                            <p className="text-slate-500 italic">Materi ini belum memiliki konten atau file.</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
