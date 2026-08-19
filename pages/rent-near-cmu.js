import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmptyState from '../components/EmptyState';
import RentalCard from '../components/RentalCard';
import { supabase } from '../lib/supabase';
import {
    applyPublicRentalFilters,
    filterPublicRentals,
    PUBLIC_RENTAL_COLUMNS,
} from '../lib/publicDirectory';

const RENTAL_TYPES = ['All', 'Room', 'Studio', 'Apartment', 'Shared', 'House'];
const DISTANCE_OPTIONS = [
    { label: 'Any Distance', value: '5' },
    { label: 'Short Walk (< 5 min)', value: '1' },
    { label: 'Walking Distance (< 15 min)', value: '2' },
    { label: 'Short Commute', value: '3' }
];

export async function getServerSideProps(context) {
    const { query } = context;
    const { type, distance, maxPrice, furnished, utilities, available } = query;

    try {
        let supabaseQuery = applyPublicRentalFilters(
            supabase
                .from('rentals')
                .select(PUBLIC_RENTAL_COLUMNS)
        );

        if (type && type !== 'All') supabaseQuery = supabaseQuery.eq('type', type);
        if (maxPrice) supabaseQuery = supabaseQuery.lte('price', parseInt(maxPrice));
        if (furnished === 'true') supabaseQuery = supabaseQuery.eq('furnished', true);
        if (utilities === 'true') supabaseQuery = supabaseQuery.eq('utilities_included', true);
        if (available === 'true') {
            const today = new Date().toISOString().split('T')[0];
            supabaseQuery = supabaseQuery.lte('available_date', today);
        }
        if (distance) {
            supabaseQuery = supabaseQuery.lte('distance_sort', parseInt(distance));
        }

        const { data: rentals, error } = await supabaseQuery
            .order('distance_sort', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return { props: { rentals: filterPublicRentals(rentals || []), query } };
    } catch (err) {
        console.error('Rentals SSR error:', err.message);
        return { props: { rentals: [], query: {} } };
    }
}

export default function RentalsListingPage({ rentals, query }) {
    const router = useRouter();
    const [filters, setFilters] = useState({
        type: query.type || 'All',
        distance: query.distance || '5',
        maxPrice: query.maxPrice || '',
        furnished: query.furnished === 'true',
        utilities: query.utilities === 'true',
        available: query.available === 'true'
    });

    const handleFilterChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== 'All' && v !== '5') params.set(k, v);
        });
        router.push(`/rent-near-cmu?${params.toString()}`, undefined, { shallow: false });
    };

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Rooms &amp; Rentals Near CMU | Harbour View Directory</title>
                <meta name="description" content="Find rooms, studios, apartments, and houses in Harbour View and nearby areas for CMU students, port workers, dry dock workers, construction workers, and East Kingston relocations." />
                <link rel="canonical" href="https://harbourviewdirectory.online/rent-near-cmu" />
            </Head>
            <Navbar />
            
            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-brand-deep to-brand pt-28 pb-16 px-6 text-center text-white">
                    <div className="container-premium max-w-2xl">
                        <span className="inline-block bg-white/15 backdrop-blur-sm text-sm font-medium px-4 py-1.5 rounded-full mb-5">🏠 Rooms &amp; Rentals</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Rooms &amp; Rentals Near CMU</h1>
                        <p className="text-lg text-white/80 mb-8">Find rooms, studios, apartments, and houses in Harbour View and nearby areas for CMU students, port workers, dry dock workers, construction workers, and people relocating to East Kingston.</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a href="/rent-near-cmu/request" className="bg-white text-brand-deep font-bold px-6 py-3.5 rounded-btn hover:bg-gray-50 transition inline-block shadow-lg">🔔 Request a Room</a>
                            <a href="/rent-near-cmu/submit?type=Room" className="bg-white/15 border border-white/30 text-white font-bold px-6 py-3.5 rounded-btn hover:bg-white/20 transition inline-block">List a Room</a>
                            <a href="/rent-near-cmu/submit?type=House" className="bg-white/10 border border-white/20 text-white font-bold px-6 py-3.5 rounded-btn hover:bg-white/15 transition inline-block">List a House</a>
                            <a href="https://wa.me/18767978034?text=Hi%2C%20I%20need%20help%20with%20a%20Harbour%20View%20room%20or%20rental." target="_blank" rel="noopener noreferrer" className="bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-btn hover:bg-emerald-600 transition inline-block">WhatsApp Us</a>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/80 bg-white/10 max-w-md mx-auto py-2 px-4 rounded-full border border-white/10">
                            <span>⚡</span>
                            <span><strong>Are you a landlord?</strong> Renters are currently waiting for rooms in Harbour View.</span>
                        </div>
                    </div>
                </section>

                {/* Filter Bar */}
                <div className="bg-surface border-b border-border sticky top-[72px] z-30 px-6 shadow-sm">
                    <div className="container-premium py-4">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase px-1">Type</label>
                                <select 
                                    value={filters.type} 
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="text-sm border border-border rounded-btn px-3 py-2 text-text outline-none focus:border-brand bg-bg-alt"
                                >
                                    {RENTAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase px-1">Max Price</label>
                                <input 
                                    type="number" 
                                    placeholder="Any price"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    className="text-sm border border-border rounded-btn px-3 py-2 text-text outline-none focus:border-brand bg-bg-alt w-32"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-text-muted uppercase px-1">Distance</label>
                                <select 
                                    value={filters.distance} 
                                    onChange={(e) => handleFilterChange('distance', e.target.value)}
                                    className="text-sm border border-border rounded-btn px-3 py-2 text-text outline-none focus:border-brand bg-bg-alt"
                                >
                                    {DISTANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4 sm:pt-0 sm:ml-auto">
                                <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                                    <input type="checkbox" checked={filters.furnished} onChange={(e) => handleFilterChange('furnished', e.target.checked)} className="accent-brand" />
                                    Furnished
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                                    <input type="checkbox" checked={filters.utilities} onChange={(e) => handleFilterChange('utilities', e.target.checked)} className="accent-brand" />
                                    Utilities Incl.
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                                    <input type="checkbox" checked={filters.available} onChange={(e) => handleFilterChange('available', e.target.checked)} className="accent-brand" />
                                    Available Now
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                <section className="section-spacing px-6 min-h-[400px]">
                    <div className="container-premium">
                        {rentals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {rentals.map(rental => (
                                    <RentalCard key={rental.id} rental={rental} />
                                ))}
                            </div>
                        ) : (
                            <div className="card-premium p-10 bg-white border border-border text-center max-w-xl mx-auto shadow-sm">
                                <div className="text-5xl mb-4">🏠</div>
                                <h3 className="text-2xl font-black text-text mb-2">Looking for a Room or Rental?</h3>
                                <p className="text-text-soft mb-6 leading-relaxed text-sm">
                                    Landlords in Harbour View are actively updating vacancies. If you don't see what you need yet, submit your budget and move-in date to be notified immediately.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                                    <a className="inline-flex items-center justify-center bg-brand text-white font-extrabold px-6 py-3.5 rounded-btn hover:bg-brand-deep transition shadow-md" href="/rent-near-cmu/request">
                                        🔔 Tell Us What Room You Need
                                    </a>
                                    <a className="inline-flex items-center justify-center border-2 border-brand text-brand font-bold px-6 py-3.5 rounded-btn hover:bg-brand-soft transition" href="/rent-near-cmu/submit?type=Room">
                                        + Landlord? List a Space
                                    </a>
                                </div>

                                <p className="text-xs text-text-muted">
                                    Are you a CMU student or worker? We match requests with verified local rooms in Harbour View.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-6 pb-20">
                    <div className="container-premium">
                        <div className="rounded-3xl border border-border bg-bg-alt p-6 md:p-8">
                            <p className="text-sm font-semibold uppercase tracking-wide text-brand mb-2">Privacy First</p>
                            <p className="text-text-soft max-w-3xl">
                                Exact home addresses stay private by default. We show the approximate area publicly and keep detailed location notes admin-only unless the landlord explicitly opts in.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
}
