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
    const [activeSection, setActiveSection] = useState('overview'); // overview, rentals, rental_requests, vendors, events
    
    // Landlord Listings state
    const [rentals, setRentals] = useState([]);
    const [activeRentalTab, setActiveRentalTab] = useState('pending');
    
    // Renter Requests state
    const [rentalRequests, setRentalRequests] = useState([]);
    const [activeRequestTab, setActiveRequestTab] = useState('pending');
    
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        checkAccess();
    }, []);

    useEffect(() => {
        if (activeSection === 'rentals') {
            fetchRentals();
        } else if (activeSection === 'rental_requests') {
            fetchRentalRequests();
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

    async function fetchRentalRequests() {
        setLoading(true);
        const { data, error } = await supabase
            .from('rental_requests')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error fetching rental requests:', error);
        } else {
            setRentalRequests(data || []);
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

    async function handleRequestAction(id, action, notes = '') {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/rental-requests/${action}?id=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_notes: notes })
            });
            const result = await res.json();
            if (result.success) {
                await fetchRentalRequests();
            } else {
                alert(result.error || 'Action failed');
            }
        } catch (err) {
            alert('Error updating request');
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
            return r.expires_at && new Date(r.expires_at) < new Date();
        }
        return true;
    });

    const filteredRequests = rentalRequests.filter(req => {
        if (activeRequestTab === 'all') return true;
        if (activeRequestTab === 'pending') return req.status === 'pending';
        if (activeRequestTab === 'contacted') return req.status === 'contacted';
        if (activeRequestTab === 'matched') return req.status === 'matched';
        if (activeRequestTab === 'closed') return req.status === 'closed';
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
                            {activeSection === 'overview' ? 'Admin Panel' : 
                             activeSection === 'rentals' ? 'Manage Landlord Listings' : 
                             activeSection === 'rental_requests' ? 'Renter & Boarder Requests' : 'Admin'}
                        </h1>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-text-muted">Logged in as</p>
                        <p className="text-sm font-bold text-text">{user?.email}</p>
                    </div>
                </div>

                {activeSection === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <button onClick={() => setActiveSection('rental_requests')} className="card-premium p-8 text-left hover:border-brand transition group bg-white">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔔</div>
                            <h3 className="font-bold text-text mb-2">Renter &amp; Boarder Requests</h3>
                            <p className="text-sm text-text-muted mb-4">Review incoming room requests, target budgets, and WhatsApp matches.</p>
                            <span className="text-xs font-bold text-brand">View Inquiries →</span>
                        </button>

                        <button onClick={() => setActiveSection('rentals')} className="card-premium p-8 text-left hover:border-brand transition group bg-white">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏠</div>
                            <h3 className="font-bold text-text mb-2">Landlord Rental Listings</h3>
                            <p className="text-sm text-text-muted mb-4">Review, approve, and manage "Rent Near CMU" property submissions.</p>
                            <span className="text-xs font-bold text-brand">Manage Listings →</span>
                        </button>

                        <div className="card-premium p-8 opacity-50 cursor-not-allowed bg-white">
                            <div className="text-4xl mb-4">🏢</div>
                            <h3 className="font-bold text-text mb-2">Manage Vendors</h3>
                            <p className="text-sm text-text-muted">View and edit business listings.</p>
                        </div>
                    </div>
                )}

                {/* SECTION 1: RENTER REQUESTS */}
                {activeSection === 'rental_requests' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-wrap gap-2 mb-8 bg-surface p-1 rounded-btn border border-border">
                            {['pending', 'contacted', 'matched', 'closed', 'all'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveRequestTab(tab)}
                                    className={`px-4 py-2 rounded-btn text-sm font-bold transition capitalize ${
                                        activeRequestTab === tab ? 'bg-brand text-white shadow-sm' : 'text-text-soft hover:bg-bg-alt'
                                    }`}
                                >
                                    {tab} ({rentalRequests.filter(r => tab === 'all' ? true : r.status === tab).length})
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand" />
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="card-premium p-20 text-center text-text-soft bg-white">
                                No renter requests found in this status.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRequests.map(req => {
                                    const whatsappUrl = `https://wa.me/${req.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                        `Hi ${req.full_name}, this is Harbour View Directory regarding your room request for a ${req.requested_type} (Budget: JMD $${req.max_budget?.toLocaleString()}). We have a matching listing available!`
                                    )}`;

                                    return (
                                        <div key={req.id} className="card-premium bg-white p-6 flex flex-col md:flex-row gap-6 items-start">
                                            <div className="flex-grow">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                                                        req.status === 'matched' ? 'bg-emerald-100 text-emerald-800' :
                                                        req.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                                        req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                    {req.cmu_affiliation && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-soft text-brand-deep">
                                                            🎓 CMU Student/Staff
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-text-muted">ID: {req.id.split('-')[0]}</span>
                                                    <span className="text-xs text-text-muted ml-auto">Received {new Date(req.created_at).toLocaleDateString()}</span>
                                                </div>

                                                <h3 className="text-xl font-bold text-text mb-2">
                                                    {req.full_name} <span className="text-sm font-normal text-text-muted">({req.occupant_type})</span>
                                                </h3>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-bg-alt rounded-2xl mb-4 text-xs">
                                                    <div>
                                                        <span className="text-text-muted block font-semibold mb-0.5">Looking For</span>
                                                        <span className="font-bold text-text text-sm">{req.requested_type}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-text-muted block font-semibold mb-0.5">Max Budget</span>
                                                        <span className="font-bold text-brand text-sm">JMD ${req.max_budget ? Number(req.max_budget).toLocaleString() : 'N/A'}/mo</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-text-muted block font-semibold mb-0.5">Move-in Date</span>
                                                        <span className="font-bold text-text text-sm">{req.move_in_date || 'Flexible'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-text-muted block font-semibold mb-0.5">Duration</span>
                                                        <span className="font-bold text-text text-sm">{req.duration || 'Standard'}</span>
                                                    </div>
                                                </div>

                                                {/* Preferences */}
                                                <div className="flex flex-wrap gap-2 text-xs mb-4">
                                                    {req.need_furnished && <span className="bg-white border border-border px-2.5 py-1 rounded-full text-text-soft">🛋️ Furnished</span>}
                                                    {req.need_utilities_included && <span className="bg-white border border-border px-2.5 py-1 rounded-full text-text-soft">💡 Utilities Incl.</span>}
                                                    {req.need_parking && <span className="bg-white border border-border px-2.5 py-1 rounded-full text-text-soft">🚗 Parking</span>}
                                                    {req.email && <span className="bg-white border border-border px-2.5 py-1 rounded-full text-text-soft">✉️ {req.email}</span>}
                                                </div>

                                                {req.notes && (
                                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900 mb-4">
                                                        <strong>Renter Notes:</strong> {req.notes}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                                                    <a 
                                                        href={whatsappUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-btn hover:bg-emerald-700 transition flex items-center gap-1.5"
                                                    >
                                                        💬 Message on WhatsApp ({req.whatsapp})
                                                    </a>

                                                    {req.status === 'pending' && (
                                                        <button 
                                                            disabled={actionLoading === req.id}
                                                            onClick={() => handleRequestAction(req.id, 'mark_contacted')}
                                                            className="px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-btn hover:bg-blue-700 transition disabled:opacity-50"
                                                        >
                                                            Mark Contacted
                                                        </button>
                                                    )}

                                                    {req.status !== 'matched' && (
                                                        <button 
                                                            disabled={actionLoading === req.id}
                                                            onClick={() => handleRequestAction(req.id, 'mark_matched')}
                                                            className="px-3.5 py-2 bg-brand text-white text-xs font-bold rounded-btn hover:bg-brand-deep transition disabled:opacity-50"
                                                        >
                                                            ✓ Mark Matched
                                                        </button>
                                                    )}

                                                    {req.status !== 'closed' && (
                                                        <button 
                                                            disabled={actionLoading === req.id}
                                                            onClick={() => handleRequestAction(req.id, 'close')}
                                                            className="px-3.5 py-2 bg-bg-alt text-text-muted text-xs font-bold border border-border rounded-btn hover:bg-border transition disabled:opacity-50"
                                                        >
                                                            Close Request
                                                        </button>
                                                    )}

                                                    {req.status === 'closed' && (
                                                        <button 
                                                            disabled={actionLoading === req.id}
                                                            onClick={() => handleRequestAction(req.id, 'reopen')}
                                                            className="px-3.5 py-2 bg-bg-alt text-text text-xs font-bold border border-border rounded-btn hover:bg-border transition disabled:opacity-50"
                                                        >
                                                            Reopen
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* SECTION 2: LANDLORD RENTALS */}
                {activeSection === 'rentals' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-wrap gap-2 mb-8 bg-surface p-1 rounded-btn border border-border">
                            {['pending', 'approved', 'rented', 'rejected', 'expired', 'all'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveRentalTab(tab)}
                                    className={`px-4 py-2 rounded-btn text-sm font-bold transition capitalize ${
                                        activeRentalTab === tab ? 'bg-brand text-white shadow-sm' : 'text-text-soft hover:bg-bg-alt'
                                    }`}
                                >
                                    {tab} ({rentals.filter(r => tab === 'all' ? true : r.status === tab).length})
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand" />
                            </div>
                        ) : filteredRentals.length === 0 ? (
                            <div className="card-premium p-20 text-center text-text-soft bg-white">
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
                                                    alt={rental.title}
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
                                                    <span className="font-semibold text-brand">JMD ${rental.price?.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                                                <a href={`/rent-near-cmu/${rental.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-bg-alt text-text text-xs font-bold rounded-btn hover:bg-border transition">Preview</a>
                                                
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
