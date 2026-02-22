import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
    const [session, setSession] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                router.push('/login');
            } else {
                fetchUserVendors(session.user.id);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [router]);

    async function fetchUserVendors(userId) {
        try {
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
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
            <div className="min-h-screen bg-bg-primary">
                <Navbar />
                <div className="pt-32 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-bg-card">
            <Head>
                <title>Dashboard | Harbour View Directory</title>
            </Head>
            <Navbar />

            <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Your Dashboard</h1>
                        <p className="text-gray-600">Logged in as {session.user.email}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-red-600 font-bold px-4 py-2 rounded border border-red-200 hover:bg-red-50 transition"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Listings</h2>
                        <button className="bg-brand-blue text-white font-bold px-4 py-2 rounded hover:bg-blue-700 transition shadow-sm">
                            + New Listing
                        </button>
                    </div>

                    {vendors.length > 0 ? (
                        <div className="border border-gray-100 rounded-lg divide-y divide-gray-100">
                            {vendors.map(vendor => (
                                <div key={vendor.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{vendor.business_name}</h3>
                                        <p className="text-sm text-gray-500">{vendor.category}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/vendor/${vendor.id}`} className="text-brand-blue font-semibold text-sm hover:underline px-3 py-1">View</Link>
                                        <button className="text-gray-600 font-semibold text-sm hover:underline px-3 py-1">Edit</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <p className="text-gray-500 mb-4">You don't have any vendor listings yet.</p>
                            <button className="bg-brand-yellow text-gray-900 font-bold px-6 py-2 rounded shadow-sm hover:bg-yellow-400 transition">
                                Create First Listing
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
