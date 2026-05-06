import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkAccess();
    }, []);

    async function checkAccess() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        // Check app_metadata first
        const meta = session.user.app_metadata || {};
        if (meta.role === 'admin' || meta.is_admin === true) {
            setUser(session.user);
            setAuthorized(true);
            setChecking(false);
            return;
        }

        // Fallback: check profiles table
        try {
            const { data } = await supabase
                .from('profiles')
                .select('role, is_admin')
                .eq('id', session.user.id)
                .maybeSingle();
            if (data?.role === 'admin' || data?.is_admin === true) {
                setUser(session.user);
                setAuthorized(true);
                setChecking(false);
                return;
            }
        } catch {}

        router.push('/dashboard');
    }

    if (checking || !authorized) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg">
            <Head><title>Admin Panel | Harbour View Directory</title></Head>
            <Navbar />
            <main className="container-premium pt-28 pb-16">
                <div className="card-premium p-8 max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="bg-brand-warm text-white text-xs font-bold px-3 py-1.5 rounded-full">Admin</span>
                        <h1 className="text-3xl font-extrabold text-text">Admin Panel</h1>
                    </div>
                    <p className="text-text-soft mb-6">Logged in as <strong>{user?.email}</strong></p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="card-premium p-6">
                            <h3 className="font-bold text-text mb-3">Pending Approvals</h3>
                            <p className="text-sm text-text-muted">Review and approve new vendor listings and events.</p>
                        </div>
                        <div className="card-premium p-6">
                            <h3 className="font-bold text-text mb-3">Manage Vendors</h3>
                            <p className="text-sm text-text-muted">View, edit, feature, or remove vendor listings.</p>
                        </div>
                        <div className="card-premium p-6">
                            <h3 className="font-bold text-text mb-3">Manage Events</h3>
                            <p className="text-sm text-text-muted">Approve, feature, or remove community events.</p>
                        </div>
                        <div className="card-premium p-6">
                            <h3 className="font-bold text-text mb-3">Site Settings</h3>
                            <p className="text-sm text-text-muted">Configure directory settings, featured content, and more.</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
