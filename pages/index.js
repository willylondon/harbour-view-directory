import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import VendorCard from '../components/VendorCard';
import EventCard from '../components/EventCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import { supabase } from '../lib/supabase';

export default function Home() {
    const [vendors, setVendors] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [premiumIndex, setPremiumIndex] = useState(0);
    const heroImageUrl = process.env.NEXT_PUBLIC_HERO_IMAGE_URL || '/hero.png';

    const normalizeQuery = (value) => (value || '').toLowerCase().trim().replace(/\s+/g, ' ');

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        filterVendors();
    }, [vendors, selectedCategory, searchQuery]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const featuredEvent = events.find((event) => event.paid_tier === 'featured' && event.is_paid);
    const premiumEvents = events.filter((event) => event.paid_tier === 'premium' && event.is_paid);

    useEffect(() => {
        if (premiumEvents.length <= 1) return;
        const interval = setInterval(() => {
            setPremiumIndex((prev) => (prev + 1) % premiumEvents.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [premiumEvents.length]);

    async function fetchVendors() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .order('is_top_ad', { ascending: false })
                .order('is_featured', { ascending: false });

            if (error) {
                throw error;
            }

            if (data) {
                setVendors(data);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error.message);
            // Fallback dummy data for preview purposes
            if (vendors.length === 0) {
                setVendors([
                    {
                        id: '1',
                        business_name: 'Willy London Graphics',
                        category: 'Professional Services',
                        description: 'Local graphic design and printing services.',
                        is_top_ad: true,
                        rating: 4.8,
                        reviewCount: 12
                    },
                    {
                        id: '2',
                        business_name: 'Harbour View Patty Shop',
                        category: 'Food & Dining',
                        description: 'The best patties in Kingston East.',
                        is_featured: true,
                        rating: 4.9,
                        reviewCount: 85
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
    }

    async function fetchEvents() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('status', 'active')
                .order('event_date', { ascending: true });

            if (error) throw error;

            const now = new Date();
            const upcoming = (data || []).filter((event) => new Date(event.event_date) >= now);
            setEvents(upcoming);
        } catch (error) {
            console.error('Error fetching events:', error.message);
            setEvents([]);
        }
    }

    function filterVendors() {
        let result = vendors;

        if (selectedCategory && selectedCategory !== 'All Categories') {
            result = result.filter(v => v.category === selectedCategory);
        }

        const query = normalizeQuery(searchQuery);
        if (query) {
            result = result.filter(v =>
                (v.business_name && normalizeQuery(v.business_name).includes(query)) ||
                (v.description && normalizeQuery(v.description).includes(query)) ||
                (v.category && normalizeQuery(v.category).includes(query))
            );
        }

        setFilteredVendors(result);
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Harbour View Digital Directory</title>
                <meta name="description" content="Community vendor directory for Harbour View" />
            </Head>

            <Navbar />

            <main className="pt-28 md:pt-24 pb-16">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-6 py-10">
                    <div
                        className="hero-shell p-8 md:p-12 lg:p-16"
                        style={{ '--hero-image': heroImageUrl ? `url(${heroImageUrl})` : 'none' }}
                    >
                        <div className="hero-overlay"></div>
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
                            <div className="text-white fade-up">
                                <p className="uppercase tracking-[0.3em] text-xs font-semibold text-brand-yellow mb-3">
                                    Harbour View Directory
                                </p>
                                <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                                    Find trusted local businesses and events in one place.
                                </h1>
                                <p className="text-base md:text-lg text-blue-100/90 max-w-xl">
                                    Browse community‑owned vendors, discover pop‑ups, and stay updated on what&apos;s happening around Harbour View.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                                    {['Food & Dining', 'Services', 'Wellness', 'Retail', 'Entertainment'].map((tag) => (
                                        <span key={tag} className="bg-white/15 px-4 py-2 rounded-full border border-white/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="hero-card rounded-2xl p-6 md:p-8 fade-up-delayed">
                                <h2 className="text-xl font-bold text-white mb-2">Search vendors</h2>
                                <p className="text-sm text-blue-100/80 mb-4">
                                    Filter by category, services, or keywords to find exactly what you need.
                                </p>
                                <SearchBar
                                    onSearch={(value) => {
                                        setSearchQuery(value);
                                        if (value && selectedCategory !== 'All Categories') {
                                            setSelectedCategory('All Categories');
                                        }
                                    }}
                                />
                                <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-blue-100/80">
                                    <div>
                                        <p className="font-semibold text-brand-yellow text-sm">20+</p>
                                        <p>Local categories</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-brand-yellow text-sm">Verified</p>
                                        <p>Community listings</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events Preview */}
                {events.length > 0 && (
                    <div className="max-w-7xl mx-auto px-6 pb-12">
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                                    <p className="text-sm text-gray-600">Featured and premium events from local vendors.</p>
                                </div>
                                <Link href="/events" className="text-brand-blue font-semibold hover:underline">View all events</Link>
                            </div>

                            {featuredEvent && (
                                <div className="bg-brand-blue text-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-brand-yellow font-semibold">Featured Event</p>
                                        <h3 className="text-2xl font-black mt-2">
                                            {featuredEvent.title}
                                        </h3>
                                        <p className="text-sm text-blue-100 mt-1">
                                            {new Date(featuredEvent.event_date).toLocaleString('en-JM', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short',
                                                hour12: true
                                            })}
                                        </p>
                                    </div>
                                    <Link href="/events" className="bg-brand-yellow text-gray-900 font-bold px-4 py-2 rounded-lg shadow-sm">
                                        Explore
                                    </Link>
                                </div>
                            )}

                            {premiumEvents.length > 0 && (
                                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-2">Premium Spotlight</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {premiumEvents[premiumIndex]?.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(premiumEvents[premiumIndex]?.event_date).toLocaleString('en-JM', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                            hour12: true
                                        })}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.slice(0, 3).map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="border-y border-gray-100 bg-white sticky top-16 z-40">
                    <CategoryFilter
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </div>

                {/* Vendor Grid */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedCategory}</h2>
                        <p className="text-gray-500 text-sm font-medium">Showing {filteredVendors.length} results</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                        </div>
                    ) : filteredVendors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredVendors.map((vendor) => (
                                <VendorCard key={vendor.id} vendor={vendor} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">No vendors found matching your criteria.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); }}
                                className="mt-4 text-brand-blue font-bold hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 text-center text-gray-500">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col gap-1 text-left md:text-left">
                        <p>© {new Date().getFullYear()} Harbour View Digital Directory. Built for our community.</p>
                        <p className="text-xs text-brand-blue/60 font-medium tracking-wide">done by willy london</p>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-brand-blue transition">Terms</a>
                        <a href="#" className="hover:text-brand-blue transition">Privacy</a>
                        <a href="#" className="hover:text-brand-blue transition">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
