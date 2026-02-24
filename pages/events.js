import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import { supabase } from '../lib/supabase';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [dateFilter, setDateFilter] = useState('all');

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*, vendors(business_name)')
                .eq('status', 'active')
                .order('event_date', { ascending: true });

            if (error) throw error;
            if (data) setEvents(data);
        } catch (error) {
            console.error('Error loading events:', error.message);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }

    const categories = useMemo(() => {
        const values = new Set(events.map((event) => event.category).filter(Boolean));
        return ['All', ...Array.from(values)];
    }, [events]);

    const filteredEvents = useMemo(() => {
        const now = new Date();
        const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return events.filter((event) => {
            const eventDate = new Date(event.event_date);
            if (selectedCategory !== 'All' && event.category !== selectedCategory) {
                return false;
            }
            if (dateFilter === 'next7' && eventDate > sevenDays) {
                return false;
            }
            if (dateFilter === 'next30' && eventDate > thirtyDays) {
                return false;
            }
            return eventDate >= now;
        });
    }, [events, selectedCategory, dateFilter]);

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Events | Harbour View Directory</title>
                <meta name="description" content="Upcoming events hosted by Harbour View vendors." />
            </Head>

            <Navbar />

            <main className="pt-28 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900">Upcoming Events</h1>
                        <p className="text-gray-600 mt-2">Discover what&apos;s happening across the Harbour View community.</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Category</p>
                            <select
                                value={selectedCategory}
                                onChange={(event) => setSelectedCategory(event.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-600 mb-1">Date Range</p>
                            <select
                                value={dateFilter}
                                onChange={(event) => setDateFilter(event.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                            >
                                <option value="all">All upcoming</option>
                                <option value="next7">Next 7 days</option>
                                <option value="next30">Next 30 days</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500">Showing {filteredEvents.length} events</div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} showVendor />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
                            <p className="text-gray-500">No upcoming events match your filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
