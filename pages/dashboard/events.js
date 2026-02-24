import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabase';

const DEFAULT_WHATSAPP = 'https://wa.me/18768617153';

export default function VendorEventsPage() {
    const router = useRouter();
    const [session, setSession] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [formState, setFormState] = useState({
        vendor_id: '',
        title: '',
        description: '',
        event_date: '',
        location: '',
        category: '',
        image_url: '',
        paid_tier: 'basic'
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                router.push('/login');
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (session?.user) {
            fetchVendorData();
        }
    }, [session]);

    async function fetchVendorData() {
        try {
            setLoading(true);
            const { data: vendorData, error: vendorError } = await supabase
                .from('vendors')
                .select('id, business_name')
                .eq('user_id', session.user.id);

            if (vendorError) throw vendorError;
            setVendors(vendorData || []);

            if (vendorData && vendorData.length > 0) {
                setFormState((prev) => ({ ...prev, vendor_id: prev.vendor_id || vendorData[0].id }));
            }

            if (vendorData && vendorData.length > 0) {
                const { data: eventData, error: eventError } = await supabase
                    .from('events')
                    .select('*')
                    .in('vendor_id', vendorData.map((vendor) => vendor.id))
                    .order('event_date', { ascending: true });

                if (eventError) throw eventError;
                setEvents(eventData || []);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error('Error loading events:', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateEvent(event) {
        event.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            if (!formState.vendor_id) {
                throw new Error('Select a vendor listing first.');
            }

            const payload = {
                vendor_id: formState.vendor_id,
                title: formState.title,
                description: formState.description,
                event_date: new Date(formState.event_date).toISOString(),
                location: formState.location,
                category: formState.category,
                image_url: formState.image_url,
                paid_tier: formState.paid_tier,
                status: 'pending',
                is_paid: false
            };

            const { error } = await supabase.from('events').insert([payload]);
            if (error) throw error;

            setMessage('Event submitted! We will review it once payment is confirmed.');
            setFormState({
                vendor_id: formState.vendor_id,
                title: '',
                description: '',
                event_date: '',
                location: '',
                category: '',
                image_url: '',
                paid_tier: 'basic'
            });
            await fetchVendorData();
        } catch (error) {
            console.error('Error creating event:', error.message);
            setMessage(error.message || 'Unable to create event.');
        } finally {
            setSaving(false);
        }
    }

    if (!session) return null;

    const whatsappLink = process.env.NEXT_PUBLIC_PAYMENTS_WHATSAPP || DEFAULT_WHATSAPP;
    const formatDateTime = (value) => new Date(value).toLocaleString('en-JM', {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: true
    });

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Events Dashboard | Harbour View Directory</title>
            </Head>
            <Navbar />

            <main className="pt-28 pb-16">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Manage Events</h1>
                            <p className="text-gray-600">Create events and choose a paid tier for extra visibility.</p>
                        </div>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-green-600 transition"
                        >
                            Pay via WhatsApp
                        </a>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-10">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Create a New Event</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor Listing</label>
                                <select
                                    value={formState.vendor_id}
                                    onChange={(event) => setFormState({ ...formState, vendor_id: event.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                    required
                                >
                                    {vendors.length === 0 && <option value="">No listings yet</option>}
                                    {vendors.map((vendor) => (
                                        <option key={vendor.id} value={vendor.id}>{vendor.business_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title</label>
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
                                    required
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL (optional)</label>
                                    <input
                                        type="url"
                                        value={formState.image_url}
                                        onChange={(event) => setFormState({ ...formState, image_url: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Paid Tier</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { value: 'basic', label: 'Basic · JMD 2,000', desc: 'Listed in events section' },
                                        { value: 'premium', label: 'Premium · JMD 5,000', desc: 'Featured at top of events' },
                                        { value: 'featured', label: 'Featured · JMD 10,000', desc: 'Homepage hero + top of events' }
                                    ].map((tier) => (
                                        <label key={tier.value} className={`border rounded-xl p-4 cursor-pointer ${formState.paid_tier === tier.value ? 'border-brand-blue bg-blue-50' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="paid_tier"
                                                value={tier.value}
                                                checked={formState.paid_tier === tier.value}
                                                onChange={() => setFormState({ ...formState, paid_tier: tier.value })}
                                                className="mr-2"
                                            />
                                            <span className="font-semibold text-gray-900">{tier.label}</span>
                                            <p className="text-xs text-gray-500 mt-1">{tier.desc}</p>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {message && (
                                <p className="text-sm font-semibold text-brand-blue">{message}</p>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-brand-blue text-white font-bold px-6 py-3 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                            >
                                {saving ? 'Submitting...' : 'Submit Event'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Your Events</h2>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue"></div>
                            </div>
                        ) : events.length > 0 ? (
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <div key={event.id} className="border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{event.title}</h3>
                                            <p className="text-sm text-gray-500">{formatDateTime(event.event_date)}</p>
                                            <p className="text-xs text-gray-400">Status: {event.status} · Tier: {event.paid_tier}</p>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {event.is_paid ? 'Payment received' : 'Payment pending'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No events yet.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}


export async function getServerSideProps() {
    return {
        props: {}
    };
}
