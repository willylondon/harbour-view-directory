import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase, getImageUrl, RENTAL_IMAGES_BUCKET } from '../lib/supabase';

export default function AdminPage() {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);
    const [activeSection, setActiveSection] = useState('overview'); // overview, rentals, vendors, events
    const [rentals, setRentals] = useState([]);
    const [activeRentalTab, setActiveRentalTab] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        checkAccess();
    }, []);

    useEffect(() => {
        if (activeSection === 'rentals') {
            fetchRentals();
        }
    }, [activeSection]);

    async function checkAccess() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        const meta = session.user.app_metadata || {};
        if (meta.role === 'admin' || meta.is_admin === true) {
            setUser(session.user);
            setAuthorized(true);
            setChecking(false);
            return;
        }

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

    async function fetchRentals() {
        setLoading(true);
        const { data, error } = await supabase
            .from('rentals')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching rentals:', error);
        } else {
            setRentals(data || []);
        }
        setLoading(false);
    }

    async function handleRentalAction(id, action) {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/rentals/${action}?id=${id}`, {
                method: 'POST'
            });
            const result = await res.json();
            if (result.success) {
                // Refresh data
                await fetchRentals();
            } else {
                alert(result.error || 'Action failed');
            }
        } catch (err) {
            alert('Error performing action');
        } finally {
            setActionLoading(null);
        }
    }

    if (checking || !authorized) {
        return (
            <div className="min-h-screen bg-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
            </div>
        );
    }

    const filteredRentals = rentals.filter(r => {
        if (activeRentalTab === 'all') return true;
        if (activeRentalTab === 'pending') return r.status === 'pending';
        if (activeRentalTab === 'approved') return r.status === 'approved';
        if (activeRentalTab === 'rejected') return r.status === 'rejected';
        if (activeRentalTab === 'rented') return r.status === 'rented';
        if (activeRentalTab === 'expired') {
            const isExpired = r.expires_at && new Date(r.expires_at) < new Date();
            return isExpired;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-bg">
            <Head><title>Admin Panel | Harbour View Directory</title></Head>
            <Navbar />
            <main className="container-premium pt-28 pb-16">
                
                {/* Header */}
                <div className="max-w-6xl mx-auto mb-8 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-brand-warm text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
                            {activeSection !== 'overview' && (
                                <button onClick={() => setActiveSection('overview')} className="text-xs font-bold text-brand hover:underline">← Back to Overview</button>
                            )}
                        </div>
                        <h1 className="text-3xl font-extrabold text-text">
                            {activeSection === 'overview' ? 'Admin Panel' : activeSection === 'rentals' ? 'Manage Rentals' : 'Admin'}
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-text-muted">Logged in as</p>
                        <p className="text-sm font-bold text-text">{user?.email}</p>
                    </div>
                </div>

                {activeSection === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <button onClick={() => setActiveSection('rentals')} className="card-premium p-8 text-left hover:border-brand transition group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏠</div>
                            <h3 className="font-bold text-text mb-2">Manage Rentals</h3>
                            <p className="text-sm text-text-muted mb-4">Review, approve, and manage "Rent Near CMU" listings.</p>
                            <span className="text-xs font-bold text-brand">Open Section →</span>
                        </button>

                        <div className="card-premium p-8 opacity-50 cursor-not-allowed">
                            <div className="text-4xl mb-4">🏢</div>
                            <h3 className="font-bold text-text mb-2">Manage Vendors</h3>
                            <p className="text-sm text-text-muted">View and edit business listings.</p>
                        </div>

                        <div className="card-premium p-8 opacity-50 cursor-not-allowed">
                            <div className="text-4xl mb-4">📅</div>
                            <h3 className="font-bold text-text mb-2">Manage Events</h3>
                            <p className="text-sm text-text-muted">Review community event submissions.</p>
                        </div>
                    </div>
                )}

                {activeSection === 'rentals' && (
                    <div className="max-w-6xl mx-auto">
                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-8 bg-surface p-1 rounded-btn border border-border">
                            {['pending', 'approved', 'rented', 'rejected', 'expired', 'all'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveRentalTab(tab)}
                                    className={`px-4 py-2 rounded-btn text-sm font-bold transition capitalize ${
                                        activeRentalTab === tab ? 'bg-brand text-white shadow-sm' : 'text-text-soft hover:bg-bg-alt'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand" />
                            </div>
                        ) : filteredRentals.length === 0 ? (
                            <div className="card-premium p-20 text-center text-text-soft">
                                No rentals found in this category.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRentals.map(rental => (
                                    <div key={rental.id} className="card-premium bg-white p-6 flex flex-col md:flex-row gap-6 items-start">
                                        {/* Image */}
                                        <div className="w-full md:w-48 h-32 rounded-btn bg-bg-alt overflow-hidden border border-border flex-shrink-0">
                                            {rental.photos?.length > 0 ? (
                                                <img 
                                                    src={getImageUrl(rental.photos[0], RENTAL_IMAGES_BUCKET)} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🏠</div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                    rental.status === 'approved' ? 'bg-success-soft text-success' :
                                                    rental.status === 'pending' ? 'bg-brand-soft text-brand-deep' :
                                                    'bg-bg-alt text-text-muted'
                                                }`}>
                                                    {rental.status}
                                                </span>
                                                <span className="text-xs text-text-muted">ID: {rental.id.split('-')[0]}</span>
                                                <span className="text-xs text-text-muted ml-auto">Added {new Date(rental.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <h3 className="text-lg font-bold text-text mb-1">{rental.title}</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 mb-4">
                                                <div className="text-xs">
                                                    <span className="text-text-muted block">Landlord (Private):</span>
                                                    <span className="font-semibold">{rental.landlord_name || 'N/A'}</span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="text-text-muted block">Contact:</span>
                                                    <span className="font-semibold">{rental.contact_name} ({rental.whatsapp})</span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="text-text-muted block">Price:</span>
                                                    <span className="font-semibold text-brand">JMD ${rental.price.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                                                <a href={`/rent-near-cmu/${rental.slug}`} target="_blank" className="px-3 py-1.5 bg-bg-alt text-text text-xs font-bold rounded-btn hover:bg-border transition">Preview</a>
                                                
                                                {rental.status === 'pending' && (
                                                    <>
                                                        <button 
                                                            disabled={actionLoading === rental.id}
                                                            onClick={() => handleRentalAction(rental.id, 'approve')}
                                                            className="px-3 py-1.5 bg-success text-white text-xs font-bold rounded-btn hover:bg-emerald-600 transition disabled:opacity-50"
                                                        >Approve</button>
                                                        <button 
                                                            disabled={actionLoading === rental.id}
                                                            onClick={() => handleRentalAction(rental.id, 'reject')}
                                                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-btn hover:bg-red-700 transition disabled:opacity-50"
                                                        >Reject</button>
                                                    </>
                                                )}

                                                {rental.status === 'approved' && (
                                                    <>
                                                        <button 
                                                            disabled={actionLoading === rental.id}
                                                            onClick={() => handleRentalAction(rental.id, 'mark_rented')}
                                                            className="px-3 py-1.5 bg-brand text-white text-xs font-bold rounded-btn hover:bg-brand-deep transition disabled:opacity-50"
                                                        >Mark Rented</button>
                                                        <button 
                                                            disabled={actionLoading === rental.id}
                                                            onClick={() => handleRentalAction(rental.id, 'renew')}
                                                            className="px-3 py-1.5 bg-bg-alt text-brand text-xs font-bold border border-brand rounded-btn hover:bg-brand-soft transition disabled:opacity-50"
                                                        >Renew 90 Days</button>
                                                    </>
                                                )}

                                                {(rental.status === 'rejected' || rental.status === 'rented') && (
                                                    <button 
                                                        disabled={actionLoading === rental.id}
                                                        onClick={() => handleRentalAction(rental.id, 'approve')}
                                                        className="px-3 py-1.5 bg-success text-white text-xs font-bold rounded-btn hover:bg-emerald-600 transition disabled:opacity-50"
                                                    >Re-Approve</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
}
