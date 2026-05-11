import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/VendorCard';
import { supabase } from '../lib/supabase';
import { getDisplayCategory, vendorMatchesSearch, CATEGORY_TAXONOMY, normalizeCategoryLabel } from '../lib/categoryMap';
import { createVendorImageResolver } from '../lib/categoryFallbackImages';
import { TRUST_FILTERS, vendorMatchesTrustState } from '../lib/trustState';
import {
    applyPublicVendorFilters,
    filterPublicVendors,
    PUBLIC_VENDOR_COLUMNS,
} from '../lib/publicDirectory';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
    { value: 'featured', label: '⭐ Featured First' },
    { value: 'recent', label: '🕐 Recently Added' },
    { value: 'az', label: '🔤 A–Z' },
];

const COMMON_SEARCHES = ['food', 'lunch', 'fry chicken', 'fried chicken', 'Chinese', 'patty', 'bakery', 'barber', 'taxi', 'mechanic', 'pharmacy', 'laundry', 'ATM', 'JP', 'plumber', 'electrician', 'carpenter', 'AC', 'phone repair', 'bills', 'money transfer', 'fishing', 'pet shop', 'books', 'stationery'];

export async function getServerSideProps({ query }) {
    const { q = '', category = '', sort = 'featured' } = query;

    try {
        let dbQuery = applyPublicVendorFilters(
            supabase
                .from('vendors')
                .select(PUBLIC_VENDOR_COLUMNS)
        );

        // Sort at DB level for performance
        if (sort === 'az') {
            dbQuery = dbQuery.order('business_name', { ascending: true });
        } else if (sort === 'recent') {
            dbQuery = dbQuery.order('created_at', { ascending: false });
        } else {
            // featured: top_ad first, then featured, then recent
            dbQuery = dbQuery
                .order('is_top_ad', { ascending: false })
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false });
        }

        const { data: vendors, error } = await dbQuery.limit(500);
        if (error) throw error;

        return {
            props: {
                initialVendors: filterPublicVendors(vendors || []),
                initialQ: q,
                initialCategory: normalizeCategoryLabel(category),
                initialSort: sort,
            },
        };
    } catch (err) {
        console.error('Directory SSR error:', err.message);
        return {
            props: { initialVendors: [], initialQ: q, initialCategory: category, initialSort: sort },
        };
    }
}

