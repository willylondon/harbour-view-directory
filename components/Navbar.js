import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const isActive = path => router.pathname === path || (path === '/' && router.pathname === '/');

    const links = [
        { href: '/', label: 'Directory' },
        { href: '/events', label: 'Events' },
        { href: '/pricing', label: 'Pricing' },
    ];

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
                    <Link href="/login" className="text-sm font-medium text-text-soft hover:text-text px-4 py-2 rounded-btn transition">
                        Login
                    </Link>
                    <Link href="/post-ad" className="bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-btn hover:bg-brand-deep transition shadow-sm">
                        List Your Business
                    </Link>
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
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-btn text-sm font-medium text-text-soft">Login</Link>
                    <Link href="/post-ad" onClick={() => setMobileOpen(false)} className="block bg-brand text-white text-center text-sm font-bold py-3 rounded-btn">List Your Business</Link>
                </div>
            )}
        </header>
    );
}
