import { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabase';

function isAdminEmail(email) {
    const adminList = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
    return adminList
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
        .includes((email || '').toLowerCase());
}

export default function AdminEventsPage() {
    const [session, setSession] = useState(null);
    const [events, setEvents] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [formState, setFormState] = useState({
        vendor_id: '',
        title: '',
        description: '',
        event_date: '',
        location: '',
        category: '',
        image_url: '',
        paid_tier: 'basic',
        status: 'pending',
        is_paid: false,
        expires_at: ''
    });
    const [expandedId, setExpandedId] = useState(null);
    const [pendingId, setPendingId] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session?.user) {
            fetchEvents();
            fetchVendors();
        }
    }, [session]);

    async function fetchEvents() {
        try {
            setLoading(true);
            const response = await fetch('/api/events/admin-list', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.error || 'Unable to load events.');
            }
            setEvents(payload.events || []);
        } catch (error) {
            console.error('Error fetching events:', error.message);
            setMessage(error.message || 'Unable to load events.');
        } finally {
            setLoading(false);
        }
    }

    async function fetchVendors() {
        try {
            const response = await fetch('/api/events/admin-vendors', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.error || 'Unable to load vendors.');
            }
            setVendors(payload.vendors || []);
            if ((payload.vendors || []).length > 0) {
                setFormState((prev) => ({ ...prev, vendor_id: prev.vendor_id || payload.vendors[0].id }));
            }
        } catch (error) {
            console.error('Error fetching vendors:', error.message);
        }
    }

    async function updateEvent(eventId, updates) {
        try {
            setMessage('Updating event...');
            setPendingId(eventId);
            const response = await fetch('/api/events/admin-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ eventId, ...updates })
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.error || 'Update failed.');
            }
            setEvents((prev) => prev.map((event) => (event.id === eventId ? payload.event : event)));
            setMessage('Update saved.');
        } catch (error) {
            console.error('Error updating event:', error.message);
            setMessage(error.message || 'Update failed.');
        } finally {
            setPendingId(null);
        }
    }

    async function createEvent(event) {
        event.preventDefault();
        setMessage('');
        try {
            const payload = {
                ...formState,
                event_date: new Date(formState.event_date).toISOString(),
                expires_at: formState.expires_at ? new Date(formState.expires_at).toISOString() : null
            };

            const response = await fetch('/api/events/admin-create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Create failed.');
            }
            setEvents((prev) => [data.event, ...prev]);
            setFormState((prev) => ({
                ...prev,
                title: '',
                description: '',
                event_date: '',
                location: '',
                category: '',
                image_url: '',
                paid_tier: 'basic',
                status: 'pending',
                is_paid: false,
                expires_at: ''
            }));
        } catch (error) {
            console.error('Error creating event:', error.message);
            setMessage(error.message || 'Create failed.');
        }
    }

    if (!session) {
        return null;
    }

    const formatDateTime = (value) => new Date(value).toLocaleString('en-JM', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: true
    });

    if (!isAdminEmail(session.user.email)) {
        return (
            <div className="min-h-screen bg-bg-primary">
                <Navbar />
                <main className="pt-28 pb-16">
                    <div className="max-w-3xl mx-auto px-6 text-center">
                        <h1 className="text-2xl font-black text-gray-900 mb-3">Admin Access Required</h1>
                        <p className="text-gray-600">Your account is not authorized to manage events.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Admin Events | Harbour View Directory</title>
            </Head>
            <Navbar />

            <main className="pt-28 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-gray-900">Event Approvals</h1>
                        <p className="text-gray-600">Approve listings, mark payments, and set expiration dates.</p>
                    </div>

                    {message && <p className="text-sm font-semibold text-red-600 mb-4">{message}</p>}

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Create Event</h2>
                        <form onSubmit={createEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor</label>
                                <select
                                    value={formState.vendor_id}
                                    onChange={(event) => setFormState({ ...formState, vendor_id: event.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    required
                                >
                                    {vendors.length === 0 && <option value="">No vendors found</option>}
                                    {vendors.map((vendor) => (
                                        <option key={vendor.id} value={vendor.id}>{vendor.business_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formState.title}
                                        onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Event Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={formState.event_date}
                                        onChange={(event) => setFormState({ ...formState, event_date: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={formState.description}
                                    onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formState.location}
                                        onChange={(event) => setFormState({ ...formState, location: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formState.category}
                                        onChange={(event) => setFormState({ ...formState, category: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        value={formState.image_url}
                                        onChange={(event) => setFormState({ ...formState, image_url: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Paid Tier</label>
                                    <select
                                        value={formState.paid_tier}
                                        onChange={(event) => setFormState({ ...formState, paid_tier: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    >
                                        <option value="basic">Basic</option>
                                        <option value="premium">Premium</option>
                                        <option value="featured">Featured</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formState.status}
                                        onChange={(event) => setFormState({ ...formState, status: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="active">Active</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        id="admin-paid-toggle"
                                        type="checkbox"
                                        checked={formState.is_paid}
                                        onChange={(event) => setFormState({ ...formState, is_paid: event.target.checked })}
                                        className="h-4 w-4"
                                    />
                                    <label htmlFor="admin-paid-toggle" className="text-sm font-semibold text-gray-700">Payment received</label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Expires At (optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={formState.expires_at}
                                        onChange={(event) => setFormState({ ...formState, expires_at: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="bg-brand-blue text-white text-sm font-bold px-4 py-2 rounded-lg"
                            >
                                Create Event
                            </button>
                        </form>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                        </div>
                    ) : events.length > 0 ? (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                            <p className="text-sm text-gray-500">{event.vendors?.business_name || 'Unknown vendor'}</p>
                                            <p className="text-xs text-gray-400">{formatDateTime(event.event_date)}</p>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>Status: <span className="font-semibold">{event.status}</span></div>
                                            <div>Tier: <span className="font-semibold">{event.paid_tier}</span></div>
                                            <div>Paid: <span className="font-semibold">{event.is_paid ? 'Yes' : 'No'}</span></div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => updateEvent(event.id, { status: 'active' })}
                                            className="bg-brand-blue text-white text-sm font-bold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-60"
                                            disabled={pendingId === event.id}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateEvent(event.id, { status: 'rejected' })}
                                            className="bg-gray-200 text-gray-700 text-sm font-bold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-60"
                                            disabled={pendingId === event.id}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateEvent(event.id, { is_paid: true })}
                                            className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-60"
                                            disabled={pendingId === event.id}
                                        >
                                            Mark Paid
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateEvent(event.id, { status: 'expired', expires_at: new Date().toISOString() })}
                                            className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-60"
                                            disabled={pendingId === event.id}
                                        >
                                            Expire
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                                            className="bg-gray-100 text-gray-700 text-sm font-bold px-4 py-2 rounded-lg cursor-pointer"
                                        >
                                            {expandedId === event.id ? 'Close Edit' : 'Edit'}
                                        </button>
                                    </div>

                                    {expandedId === event.id && (
                                        <div className="mt-6 border-t border-gray-100 pt-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={event.title}
                                                        onBlur={(e) => (event.title = e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Event Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        defaultValue={event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : ''}
                                                        onBlur={(e) => (event.event_date = e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    rows="3"
                                                    defaultValue={event.description || ''}
                                                    onBlur={(e) => (event.description = e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={event.location || ''}
                                                        onBlur={(e) => (event.location = e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={event.category || ''}
                                                        onBlur={(e) => (event.category = e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                                                    <input
                                                        type="url"
                                                        defaultValue={event.image_url || ''}
                                                        onBlur={(e) => (event.image_url = e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Paid Tier</label>
                                                    <select
                                                        defaultValue={event.paid_tier || 'basic'}
                                                        onBlur={(e) => (event.paid_tier = e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                    >
                                                        <option value="basic">Basic</option>
                                                        <option value="premium">Premium</option>
                                                        <option value="featured">Featured</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                                    <select
                                                        defaultValue={event.status || 'pending'}
                                                        onBlur={(e) => (event.status = e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="active">Active</option>
                                                        <option value="rejected">Rejected</option>
                                                        <option value="expired">Expired</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={event.is_paid}
                                                        onChange={(e) => (event.is_paid = e.target.checked)}
                                                        className="h-4 w-4"
                                                    />
                                                    <span className="text-sm font-semibold text-gray-700">Payment received</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Expires At (optional)</label>
                                                    <input
                                                        type="datetime-local"
                                                        defaultValue={event.expires_at ? new Date(event.expires_at).toISOString().slice(0, 16) : ''}
                                                        onBlur={(e) => (event.expires_at = e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => updateEvent(event.id, {
                                                    title: event.title,
                                                    description: event.description,
                                                    event_date: event.event_date ? new Date(event.event_date).toISOString() : null,
                                                    location: event.location,
                                                    category: event.category,
                                                    image_url: event.image_url,
                                                    paid_tier: event.paid_tier,
                                                    status: event.status,
                                                    is_paid: Boolean(event.is_paid),
                                                    expires_at: event.expires_at ? new Date(event.expires_at).toISOString() : null
                                                })}
                                                className="bg-brand-blue text-white text-sm font-bold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-60"
                                                disabled={pendingId === event.id}
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
                            <p className="text-gray-500">No events found.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
