import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import Toast from '@/Components/Toast';
import WahoChatWidget from '@/Components/WahoChatWidget';
import { Icon } from '@iconify/react';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const navIcons = {
    Dashboard: <Icon icon="lucide:layout-dashboard" className="w-5 h-5" />,
    Users: <Icon icon="lucide:users" className="w-5 h-5" />,
    Subjects: <Icon icon="lucide:book-open" className="w-5 h-5" />,
    'Question Bank': <Icon icon="lucide:file-question" className="w-5 h-5" />,
    Quiz: <Icon icon="lucide:file-text" className="w-5 h-5" />,
    Courses: <Icon icon="lucide:graduation-cap" className="w-5 h-5" />,
    'Kursus Saya': <Icon icon="lucide:book-marked" className="w-5 h-5" />,
    'Permintaan Kursus': <Icon icon="lucide:clipboard-check" className="w-5 h-5" />,
    Materi: <Icon icon="lucide:folder-open" className="w-5 h-5" />,
    Results: <Icon icon="lucide:bar-chart-2" className="w-5 h-5" />,
    'Legacy Results': <Icon icon="lucide:bar-chart-2" className="w-5 h-5" />,
    Statistics: <Icon icon="lucide:trending-up" className="w-5 h-5" />,
    'My Results': <Icon icon="lucide:award" className="w-5 h-5" />,
    'Hasil Kuis': <Icon icon="lucide:bar-chart-3" className="w-5 h-5" />,
    'Izin Quiz': <Icon icon="lucide:key-round" className="w-5 h-5" />,
    'Daftar Kursus': <Icon icon="lucide:library" className="w-5 h-5" />,
    'Hasil Saya': <Icon icon="lucide:check-circle-2" className="w-5 h-5" />,
    'Pengaturan Web': <Icon icon="lucide:settings" className="w-5 h-5" />,
};

