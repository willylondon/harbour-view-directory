import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function Dashboard() {
    const [session, setSession] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                router.push('/login');
            } else {
                fetchUserVendors(session.user.id);
                checkAdmin(session.user.id);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [router]);

    async function checkAdmin(userId) {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('role, is_admin')
                .eq('id', userId)
                .single();
            setIsAdmin(data?.role === 'admin' || data?.is_admin === true);
        } catch {
            setIsAdmin(false);
        }
    }

    async function fetchUserVendors(userId) {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('id, business_name, category, slug, is_approved, created_at')
                .eq('user_id', userId);

            if (error) throw error;
            if (data) setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push('/');
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-bg">
                <Navbar />
                <div className="pt-32 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-bg">
            <Head><title>Dashboard | Harbour View Directory</title></Head>
            <Navbar />
            <main className="container-premium pt-28 pb-16">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-extrabold text-text">Your Dashboard</h1>
                            {isAdmin && (
                                <span className="bg-brand-warm text-white text-xs font-bold px-3 py-1 rounded-full">Admin</span>
                            )}
                        </div>
                        <p className="text-text-soft">{session.user.email}</p>
                    </div>
                    <button onClick={handleSignOut}
                        className="text-red-600 font-bold px-4 py-2 rounded-btn border border-red-200 hover:bg-red-50 transition">
                        Sign Out
                    </button>
                </div>

                {isAdmin && (
                    <div className="card-premium p-5 mb-6 bg-brand-warm/5 border-brand-warm/20 flex items-center justify-between">
                        <div>
                            <span className="font-bold text-text">Admin Access</span>
                            <p className="text-sm text-text-soft">You have admin privileges. Manage vendors, events, and site settings.</p>
                        </div>
                        <Link href="/admin" className="bg-brand-warm text-white text-sm font-bold px-5 py-2.5 rounded-btn hover:bg-amber-500 transition">Admin Panel →</Link>
                    </div>
                )}

                <div className="card-premium p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-text">Your Listings</h2>
                        <button className="bg-brand text-white font-bold px-4 py-2 rounded-btn hover:bg-brand-deep transition shadow-sm">
                            + New Listing
                        </button>
                    </div>
                    {vendors.length > 0 ? (
                        <div className="border border-border rounded-btn divide-y divide-border">
                            {vendors.map(vendor => (
                                <div key={vendor.id} className="p-4 flex justify-between items-center hover:bg-bg-alt transition">
                                    <div>
                                        <h3 className="font-bold text-text">{vendor.business_name}</h3>
                                        <p className="text-sm text-text-soft">{vendor.category}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/vendor/${vendor.slug || vendor.id}`} className="text-brand font-semibold text-sm hover:underline px-3 py-1">View</Link>
                                        <button className="text-text-soft font-semibold text-sm hover:underline px-3 py-1">Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-dashed border-border rounded-btn bg-bg-alt">
                            <p className="text-text-soft mb-4">You don't have any vendor listings yet.</p>
                            <Link href="/post-ad" className="bg-brand-warm text-white font-bold px-6 py-2 rounded-btn hover:bg-amber-500 transition inline-block">Create First Listing</Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
