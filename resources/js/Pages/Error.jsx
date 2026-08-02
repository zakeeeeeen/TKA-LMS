import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Error() {
    const { status, auth } = usePage().props;
    const user = auth?.user ?? null;

    const titleMap = {
        403: 'Akses Ditolak',
        404: 'Halaman Tidak Ditemukan',
        419: 'Sesi Berakhir',
        500: 'Terjadi Kesalahan',
    };

    const descriptionMap = {
        403: 'Kamu tidak punya izin untuk membuka halaman ini.',
        404: 'Halaman yang kamu cari tidak tersedia atau sudah dihapus.',
        419: 'Sesi kamu sudah berakhir. Silakan refresh dan coba lagi.',
        500: 'Terjadi kesalahan di server. Coba lagi beberapa saat.',
    };

    const title = titleMap[status] ?? 'Terjadi Kesalahan';
    const description = descriptionMap[status] ?? 'Coba lagi beberapa saat atau kembali ke halaman utama.';
    const content = (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold text-blue-600">Error {status}</div>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </div>
                <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                    Refresh
                </button>
            </div>
        </div>
    );

    return user ? (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-slate-800">
                    Error
                </h2>
            }
        >
            <Head title={`Error ${status}`} />
            <div className="max-w-3xl mx-auto">
                {content}
            </div>
        </AuthenticatedLayout>
    ) : (
        <GuestLayout>
            <Head title={`Error ${status}`} />
            {content}
        </GuestLayout>
    );
}
