import MathContent from '@/Components/MathContent';
import { usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

export default function WahoChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState('');
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('chat'); // 'chat' | 'history'
    const [historySessions, setHistorySessions] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && viewMode === 'chat' && sessionId) {
            scrollToBottom();
        }
    }, [messages, isOpen, viewMode]);

    // Load initial or active session messages when widget opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            fetchMessages();
        }
    }, [isOpen]);

    const fetchMessages = async (targetSessionId = null) => {
        try {
            setLoading(true);
            const res = await axios.get(route('waho-chat.index'), {
                params: { session_id: targetSessionId },
            });
            setSessionId(res.data.session_id);
            setMessages(res.data.messages || []);
            setViewMode('chat');
        } catch (error) {
            console.error('Failed to load Waho chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await axios.get(route('waho-chat.history'));
            setHistorySessions(res.data.sessions || []);
            setViewMode('history');
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const toggleHistoryMode = () => {
        if (viewMode === 'chat') {
            fetchHistory();
        } else {
            setViewMode('chat');
        }
    };

    const handleNewChat = () => {
        setSessionId('');
        setMessages([]);
        setViewMode('chat');
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        const text = inputMessage.trim();
        if (!text || loading) return;

        setInputMessage('');

        // Optimistic update for user message
        const tempUserMsg = {
            id: 'temp-' + Date.now(),
            role: 'user',
            content: text,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempUserMsg]);
        setLoading(true);

        try {
            const res = await axios.post(route('waho-chat.store'), {
                message: text,
                session_id: sessionId || null,
            });

            setSessionId(res.data.session_id);

            setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
                return [
                    ...filtered,
                    res.data.user_message,
                    res.data.assistant_message,
                ];
            });
        } catch (error) {
            console.error('Waho send message error:', error);
            const errorMsg = {
                id: 'err-' + Date.now(),
                role: 'assistant',
                content: 'Maaf ya, Waho mengalami gangguan jaringan. Coba kirim lagi nanti.',
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const quickCategorySelect = (text) => {
        setInputMessage(text);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none ring-4 ring-blue-500/20"
                    title="Tanya Waho AI"
                >
                    {/* Waho Robot Icon */}
                    <div className="flex flex-col items-center justify-center">
                        <Icon icon="lucide:bot" className="w-8 h-8 text-white" />
                    </div>
                    {/* Online Dot */}
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                    </span>
                </button>
            )}

            {/* Chat Popup Window */}
            {isOpen && (
                <div className="flex h-[560px] w-[370px] sm:w-[400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80 transition-all duration-300">
                    {/* UI Header Chat Window (Primary Blue Theme) */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-5 py-4 text-white shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30">
                                <Icon icon="lucide:bot" className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base tracking-wide text-white drop-shadow-sm flex items-center gap-1">
                                    WAHO
                                    <span className="text-[10px] bg-white/30 text-white font-semibold px-1.5 py-0.5 rounded-full">
                                        AI
                                    </span>
                                </h3>
                                <p className="text-[11px] text-blue-100 font-medium">Asisten Cerdas Belajar Siswa</p>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={handleNewChat}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                                title="Percakapan Baru"
                            >
                                <Icon icon="lucide:plus" className="w-4 h-4" />
                            </button>

                            <button
                                onClick={toggleHistoryMode}
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                                    viewMode === 'history' ? 'bg-white text-blue-600' : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                                title="Riwayat Chat"
                            >
                                <Icon icon="lucide:history" className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                                title="Tutup"
                            >
                                <Icon icon="lucide:x" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* HISTORY VIEW */}
                    {viewMode === 'history' ? (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                Riwayat Percakapan Waho
                            </h4>
                            {loadingHistory ? (
                                <div className="py-10 text-center text-xs text-slate-400">
                                    Memuat riwayat...
                                </div>
                            ) : historySessions.length === 0 ? (
                                <div className="py-10 text-center text-xs text-slate-400">
                                    Belum ada riwayat percakapan.
                                </div>
                            ) : (
                                historySessions.map((s) => (
                                    <button
                                        key={s.session_id}
                                        onClick={() => fetchMessages(s.session_id)}
                                        className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition group"
                                    >
                                        <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1">
                                            {s.title}
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                                            <span>{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                                            <span className="font-semibold text-blue-500">Pilih →</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    ) : (
                        /* CHAT VIEW */
                        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/50">
                            {/* Message List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* WELCOME SCREEN (If no messages) */}
                                {messages.length === 0 && !loading && (
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <div className="relative mb-3">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-4xl shadow-md border-4 border-white">
                                                <Icon icon="lucide:bot" className="w-10 h-10 text-white" />
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-800">
                                            Halo, Saya Waho
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                                            Ada yang bisa Waho bantu hari ini?
                                        </p>

                                        {/* Quick Suggestion Categories */}
                                        <div className="mt-6 w-full space-y-2 text-left">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                Pilih kategori cepat:
                                            </p>
                                            <button
                                                onClick={() => quickCategorySelect('Bagaimana cara mendaftar kursus baru?')}
                                                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50/30 transition shadow-sm group"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                    Registrasi & Kursus
                                                </span>
                                                <span className="text-slate-400 group-hover:text-blue-500">↗</span>
                                            </button>

                                            <button
                                                onClick={() => quickCategorySelect('Bagaimana cara melihat hasil kuis saya?')}
                                                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50/30 transition shadow-sm group"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                                    Laporan Nilai & Kuis
                                                </span>
                                                <span className="text-slate-400 group-hover:text-blue-500">↗</span>
                                            </button>

                                            <button
                                                onClick={() => quickCategorySelect('Berikan tips belajar TKA Matematika yang efektif')}
                                                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50/30 transition shadow-sm group"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                                    Tips Belajar TKA
                                                </span>
                                                <span className="text-slate-400 group-hover:text-blue-500">↗</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Chat Messages List */}
                                {messages.map((msg) => {
                                    const isUser = msg.role === 'user';
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {!isUser && (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm border border-blue-500">
                                                    <Icon icon="lucide:bot" className="w-4 h-4 text-white" />
                                                </div>
                                            )}

                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                                                    isUser
                                                        ? 'bg-blue-600 text-white rounded-br-none font-medium'
                                                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-none'
                                                }`}
                                            >
                                                {isUser ? (
                                                    msg.content
                                                ) : (
                                                    <MathContent content={msg.content} isMarkdown />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {loading && (
                                    <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                                            <Icon icon="lucide:bot" className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div className="flex gap-1 items-center bg-white border border-slate-200 px-3 py-2 rounded-xl">
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* UI Chat Input Area */}
                            <form
                                onSubmit={handleSendMessage}
                                className="border-t border-slate-200 bg-white p-3 flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Ketik pertanyaan Anda..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />

                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim() || loading}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40 shadow-sm"
                                    title="Kirim"
                                >
                                    <Icon icon="lucide:send" className="w-4 h-4 text-white" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
