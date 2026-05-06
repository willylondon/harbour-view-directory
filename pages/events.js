import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmptyState from '../components/EmptyState';
import { supabase } from '../lib/supabase';

const EVENT_CATEGORIES = ['All Events', 'Community', 'Business', 'Food', 'Environment', 'Entertainment', 'Sports', 'Education'];

function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString('en-JM', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [displayEvents, setDisplayEvents] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All Events');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchEvents(); }, []);
    useEffect(() => { filterEvents(); }, [events, activeCategory, search]);

    async function fetchEvents() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('is_approved', true)
                .gte('start_date', new Date().toISOString())
                .order('start_date', { ascending: true })
                .limit(30);
            if (error) throw error;
            setEvents(data || []);
        } catch (err) {
            console.error(err);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }

    function filterEvents() {
        let filtered = [...events];
        if (activeCategory !== 'All Events') filtered = filtered.filter(e => e.category === activeCategory);
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(e =>
                e.title?.toLowerCase().includes(q) ||
                e.location?.toLowerCase().includes(q) ||
                e.description?.toLowerCase().includes(q)
            );
        }
        setDisplayEvents(filtered);
    }

    const featuredEvent = events.find(e => e.is_featured) || displayEvents[0];
    const hasNoEvents = events.length === 0 && !loading;

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Community Events | Harbour View Directory</title>
                <meta name="description" content="Upcoming community events, markets, workshops, and activities in Harbour View, Kingston Jamaica." />
                <link rel="canonical" href="https://harbourviewdirectory.online/events" />
            </Head>
            <Navbar />
            <main>
                <section className="bg-gradient-to-br from-brand-deep to-brand pt-28 pb-16 px-6 text-center text-white">
                    <div className="container-premium max-w-2xl">
                        <span className="inline-block bg-white/15 backdrop-blur-sm text-sm font-medium px-4 py-1.5 rounded-full mb-5">📅 Upcoming &amp; Past Events</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Harbour View<br />Community Events</h1>
                        <p className="text-lg text-white/80 mb-8">Markets, workshops, cleanups, food festivals — stay connected with what's happening.</p>
                        <a href="/post-ad" className="bg-white text-brand-deep font-bold px-8 py-3.5 rounded-btn hover:bg-gray-50 transition inline-block">Promote Your Event</a>
                    </div>
                </section>

                <div className="bg-surface border-b border-border sticky top-[72px] z-30 px-6">
                    <div className="container-premium py-3 flex flex-wrap gap-2 items-center">
                        {EVENT_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-sm font-medium px-4 py-1.5 rounded-full transition ${
                                    activeCategory === cat ? 'bg-brand text-white' : 'bg-bg-alt text-text-soft hover:bg-brand-soft hover:text-brand'
                                }`}
                            >{cat}</button>
                        ))}
                        <input
                            type="text" placeholder="🔍 Search events..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="ml-auto text-sm border border-border rounded-btn px-4 py-1.5 text-text-soft outline-none focus:border-brand transition w-48"
                        />
                    </div>
                </div>

                <section className="section-spacing px-6">
                    <div className="container-premium">
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1,2,3].map(i => <div key={i} className="card-premium h-64 animate-pulse" />)}
                            </div>
                        )}

                        {hasNoEvents && (
                            <EmptyState icon="📅" title="No upcoming events" description="Community events will appear here once scheduled. Organizing something? Promote it here." ctaText="Promote an Event" ctaHref="/post-ad" />
                        )}

                        {featuredEvent && !loading && (
                            <div className="card-premium p-6 md:p-8 mb-8 bg-gradient-to-r from-brand-soft/30 to-surface">
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="text-6xl shrink-0">🎪</div>
                                    <div className="flex-1">
                                        <span className="bg-brand-warm text-white text-xs font-bold px-3 py-1 rounded-full">⭐ Featured Event</span>
                                        <h2 className="text-2xl font-extrabold text-text mt-3 mb-2">{featuredEvent.title}</h2>
                                        <p className="text-text-soft mb-4">{featuredEvent.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                                            <span>📅 {formatDate(featuredEvent.start_date)}</span>
                                            <span>📍 {featuredEvent.location}</span>
                                            {featuredEvent.organizer && <span>👤 {featuredEvent.organizer}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {displayEvents.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayEvents.filter(e => e.id !== featuredEvent?.id).map(event => (
                                    <article key={event.id} className="card-premium p-6">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bg-alt text-text-soft">{event.category}</span>
                                        <h3 className="text-lg font-bold text-text mt-3 mb-2">{event.title}</h3>
                                        <p className="text-sm text-text-soft mb-4 line-clamp-2">{event.description}</p>
                                        <div className="text-xs text-text-muted space-y-1.5">
                                            <div>📅 {formatDate(event.start_date)}</div>
                                            <div>📍 {event.location}</div>
                                            {event.organizer && <div>👤 {event.organizer}</div>}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {!loading && !hasNoEvents && displayEvents.length === 0 && (
                            <EmptyState icon="🔍" title="No matching events" description={`No events in "${activeCategory}"${search ? ` matching "${search}"` : ''}.`} ctaText="Show All" ctaHref="#" secondaryCtaText="" secondaryCtaHref="" />
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
