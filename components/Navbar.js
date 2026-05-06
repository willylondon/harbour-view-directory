import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [session, setSession] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const isActive = path => router.pathname === path || (path === '/' && router.pathname === '/');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            if (s) checkAdmin(s);
            else setAuthReady(true);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            if (s) checkAdmin(s);
            else { setIsAdmin(false); setAuthReady(true); }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function checkAdmin(s) {
        // Check session metadata first (no table query needed)
        const meta = s?.user?.app_metadata || {};
        if (meta.role === 'admin' || meta.is_admin === true) {
            setIsAdmin(true);
            setAuthReady(true);
            return;
        }

        // Fallback: check profiles table
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role, is_admin')
                .eq('id', s.user.id)
                .maybeSingle();
            if (error) console.warn('Admin check error:', error.message);
            setIsAdmin(data?.role === 'admin' || data?.is_admin === true);
        } catch (err) {
            console.warn('Admin check failed:', err.message);
            setIsAdmin(false);
        } finally {
            setAuthReady(true);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setMobileOpen(false);
        router.push('/');
    }

    const links = [
        { href: '/', label: 'Directory' },
        { href: '/events', label: 'Events' },
        { href: '/pricing', label: 'Pricing' },
    ];

    const loggedIn = !!session;

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
            <div className="container-premium flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl text-text tracking-tight shrink-0">
                    <span className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-sm">HV</span>
                    Harbour View
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {links.map(l => (
                        <Link key={l.href} href={l.href}
                            className={`px-4 py-2 rounded-btn text-sm font-medium transition ${
                                isActive(l.href) ? 'bg-brand-soft text-brand' : 'text-text-soft hover:text-text hover:bg-bg-alt'
                            }`}>
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-2">
                    {!authReady ? (
                        <div className="w-20 h-8 bg-bg-alt rounded-btn animate-pulse" />
                    ) : loggedIn ? (
                        <>
                            <Link href="/dashboard" className={`text-sm font-medium px-4 py-2 rounded-btn transition ${
                                isActive('/dashboard') ? 'bg-brand-soft text-brand' : 'text-text-soft hover:text-text hover:bg-bg-alt'
                            }`}>Dashboard</Link>
                            {isAdmin && (
                                <Link href="/admin" className="text-sm font-medium px-4 py-2 rounded-btn transition bg-brand-warm/10 text-brand-warm hover:bg-brand-warm/20">
                                    Admin
                                </Link>
                            )}
                            <button onClick={handleLogout} className="text-sm font-medium text-text-soft hover:text-red-600 px-4 py-2 rounded-btn transition">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-text-soft hover:text-text px-4 py-2 rounded-btn transition">Login</Link>
                            <Link href="/post-ad" className="bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-btn hover:bg-brand-deep transition shadow-sm">
                                List Your Business
                            </Link>
                        </>
                    )}
                </div>

                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-text-soft hover:text-text">
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-surface px-6 py-4 space-y-2">
                    {links.map(l => (
                        <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                            className={`block px-4 py-2.5 rounded-btn text-sm font-medium ${
                                isActive(l.href) ? 'bg-brand-soft text-brand' : 'text-text-soft hover:text-text'
                            }`}>{l.label}</Link>
                    ))}
                    <hr className="border-border" />
                    {loggedIn ? (
                        <>
                            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-btn text-sm font-medium text-text-soft">Dashboard</Link>
                            {isAdmin && (
                                <Link href="/admin" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-btn text-sm font-medium text-brand-warm bg-brand-warm/5">Admin Panel</Link>
                            )}
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 rounded-btn text-sm font-medium text-red-600">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-btn text-sm font-medium text-text-soft">Login</Link>
                            <Link href="/post-ad" onClick={() => setMobileOpen(false)} className="block bg-brand text-white text-center text-sm font-bold py-3 rounded-btn">List Your Business</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
