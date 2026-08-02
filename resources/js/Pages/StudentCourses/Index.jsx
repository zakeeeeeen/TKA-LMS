import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Index() {
    const { courses } = usePage().props;
    const { post, processing } = useForm({});

    const requestCourse = (courseId) => {
        post(route('student.courses.request', courseId), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Daftar Kursus
                    </h2>
                </div>
            }
        >
            <Head title="Daftar Kursus" />

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                {courses.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Belum ada kursus yang tersedia.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="flex flex-col justify-between rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition"
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
                                    {course.enrollment_status === 'approved' && (
                                        <Link
                                            href={route('student.courses.show', course.id)}
                                            className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm"
                                        >
                                            Masuk Kursus
                                        </Link>
                                    )}

                                    {course.enrollment_status === 'pending' && (
                                        <span className="inline-block bg-slate-100 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-semibold">
                                            Menunggu Persetujuan
                                        </span>
                                    )}

                                    {(course.enrollment_status === null || course.enrollment_status === 'rejected' || course.enrollment_status === undefined) && (
                                        <button
                                            type="button"
                                            onClick={() => requestCourse(course.id)}
                                            disabled={processing}
                                            className="inline-flex items-center justify-center bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 shadow-sm"
                                        >
                                            {course.access_type === 'direct' ? 'Gabung Kursus' : 'Daftar Kursus'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
