import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { supabase } from '../lib/supabase';

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Events');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [events, selectedCategory, searchQuery]);

    async function fetchEvents() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('is_approved', true)
                .gte('start_date', new Date().toISOString())
                .order('start_date', { ascending: true })
                .limit(50);

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                setEvents(data);
            } else {
                // Show sample events for empty state
                setEvents(getSampleEvents());
            }
        } catch (error) {
            console.error('Error fetching events:', error.message);
            setEvents(getSampleEvents());
        } finally {
            setLoading(false);
        }
    }

    function getSampleEvents() {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

        return [
            {
                id: '1',
                title: 'Harbour View Community Market Day',
                description: 'Join us for our monthly community market featuring local vendors, food stalls, and live music. Support local businesses and enjoy family-friendly activities.',
                location: 'Harbour View Community Centre',
                start_date: nextWeek.toISOString(),
                end_date: new Date(nextWeek.getTime() + 6 * 60 * 60 * 1000).toISOString(),
                category: 'Community',
                organizer: 'Harbour View Residents Association',
                contact_info: '876-555-1000',
                images: ['/market.jpg'],
                is_featured: true
            },
            {
                id: '2',
                title: 'Small Business Workshop: Digital Marketing',
                description: 'Learn how to grow your local business online. Free workshop covering social media, Google Business, and local SEO strategies.',
                location: 'Harbour View Library',
                start_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
                category: 'Business',
                organizer: 'Kingston Chamber of Commerce',
                contact_info: 'info@kingstonchamber.jm',
                images: ['/workshop.jpg'],
                is_featured: true
            },
            {
                id: '3',
                title: 'Clean Harbour Beach Day',
                description: 'Volunteer beach cleanup followed by community picnic. Help keep our coastline beautiful! Gloves and bags provided.',
                location: 'Harbour View Beach',
                start_date: twoWeeks.toISOString(),
                end_date: new Date(twoWeeks.getTime() + 4 * 60 * 60 * 1000).toISOString(),
                category: 'Environment',
                organizer: 'Clean Jamaica Initiative',
                contact_info: 'clean@jamaica.org',
                images: ['/beach.jpg']
            },
            {
                id: '4',
                title: 'Friday Night Food Festival',
                description: 'Taste the best of Harbour View! Food trucks, local chefs, and culinary delights every Friday evening.',
                location: 'Harbour View Square',
                start_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                end_date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
                category: 'Food',
                organizer: 'Harbour View Food Association',
                contact_info: 'food@harbourview.jm',
                images: ['/foodfestival.jpg']
            }
        ];
    }

    function filterEvents() {
        let result = events;

        if (selectedCategory && selectedCategory !== 'All Events') {
            result = result.filter(e => e.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e =>
                (e.title && e.title.toLowerCase().includes(query)) ||
                (e.description && e.description.toLowerCase().includes(query)) ||
                (e.location && e.location.toLowerCase().includes(query))
            );
        }

        setFilteredEvents(result);
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-JM', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    const categories = ['All Events', 'Community', 'Business', 'Food', 'Environment', 'Entertainment'];

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Harbour View Events | Local Community Events in Harbour View Kingston Jamaica</title>
                <meta name="description" content="Discover upcoming community events, markets, workshops, and activities in Harbour View Kingston Jamaica. Stay connected with local happenings." />
                <meta name="keywords" content="Harbour View events, Kingston Jamaica events, community events, local activities, Harbour View calendar" />
                <meta property="og:title" content="Harbour View Events | Local Community Events" />
                <meta property="og:description" content="Discover upcoming community events in Harbour View Kingston Jamaica." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://harbourviewdirectory.online/events" />
                <link rel="canonical" href="https://harbourviewdirectory.online/events" />
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <div className="max-w-6xl mx-auto px-6 text-center py-12">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Harbour View Community Events
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Stay updated with local markets, workshops, cleanups, and community gatherings in Harbour View.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search events by name, location, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:border-brand-blue focus:ring-2 focus:ring-blue-200 outline-none transition"
                            />
                            <div className="absolute right-3 top-3 text-gray-400">
                                🔍
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="bg-white border-y border-gray-100 sticky top-16 z-40">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-5 py-2 rounded-full font-medium transition ${selectedCategory === category ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                        <p className="text-gray-500 text-sm font-medium">Showing {filteredEvents.length} events</p>
                    </div>

                    {loading ? (
                        <LoadingSkeleton type="event" count={3} />
                    ) : filteredEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${event.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {event.is_featured ? '⭐ Featured' : event.category}
                                                </span>
                                                <h3 className="text-xl font-bold text-gray-900 mt-2">{event.title}</h3>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                                        
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-gray-700">
                                                <span className="mr-2">📅</span>
                                                <span className="font-medium">{formatDate(event.start_date)}</span>
                                            </div>
                                            <div className="flex items-center text-gray-700">
                                                <span className="mr-2">📍</span>
                                                <span>{event.location}</span>
                                            </div>
                                            {event.organizer && (
                                                <div className="flex items-center text-gray-700">
                                                    <span className="mr-2">👤</span>
                                                    <span>Organized by {event.organizer}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            {event.contact_info && (
                                                <a 
                                                    href={event.contact_info.includes('@') ? `mailto:${event.contact_info}` : `tel:${event.contact_info}`}
                                                    className="text-brand-blue font-bold hover:underline"
                                                >
                                                    Contact Organizer
                                                </a>
                                            )}
                                            <button className="bg-brand-blue text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                                                Save Event
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-dashed border-green-200">
                            <div className="max-w-md mx-auto">
                                <div className="text-6xl mb-6">📅</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">No events found</h3>
                                <p className="text-gray-600 mb-6">
                                    {searchQuery || selectedCategory !== 'All Events' 
                                        ? `No events match "${searchQuery}" in ${selectedCategory}.`
                                        : 'Check back soon for upcoming community events!'}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All Events'); }}
                                        className="bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                                    >
                                        Show All Events
                                    </button>
                                    <a href="/post-ad" className="bg-white text-brand-blue border-2 border-brand-blue px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                                        Submit Your Event
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Call to Action */}
                    <div className="mt-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-center text-white">
                        <h3 className="text-2xl font-bold mb-4">Have an event to share?</h3>
                        <p className="mb-6 max-w-2xl mx-auto">
                            List your community event for free and reach thousands of Harbour View residents.
                        </p>
                        <a href="/post-ad?type=event" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition inline-block">
                            Submit Event
                        </a>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-gray-500">© {new Date().getFullYear()} Harbour View Events Directory</p>
                            <p className="text-gray-400 text-sm mt-1">Keeping our community connected</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="/" className="text-gray-500 hover:text-brand-blue transition">Home</a>
                            <a href="/events" className="text-gray-500 hover:text-brand-blue transition">Events</a>
                            <a href="/post-ad" className="text-gray-500 hover:text-brand-blue transition">Submit Event</a>
                            <a href="/contact" className="text-gray-500 hover:text-brand-blue transition">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}