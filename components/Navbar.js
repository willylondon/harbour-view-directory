import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [session, setSession] = useState(null);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        const adminList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
            .split(',')
            .map((entry) => entry.trim().toLowerCase())
            .filter(Boolean);

        // Fallback to ensure primary admin is recognized even if env is stale.
        if (!adminList.includes('willardwells@gmail.com')) {
            adminList.push('willardwells@gmail.com');
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session || null);
            const email = session?.user?.email?.toLowerCase() || '';
            setIsAdmin(adminList.includes(email));
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session || null);
            const email = session?.user?.email?.toLowerCase() || '';
            setIsAdmin(adminList.includes(email));
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <header className="bg-brand-blue text-white fixed w-full top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-yellow hover:scale-105 transition-transform drop-shadow-sm">
                            Harbour View Directory
                        </h1>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-6 font-medium items-center">
                    <Link href="/">
                        <span className="cursor-pointer hover:text-brand-yellow transition">Directory</span>
                    </Link>
                    <Link href="/events">
                        <span className="cursor-pointer hover:text-brand-yellow transition">Events</span>
                    </Link>
                    <Link href="/pricing">
                        <span className="cursor-pointer hover:text-brand-yellow transition">Pricing</span>
                    </Link>
                    {isAdmin && (
                        <Link href="/admin/events">
                            <span className="cursor-pointer hover:text-brand-yellow transition">Admin</span>
                        </Link>
                    )}
                    {session && (
                        <Link href="/dashboard">
                            <span className="cursor-pointer hover:text-brand-blue bg-brand-yellow text-gray-900 px-5 py-2 rounded-md transition font-bold shadow-sm">Dashboard</span>
                        </Link>
                    )}
                    {!session && (
                        <Link href="/dashboard">
                            <span className="cursor-pointer hover:text-brand-blue bg-brand-yellow text-gray-900 px-5 py-2 rounded-md transition font-bold shadow-sm">Post Ad</span>
                        </Link>
                    )}
                    {session ? (
                        <button
                            onClick={() => supabase.auth.signOut()}
                            className="cursor-pointer bg-white text-brand-blue px-5 py-2 rounded-md hover:bg-gray-100 transition shadow-sm font-bold"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link href="/login">
                            <span className="cursor-pointer bg-white text-brand-blue px-5 py-2 rounded-md hover:bg-gray-100 transition shadow-sm font-bold">Login</span>
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Toggle Button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white hover:text-brand-yellow focus:outline-none"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-brand-blue border-t border-brand-blue/50">
                    <nav className="flex flex-col px-6 py-4 space-y-4 font-medium">
                        <Link href="/">
                            <span
                                className="block cursor-pointer hover:text-brand-yellow transition"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Directory
                            </span>
                        </Link>
                        <Link href="/events">
                            <span
                                className="block cursor-pointer hover:text-brand-yellow transition"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Events
                            </span>
                        </Link>
                        <Link href="/pricing">
                            <span
                                className="block cursor-pointer hover:text-brand-yellow transition"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Pricing
                            </span>
                        </Link>
                        {isAdmin && (
                            <Link href="/admin/events">
                                <span
                                    className="block cursor-pointer hover:text-brand-yellow transition"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Admin
                                </span>
                            </Link>
                        )}
                        {session && (
                            <Link href="/dashboard">
                                <span
                                    className="block w-full text-center cursor-pointer hover:text-brand-blue bg-brand-yellow text-gray-900 px-5 py-2 rounded-md transition font-bold shadow-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </span>
                            </Link>
                        )}
                        {!session && (
                            <Link href="/dashboard">
                                <span
                                    className="block w-full text-center cursor-pointer hover:text-brand-blue bg-brand-yellow text-gray-900 px-5 py-2 rounded-md transition font-bold shadow-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Post Ad
                                </span>
                            </Link>
                        )}
                        {session ? (
                            <button
                                onClick={() => {
                                    supabase.auth.signOut();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="block w-full text-center cursor-pointer bg-white text-brand-blue px-5 py-2 rounded-md hover:bg-gray-100 transition shadow-sm font-bold"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link href="/login">
                                <span
                                    className="block w-full text-center cursor-pointer bg-white text-brand-blue px-5 py-2 rounded-md hover:bg-gray-100 transition shadow-sm font-bold"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Login
                                </span>
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