export default function AuthenticatedLayout({ header, children, cleanLayout = false }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [toastMessage, setToastMessage] = useState(flash?.success ?? '');

    useEffect(() => {
        setToastMessage(flash?.success ?? '');
    }, [flash?.success]);

    const getNavigation = () => {
        const baseNav = [
            { href: route('dashboard'), label: 'Dashboard', active: 'dashboard' }
        ];

        if (user.role === 'admin') {
            return [
                ...baseNav,
                { href: route('users.index'), label: 'Users', active: 'users.*' },
                { href: route('subjects.index'), label: 'Subjects', active: 'subjects.*' },
                { href: route('questions.index'), label: 'Question Bank', active: 'questions.*' },
                { href: route('quizzes.index'), label: 'Quiz', active: 'quizzes.*' },
                { href: route('courses.index'), label: 'Courses', active: 'courses.*' },
                { href: route('admin.quiz-reports.index'), label: 'Hasil Kuis', active: 'admin.quiz-reports.*' },
                { href: route('course-enrollment-requests.index'), label: 'Permintaan Kursus', active: 'course-enrollment-requests.*' },
                { href: route('materials.index'), label: 'Materi', active: 'materials.*' },
                { href: route('admin.settings.edit'), label: 'Pengaturan Web', active: 'admin.settings.*' },
            ];
        } else if (user.role === 'guru') {
            return [
                ...baseNav,
                { href: route('questions.index'), label: 'Question Bank', active: 'questions.*' },
                { href: route('quizzes.index'), label: 'Quiz', active: 'quizzes.*' },
                { href: route('courses.index'), label: 'Courses', active: 'courses.*' },
                { href: route('admin.quiz-reports.index'), label: 'Hasil Kuis', active: 'admin.quiz-reports.*' },
                { href: route('course-enrollment-requests.index'), label: 'Permintaan Kursus', active: 'course-enrollment-requests.*' },
                { href: route('materials.index'), label: 'Materi', active: 'materials.*' },
            ];
        } else {
            return [
                ...baseNav,
                { href: route('student.my-courses.index'), label: 'Kursus Saya', active: 'student.my-courses.*' },
                { href: route('student.courses.index'), label: 'Daftar Kursus', active: 'student.courses.*' },
                { href: route('quiz-results.index'), label: 'Hasil Saya', active: 'quiz-results.*' },
            ];
        }
    };

    const navigation = getNavigation();

    return (
        <div className="min-h-screen bg-slate-50">
            <Toast message={toastMessage} />
            
            {!cleanLayout && (
                <>
                    {/* Mobile sidebar overlay */}
                    <div
                        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                    
                    {/* Sidebar */}
                    <div
                        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${
                            sidebarCollapsed ? 'w-20' : 'w-64'
                        } ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}
                    >
                        <div className="flex flex-col h-full">
                            {/* Logo & Collapse Button */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <Link href="/" className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                                    {sidebarCollapsed ? (
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">T</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">T</span>
                                            </div>
                                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                TKA LMS
                                            </span>
                                        </div>
                                    )}
                                </Link>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 overflow-y-auto px-3 py-6">
                                {navigation.map((item) => {
                                    const isActive = route().current(item.active);
                                    const isEnrollmentReq = item.label === 'Permintaan Kursus';
                                    const hasPending = isEnrollmentReq && (usePage().props.pendingEnrollmentsCount > 0);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`group relative flex items-center gap-3 px-4 py-3 my-1 rounded-xl transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                        >
                                            <span className={`relative transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                                {navIcons[item.label]}
                                                {hasPending && sidebarCollapsed && (
                                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
                                                )}
                                            </span>
                                            {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}

                                            {hasPending && !sidebarCollapsed && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white shadow-sm animate-pulse">
                                                    {usePage().props.pendingEnrollmentsCount}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Collapse Toggle (Desktop) */}
                            <div className="border-t border-slate-100 px-4 py-4">
                                <button
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    className="hidden lg:flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all duration-200"
                                >
                                    <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                    {!sidebarCollapsed && <span>Collapse</span>}
                                </button>
                            </div>

                            {/* User Profile */}
                            <div className="border-t border-slate-100 px-3 py-4">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex w-full">
                                            <button
                                                type="button"
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-slate-50 transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                {!sidebarCollapsed && (
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
                                                        <div className="text-xs text-slate-500 truncate capitalize">{user.role}</div>
                                                    </div>
                                                )}
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content className="w-64">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-3">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Profile
                                            </Dropdown.Link>
                                        </div>
                                        <div className="border-t border-slate-100 py-1">
                                            <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Log Out
                                            </Dropdown.Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className={`transition-all duration-300 ${cleanLayout ? 'pl-0' : (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64')} flex flex-col flex-1`}>
                {/* Top Navigation */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex flex-1 items-center gap-4 mr-6">
                            {!cleanLayout && (
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-100"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            )}
                            <div className="w-full">
                                {header}
                            </div>
                        </div>

                        {!cleanLayout && (
                            <div className="flex items-center gap-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-xl">
                                            <button
                                                type="button"
                                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:bg-slate-50 focus:outline-none"
                                            >
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.name}
                                                        className="h-9 w-9 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="hidden min-w-0 sm:block text-left">
                                                    <div className="truncate text-sm font-semibold text-slate-800">{user.name}</div>
                                                    <div className="truncate text-xs text-slate-500 capitalize">{user.role}</div>
                                                </div>
                                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content className="w-56">
                                        <div className="border-b border-slate-100 px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                                        </div>

                                        <div className="py-1">
                                            <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-3 text-slate-700 hover:bg-slate-50">
                                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Pengaturan Profil
                                            </Dropdown.Link>
                                        </div>

                                        <div className="border-t border-slate-100 py-1">
                                            <Dropdown.Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-3 text-red-600 hover:bg-red-50 hover:text-red-700">
                                                <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </Dropdown.Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>

            {/* Floating Waho AI Chatbot Widget (Only shown when not in cleanLayout mode, i.e. not during quiz attempts) */}
            {!cleanLayout && <WahoChatWidget />}
        </div>
    );
}
