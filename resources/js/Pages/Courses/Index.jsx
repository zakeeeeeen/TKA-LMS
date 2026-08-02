import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { courses } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">
                        Courses
                    </h2>
                    <Link
                        href={route('courses.create')}
                        className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
                    >
                        Add Course
                    </Link>
                </div>
            }
        >
            <Head title="Courses" />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Quiz</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {courses.map((course) => (
                                <tr key={course.id} className="transition hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-slate-900">{course.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-md text-sm text-slate-600">{course.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{course.quizzes_count ?? 0}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                            course.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {course.active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <Link href={route('courses.edit', course.id)} className="mr-3 text-blue-600 hover:text-blue-900">
                                            Edit
                                        </Link>
                                        <Link href={route('courses.groups.index', course.id)} className="mr-3 text-slate-600 hover:text-slate-900">
                                            Group
                                        </Link>
                                        <ConfirmDeleteButton
                                            href={route('courses.destroy', course.id)}
                                            itemName={`course ${course.name}`}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Hapus
                                        </ConfirmDeleteButton>
                                    </td>
                                </tr>
                            ))}

                            {courses.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                                        Belum ada course. Buat course pertama untuk mulai mengelompokkan quiz.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
