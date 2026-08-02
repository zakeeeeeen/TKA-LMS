import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-2xl font-bold text-slate-800">
                    Pengaturan Profil
                </h2>
            }
        >
            <Head title="Pengaturan Profil" />

            <div className="py-6 max-w-4xl mx-auto space-y-8">
                {/* Data Diri & Avatar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="w-full"
                    />
                </div>

                {/* Password & Keamanan */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <UpdatePasswordForm className="w-full" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
