import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Icon } from '@iconify/react';

export default function Index({ courses = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-black text-slate-900">
                    Kursus Saya
                </h2>
            }
        >
            <Head title="Kursus Saya" />

            <div className="max-w-7xl mx-auto space-y-6">
                {courses.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-3">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <Icon icon="lucide:book-open" className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Anda belum terdaftar di kursus manapun</h3>
                        <p className="text-sm text-slate-500">Silakan pilih kursus yang tersedia dan ajukan pendaftaran.</p>
                        <div className="pt-2">
                            <Link
                                href={route('student.courses.index')}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
                            >
                                Lihat Daftar Kursus Tersedia
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition"
                            >
                                <div>
                                    {course.thumbnail_url ? (
                                        <div className="h-48 overflow-hidden border-b border-slate-100">
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-[#89d0f0] flex items-center justify-center">
                                            <Icon icon="lucide:book-open" className="w-12 h-12 text-slate-900" />
                                        </div>
                                    )}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{course.name}</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{course.description}</p>
                                    </div>
                                </div>
                                <div className="px-5 pb-5 pt-2">
                                    <Link
                                        href={route('student.courses.show', course.id)}
                                        className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm"
                                    >
                                        Masuk Kursus
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

