import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const [avatarPreview, setAvatarPreview] = useState(user.avatar_url ?? null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'PATCH',
            name: user.name ?? '',
            email: user.email ?? '',
            avatar: null,
            birth_place: user.birth_place ?? '',
            birth_date: user.birth_date ?? '',
            gender: user.gender ?? '',
            address: user.address ?? '',
        });

    const [rawImageSrc, setRawImageSrc] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setRawImageSrc(reader.result);
                setZoom(1);
                setPosition({ x: 0, y: 0 });
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
        }
    };

    const handleTouchMove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        setPosition({
            x: e.touches[0].clientX - dragStart.x,
            y: e.touches[0].clientY - dragStart.y,
        });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    // Draw preview canvas live whenever position, zoom, or rawImageSrc changes
    const drawPreview = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img || !img.complete || !img.naturalWidth) return;

        const ctx = canvas.getContext('2d');
        const size = 256; // Viewport size 256x256
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);

        // Circular mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate aspect ratio fill
        let drawWidth, drawHeight;
        if (img.naturalWidth > img.naturalHeight) {
            drawHeight = size;
            drawWidth = (img.naturalWidth / img.naturalHeight) * size;
        } else {
            drawWidth = size;
            drawHeight = (img.naturalHeight / img.naturalWidth) * size;
        }

        const scaledWidth = drawWidth * zoom;
        const scaledHeight = drawHeight * zoom;

        const x = (size / 2) - (scaledWidth / 2) + position.x;
        const y = (size / 2) - (scaledHeight / 2) + position.y;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        ctx.restore();
    };

    useEffect(() => {
        if (showCropModal && rawImageSrc) {
            drawPreview();
        }
    }, [showCropModal, rawImageSrc, position, zoom]);

    const applyCrop = () => {
        const previewCanvas = canvasRef.current;
        if (!previewCanvas) return;

        // Render to high-res canvas (400x400)
        const outputCanvas = document.createElement('canvas');
        const outputSize = 400;
        outputCanvas.width = outputSize;
        outputCanvas.height = outputSize;
        const ctx = outputCanvas.getContext('2d');

        const scale = outputSize / 256;
        ctx.drawImage(previewCanvas, 0, 0, 256, 256, 0, 0, outputSize, outputSize);

        outputCanvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], 'cropped_avatar.png', { type: 'image/png' });
                setData('avatar', croppedFile);
                setAvatarPreview(outputCanvas.toDataURL('image/png'));
                setShowCropModal(false);
            }
        }, 'image/png', 0.95);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-bold text-slate-900">
                    Data Diri & Pengaturan Profil
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Perbarui foto profil, informasi pribadi, dan alamat email Anda.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Upload Avatar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="relative">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-3xl text-white shadow-lg">
                                {data.name ? data.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="avatar" value="Foto Profil (Avatar)" className="font-bold text-slate-900 text-sm" />
                        <label
                            htmlFor="avatar"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 cursor-pointer transition active:scale-95"
                        >
                            Pilih dan Potong Foto (Crop)
                        </label>
                        <input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                        <p className="text-xs text-slate-500 font-medium">Klik untuk memilih foto baru, lalu geser dan perbesar posisi lingkaran.</p>
                        <InputError className="mt-2" message={errors.avatar} />
                    </div>
                </div>

                {/* MODAL CROP & POSISI FOTO */}
                {showCropModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div className="max-w-md w-full rounded-3xl bg-white p-6 shadow-2xl space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-black text-slate-900">
                                    Atur Posisi dan Ukuran Foto
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCropModal(false)}
                                    className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-xs font-semibold text-slate-500 text-center">
                                Klik dan tahan untuk <span className="text-slate-900 font-bold">menggeser posisi</span> foto di dalam lingkaran.
                            </p>

                            {/* CROP CANVAS VIEWPORT */}
                            <div className="flex justify-center">
                                <div
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    className="relative h-64 w-64 rounded-full border-4 border-blue-500 shadow-xl overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
                                >
                                    <canvas
                                        ref={canvasRef}
                                        className="h-64 w-64 rounded-full pointer-events-none"
                                    />
                                    <img
                                        ref={imgRef}
                                        src={rawImageSrc}
                                        alt="Crop source"
                                        onLoad={drawPreview}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* ZOOM SLIDER CONTROL */}
                            <div className="space-y-1.5 pt-2">
                                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                    <span>Skala Perbesar (Zoom):</span>
                                    <span>{Math.round(zoom * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3"
                                    step="0.05"
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full h-2 rounded-lg bg-slate-200 accent-blue-600 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowCropModal(false)}
                                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={applyCrop}
                                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition"
                                >
                                    Simpan Potongan Foto
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nama Lengkap */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full rounded-xl border-slate-300"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* TTL (Tempat & Tanggal Lahir) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="birth_place" value="Tempat Lahir" />
                        <TextInput
                            id="birth_place"
                            className="mt-1 block w-full rounded-xl border-slate-300"
                            value={data.birth_place}
                            onChange={(e) => setData('birth_place', e.target.value)}
                            placeholder="Contoh: Jakarta"
                        />
                        <InputError className="mt-2" message={errors.birth_place} />
                    </div>
                    <div>
                        <InputLabel htmlFor="birth_date" value="Tanggal Lahir" />
                        <TextInput
                            id="birth_date"
                            type="date"
                            className="mt-1 block w-full rounded-xl border-slate-300"
                            value={data.birth_date}
                            onChange={(e) => setData('birth_date', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.birth_date} />
                    </div>
                </div>

                {/* Jenis Kelamin */}
                <div>
                    <InputLabel value="Jenis Kelamin" className="mb-2" />
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value="L"
                                checked={data.gender === 'L'}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            Laki-laki
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value="P"
                                checked={data.gender === 'P'}
                                onChange={(e) => setData('gender', e.target.value)}
                                className="text-blue-600 focus:ring-blue-500"
                            />
                            Perempuan
                        </label>
                    </div>
                    <InputError className="mt-2" message={errors.gender} />
                </div>

                {/* Alamat Email */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full rounded-xl border-slate-300"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Alamat Tempat Tinggal */}
                <div>
                    <InputLabel htmlFor="address" value="Alamat" />
                    <textarea
                        id="address"
                        rows={3}
                        className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        placeholder="Masukkan alamat lengkap..."
                    />
                    <InputError className="mt-2" message={errors.address} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Email Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 text-sm font-semibold text-blue-600 underline hover:text-blue-800"
                            >
                                Klik di sini untuk mengirim ulang link verifikasi.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-emerald-600">
                                Link verifikasi baru telah dikirimkan ke email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                    <PrimaryButton disabled={processing} className="rounded-xl px-6 py-3 bg-blue-600 hover:bg-blue-700">
                        Simpan Perubahan
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-semibold text-emerald-600">
                            Berhasil disimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
