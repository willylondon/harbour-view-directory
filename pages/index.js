import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/VendorCard';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import { supabase } from '../lib/supabase';

const POPULAR_SEARCHES = ['Food & Dining', 'Professional Services', 'Beauty & Wellness', 'Automotive', 'Home Services', 'Retail Shops'];

export async function getServerSideProps() {
    try {
        const { data: vendors, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('is_approved', true)
            .order('is_top_ad', { ascending: false })
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) throw error;
        return { props: { initialVendors: vendors || [] } };
    } catch (err) {
        console.error('SSR fetch error:', err.message);
        return { props: { initialVendors: [] } };
    }
}

export default function Home({ initialVendors }) {
    const [vendors, setVendors] = useState(initialVendors);
    const [displayVendors, setDisplayVendors] = useState(initialVendors);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => { filterVendors(); }, [vendors, searchQuery, activeCategory]);

    function filterVendors() {
        let filtered = [...vendors];
        if (activeCategory) filtered = filtered.filter(v => v.category === activeCategory);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(v =>
                v.business_name?.toLowerCase().includes(q) ||
                v.category?.toLowerCase().includes(q) ||
                v.description?.toLowerCase().includes(q)
            );
        }
        setDisplayVendors(filtered);
    }

    const featuredVendors = vendors.filter(v => v.is_featured || v.is_top_ad).slice(0, 3);
    const hasNoVendors = vendors.length === 0;
    const hasNoResults = vendors.length > 0 && displayVendors.length === 0;

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Harbour View Directory — Trusted Local Directory | Kingston, Jamaica</title>
                <meta name="description" content="Discover local businesses, services, food, shops, and events in Harbour View, Kingston Jamaica. Browse the trusted community directory." />
                <meta property="og:title" content="Harbour View Directory — Trusted Local Directory" />
                <meta property="og:description" content="Harbour View's trusted community marketplace. Find local businesses, food, services, and events." />
                <meta property="og:url" content="https://harbourviewdirectory.online" />
                <link rel="canonical" href="https://harbourviewdirectory.online" />
            </Head>

            <Navbar />

            <main>
                {/* ── Hero ── */}
                <section className="relative bg-gradient-to-br from-brand-deep via-brand to-brand-soft pt-28 pb-20 px-6 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                    <div className="container-premium relative z-10">
                        <div className="max-w-3xl mx-auto text-center mb-10">
                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                                🏘️ Harbour View, Kingston Jamaica
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5 leading-tight">
                                Harbour View's<br />
                                <span className="text-brand-warm">trusted local directory</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                                Discover the best businesses, services, food, shops &amp; events in our community.
                                From patty shops to auto repairs — find it all here.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3 mt-8">
                                <a href="#directory" className="bg-white text-brand-deep font-bold px-8 py-3.5 rounded-btn shadow-elevated hover:bg-gray-50 transition">
                                    Browse Directory
                                </a>
                                <a href="/post-ad" className="bg-brand-warm text-white font-bold px-8 py-3.5 rounded-btn shadow-elevated hover:bg-amber-500 transition">
                                    List Your Business
                                </a>
                            </div>
                        </div>

                        {/* Floating Search Card */}
                        <div className="max-w-2xl mx-auto card-premium p-5 shadow-elevated -mb-32 relative z-20">
                            <SearchBar value={searchQuery} onChange={setSearchQuery} />
                            <div className="flex flex-wrap gap-2 mt-4">
                                <span className="text-xs text-text-muted mr-1 pt-1">Popular:</span>
                                {POPULAR_SEARCHES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => { setActiveCategory(activeCategory === cat ? '' : cat); setSearchQuery(''); }}
                                        className={`text-xs font-medium px-3 py-1 rounded-full transition ${
                                            activeCategory === cat
                                                ? 'bg-brand text-white'
                                                : 'bg-bg-alt text-text-soft hover:bg-brand-soft hover:text-brand'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Directory Section ── */}
                <section id="directory" className="section-spacing pt-44 pb-16 px-6">
                    <div className="container-premium">
                        <div className="mb-10">
                            <h2 className="text-3xl font-extrabold text-text mb-2">
                                {activeCategory ? `${activeCategory} in Harbour View` : 'Explore Local Businesses'}
                            </h2>
                            <p className="text-text-soft">
                                {activeCategory
                                    ? `Showing ${activeCategory.toLowerCase()} businesses in Harbour View.`
                                    : 'Discover trusted businesses serving the Harbour View community.'}
                            </p>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="card-premium overflow-hidden animate-pulse">
                                        <div className="h-48 bg-bg-alt" />
                                        <div className="p-5 space-y-3">
                                            <div className="h-4 bg-bg-alt rounded w-1/3" />
                                            <div className="h-5 bg-bg-alt rounded w-3/4" />
                                            <div className="h-3 bg-bg-alt rounded w-full" />
                                            <div className="h-3 bg-bg-alt rounded w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty database */}
                        {hasNoVendors && (
                            <EmptyState
                                icon="🏪"
                                title="No businesses listed yet"
                                description="Be the first! Harbour View Directory is new, and we're looking for our first local businesses to feature."
                                ctaText="List Your Business — It's Free"
                                ctaHref="/post-ad"
                            />
                        )}

                        {/* No search results */}
                        {hasNoResults && (
                            <EmptyState
                                icon="🔍"
                                title="No results found"
                                description={`No businesses match "${searchQuery || activeCategory}". Try a different search or category.`}
                                ctaText="Clear Filters"
                                ctaHref="#"
                                secondaryCtaText="Browse All"
                                secondaryCtaHref="#directory"
                                onCtaClick={(e) => { e.preventDefault(); setSearchQuery(''); setActiveCategory(''); }}
                            />
                        )}

                        {/* Vendor Grid */}
                        {displayVendors.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayVendors.map(vendor => (
                                    <ListingCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Featured Section ── */}
                {featuredVendors.length > 0 && (
                    <section className="section-spacing-sm bg-surface border-y border-border px-6">
                        <div className="container-premium">
                            <div className="text-center mb-10">
                                <span className="text-brand-warm text-sm font-bold tracking-wide uppercase">Featured</span>
                                <h2 className="text-3xl font-extrabold text-text mt-1">Top Businesses This Week</h2>
                                <p className="text-text-soft mt-2">Premium and featured listings from the Harbour View community.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {featuredVendors.map(vendor => (
                                    <ListingCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Community CTA ── */}
                <section className="section-spacing bg-gradient-to-br from-brand-deep to-brand text-white px-6 text-center">
                    <div className="container-premium max-w-2xl">
                        <h2 className="text-3xl font-extrabold mb-4">Part of the Harbour View community?</h2>
                        <p className="text-lg text-white/80 mb-8 leading-relaxed">
                            List your business, promote an event, or let neighbours know what you offer. It starts free.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a href="/post-ad" className="bg-white text-brand-deep font-bold px-8 py-3.5 rounded-btn shadow-elevated hover:bg-gray-50 transition">
                                List Your Business
                            </a>
                            <a href="/pricing" className="bg-transparent border-2 border-white/30 text-white font-bold px-8 py-3.5 rounded-btn hover:bg-white/10 transition">
                                View Pricing
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
