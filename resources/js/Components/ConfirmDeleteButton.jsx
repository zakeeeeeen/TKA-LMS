import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function ConfirmDeleteButton({
    href,
    itemName = 'data ini',
    buttonText = 'Delete',
    className = '',
    children,
}) {
    const [show, setShow] = useState(false);
    const [processing, setProcessing] = useState(false);

    const closeModal = () => {
        if (!processing) {
            setShow(false);
        }
    };

    const handleDelete = () => {
        setProcessing(true);

        router.delete(href, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => setShow(false),
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setShow(true)}
                className={className}
            >
                {children ?? buttonText}
            </button>

            <Modal show={show} onClose={closeModal} maxWidth="md">
                <div className="p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Hapus Data?
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Apakah kamu yakin ingin menghapus <span className="font-semibold text-slate-800">{itemName}</span>?
                                Data yang sudah dihapus tidak bisa dikembalikan lagi.
                            </p>
                        </div>
                    </div>

                    <div className="mt-7 flex justify-end gap-3">
                        <SecondaryButton
                            onClick={closeModal}
                            disabled={processing}
                            className="rounded-xl px-4 py-2 normal-case tracking-normal"
                        >
                            Batal
                        </SecondaryButton>
                        <DangerButton
                            onClick={handleDelete}
                            disabled={processing}
                            className="rounded-xl px-4 py-2 normal-case tracking-normal"
                        >
                            {processing ? 'Menghapus...' : 'Ya, Hapus'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </>
    );
}
