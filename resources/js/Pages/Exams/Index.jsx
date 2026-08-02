import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDeleteButton from '@/Components/ConfirmDeleteButton';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index() {
    const { exams } = usePage().props;

    const formatDateTime = (value) => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    const getStatusLabel = (status) => {
        const labels = {
            not_started: 'Belum Mulai',
            ongoing: 'Berjalan',
            completed: 'Selesai',
        };

        return labels[status] ?? status;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            Legacy Exams
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Modul lama untuk penjadwalan sesi serentak. Flow utama siswa sekarang lewat Courses dan Quiz.
                        </p>
                    </div>
                    <Link
                        href={route('exams.create')}
                        className="rounded-xl bg-slate-900 px-6 py-2 font-medium text-white transition hover:bg-slate-800"
                    >
                        Tambah Sesi Lama
                    </Link>
                </div>
            }
        >
            <Head title="Legacy Exams" />

            <div className="space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="text-sm font-semibold text-amber-900">Catatan Transisi</div>
                    <div className="mt-2 text-sm leading-7 text-amber-800">
                        Gunakan menu ini hanya jika masih perlu mengelola sesi exam lama. Untuk alur belajar mandiri yang baru,
                        gunakan <span className="font-semibold">Courses</span> dan <span className="font-semibold">Quiz</span>.
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Nama Sesi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Quiz
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Waktu Mulai
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Durasi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Siswa
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {exams.map((exam) => (
                                    <tr key={exam.id} className="transition hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">
                                                {exam.name || exam.questionPackage?.name || 'Legacy Exam'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-slate-700">{exam.questionPackage?.name ?? '-'}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-slate-700">{formatDateTime(exam.start_time)}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-slate-700">{exam.duration} menit</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-slate-700">{exam.students?.length ?? 0} siswa</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right">
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                exam.status === 'ongoing'
                                                    ? 'bg-green-100 text-green-800'
                                                    : exam.status === 'completed'
                                                        ? 'bg-slate-900 text-white'
                                                        : 'bg-amber-100 text-amber-800'
                                            }`}
                                            >
                                                {getStatusLabel(exam.status)}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <Link href={route('exams.edit', exam.id)} className="mr-3 text-blue-600 hover:text-blue-900">
                                                Edit
                                            </Link>
                                            <ConfirmDeleteButton
                                                href={route('exams.destroy', exam.id)}
                                                itemName={`sesi lama ${exam.name}`}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Hapus
                                            </ConfirmDeleteButton>
                                        </td>
                                    </tr>
                                ))}

                                {exams.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-sm text-slate-500">
                                            Belum ada sesi exam lama. Kalau tidak butuh flow lama, kamu bisa fokus penuh ke Courses dan Quiz.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
