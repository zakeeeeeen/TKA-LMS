import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 3000 }) {
    const [show, setShow] = useState(Boolean(message));

    useEffect(() => {
        if (!message) {
            setShow(false);
            return;
        }

        setShow(true);

        const timeout = setTimeout(() => {
            setShow(false);
        }, duration);

        return () => clearTimeout(timeout);
    }, [message, duration]);

    if (!message) {
        return null;
    }

    const tone = type === 'error'
        ? {
            iconBg: 'bg-red-100',
            iconText: 'text-red-600',
            ring: 'ring-red-100',
        }
        : {
            iconBg: 'bg-emerald-100',
            iconText: 'text-emerald-600',
            ring: 'ring-emerald-100',
        };

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[60] sm:right-6 sm:top-6">
            <Transition
                show={show}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-y-0 opacity-100 sm:translate-x-0"
                leaveTo="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
            >
                <div className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-white/60 bg-white/95 p-4 shadow-xl ring-1 backdrop-blur ${tone.ring}`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.iconBg} ${tone.iconText}`}>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">Berhasil</p>
                        <p className="mt-1 text-sm text-slate-600">{message}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShow(false)}
                        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </Transition>
        </div>
    );
}