export default function DirectoryPage({ initialVendors, initialQ, initialCategory, initialSort }) {
    const [searchQuery, setSearchQuery] = useState(initialQ);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [sort, setSort] = useState(initialSort);
    const [trustFilter, setTrustFilter] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Client-side filter + search
    const filteredVendors = useMemo(() => {
        let list = [...initialVendors];

        // Category filter
        if (activeCategory) {
            list = list.filter(v => getDisplayCategory(v).display === activeCategory);
        }

        // Search filter
        if (searchQuery.trim()) {
            list = list.filter(v => vendorMatchesSearch(v, searchQuery.trim()));
        }

        if (trustFilter) {
            list = list.filter(v => vendorMatchesTrustState(v, trustFilter));
        }

        // Client-side sort (in case SSR sort differs after filter)
        if (sort === 'az') {
            list.sort((a, b) => (a.business_name || '').localeCompare(b.business_name || ''));
        } else if (sort === 'recent') {
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return list;
    }, [initialVendors, searchQuery, activeCategory, sort, trustFilter]);

    const visibleVendors = filteredVendors.slice(0, visibleCount);
    const visibleVendorImages = useMemo(() => {
        const resolveImage = createVendorImageResolver();
        return new Map(visibleVendors.map(vendor => [vendor.id, resolveImage(vendor)]));
    }, [visibleVendors]);
    const hasMore = visibleCount < filteredVendors.length;

    function clearFilters() {
        setSearchQuery('');
        setActiveCategory('');
        setSort('featured');
        setTrustFilter('');
        setVisibleCount(PAGE_SIZE);
    }

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Browse All Businesses | Harbour View Directory, Kingston Jamaica</title>
                <meta name="description" content="Browse the full directory of local businesses in Harbour View, Kingston Jamaica. Filter by category — food, beauty, home services, transport, tech, tutors and more." />
                <meta property="og:title" content="Harbour View Business Directory — Browse All Listings" />
                <meta property="og:url" content="https://harbourviewdirectory.online/directory" />
                <link rel="canonical" href="https://harbourviewdirectory.online/directory" />
            </Head>

            <Navbar />

            {/* ── Page Header ── */}
            <div
                className="pt-24 pb-12 px-6"
                style={{ background: 'linear-gradient(135deg, #0B2545 0%, #0369A1 100%)' }}
            >
                <div className="container-premium">
                    <div className="max-w-2xl">
                        <Link href="/" className="text-white/60 text-sm hover:text-white transition mb-3 inline-block">
                            ← Home
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                            Harbour View Business Directory
                        </h1>
                        <p className="text-white/70 text-lg">
                            {initialVendors.length} businesses in Harbour View
                        </p>
                        <p className="mt-1 text-white/55 text-sm font-semibold">
                            {initialVendors.length} local records · verified and community-submitted listings
                        </p>
                    </div>
                </div>
            </div>

            <main className="px-6 pb-20">
                {/* ── Sticky filter bar ── */}
                <div className="sticky top-16 z-30 bg-white border-b border-border shadow-sm">
                    <div className="container-premium py-3">
                        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-muted sm:hidden">
                            Search and filter
                        </p>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
                            {/* Search */}
                            <div className="min-w-0 lg:flex-1 lg:min-w-48">
                                <label className="sr-only" htmlFor="directory-search">Search businesses</label>
                                <input
                                    id="directory-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                                    placeholder="Search businesses…"
                                    className="w-full text-sm border border-border rounded-btn px-3 py-2 outline-none focus:border-brand bg-bg-alt text-text"
                                />
                            </div>

                            {/* Category dropdown */}
                            <select
                                value={activeCategory}
                                    onChange={e => { setActiveCategory(e.target.value); setVisibleCount(PAGE_SIZE); }}
                                    className="min-w-0 text-sm border border-border rounded-btn px-3 py-2 outline-none focus:border-brand bg-bg-alt text-text"
                                >
                                    <option value="">All Categories</option>
                                    {CATEGORY_TAXONOMY.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            {/* Sort */}
                            <select
                                value={sort}
                                onChange={e => { setSort(e.target.value); setVisibleCount(PAGE_SIZE); }}
                                className="min-w-0 text-sm border border-border rounded-btn px-3 py-2 outline-none focus:border-brand bg-bg-alt text-text"
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>

                            <select
                                value={trustFilter}
                                onChange={e => { setTrustFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}
                                className="min-w-0 text-sm border border-border rounded-btn px-3 py-2 outline-none focus:border-brand bg-bg-alt text-text"
                                aria-label="Filter by trust status"
                            >
                                {TRUST_FILTERS.map(filter => (
                                    <option key={filter.value} value={filter.value}>{filter.label}</option>
                                ))}
                            </select>

                            {/* Clear */}
                            {(searchQuery || activeCategory || sort !== 'featured' || trustFilter) && (
                                <button
                                    onClick={clearFilters}
                                    className="rounded-btn px-3 py-2 text-sm text-text-muted hover:text-red-600 font-medium transition whitespace-nowrap sm:text-left"
                                >
                                    ✕ Clear
                                </button>
                            )}
                        </div>

                        {/* Active category chips row */}
                        {(activeCategory || trustFilter) && (
                            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-border">
                                <span className="text-xs text-text-muted">Filtered:</span>
                                {activeCategory && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-soft text-brand px-3 py-1 rounded-full">
                                        {activeCategory}
                                        <button onClick={() => setActiveCategory('')} className="ml-1 hover:opacity-70">✕</button>
                                    </span>
                                )}
                                {trustFilter && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                                        {TRUST_FILTERS.find(filter => filter.value === trustFilter)?.label || trustFilter}
                                        <button onClick={() => setTrustFilter('')} className="ml-1 hover:opacity-70">✕</button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="container-premium pt-8">
                    {/* Results count */}
                    <div className="mb-6 flex max-h-24 flex-wrap gap-2 overflow-hidden sm:max-h-none">
                        {COMMON_SEARCHES.map(term => (
                            <button
                                key={term}
                                onClick={() => { setSearchQuery(term); setVisibleCount(PAGE_SIZE); }}
                                className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-brand hover:ring-brand/30"
                            >
                                {term}
                            </button>
                        ))}
                    </div>

                    {(searchQuery || activeCategory || trustFilter) && (
                        <p className="text-sm text-text-muted mb-6">
                            {filteredVendors.length === 0
                                ? 'No results found'
                                : `${filteredVendors.length} result${filteredVendors.length !== 1 ? 's' : ''}${activeCategory ? ` in ${activeCategory}` : ''}${searchQuery ? ` for "${searchQuery}"` : ''}${trustFilter ? ` · ${TRUST_FILTERS.find(filter => filter.value === trustFilter)?.label || trustFilter}` : ''}`
                            }
                        </p>
                    )}

                    {/* ── Grid ── */}
                    {visibleVendors.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {visibleVendors.map(vendor => (
                                    <ListingCard key={vendor.id} vendor={vendor} resolvedImage={visibleVendorImages.get(vendor.id)} />
                                ))}
                            </div>

                            {/* Load more */}
                            {hasMore && (
                                <div className="text-center mt-10">
                                    <button
                                        onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                                        className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-btn border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all"
                                    >
                                        Load {Math.min(PAGE_SIZE, filteredVendors.length - visibleCount)} More Businesses
                                    </button>
                                    <p className="text-xs text-text-muted mt-3">
                                        Showing {visibleCount} of {filteredVendors.length}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Zero result state */
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h2 className="text-2xl font-extrabold text-text mb-2">No matching local records</h2>
                            <p className="text-text-soft mb-8 max-w-md mx-auto">
                                {searchQuery
                                    ? `No results for "${searchQuery}"${activeCategory ? ` in ${activeCategory}` : ''}. Try food, taxi, pharmacy, barber, laundry, mechanic, ATM, JP, or phone repair.`
                                    : `No records match this filter yet. Try a different category or trust state.`
                                }
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
                                <Link href="/post-ad" className="btn-secondary">List Your Business</Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
