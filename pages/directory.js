import { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/VendorCard';
import { supabase } from '../lib/supabase';
import { getDisplayCategory, expandSearchQuery, CATEGORY_TAXONOMY } from '../lib/categoryMap';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
    { value: 'featured', label: '⭐ Featured First' },
    { value: 'recent', label: '🕐 Recently Added' },
    { value: 'az', label: '🔤 A–Z' },
];

export async function getServerSideProps({ query }) {
    const { q = '', category = '', sort = 'featured' } = query;

    try {
        let dbQuery = supabase
            .from('vendors')
            .select('id, business_name, category, description, slug, address, whatsapp, images, is_featured, is_top_ad, created_at')
            .eq('is_approved', true)
            .eq('public_visibility', true)
            .in('locality_status', ['harbour_view_verified', 'harbour_view_likely']);

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

        const { data: vendors, error } = await dbQuery.limit(200);
        if (error) throw error;

        return {
            props: {
                initialVendors: vendors || [],
                initialQ: q,
                initialCategory: category,
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
            const terms = expandSearchQuery(searchQuery.trim());
            list = list.filter(v => {
                const haystack = [
                    v.business_name || '',
                    v.category || '',
                    v.description || '',
                    getDisplayCategory(v).display,
                ].join(' ').toLowerCase();
                return terms.some(t => haystack.includes(t));
            });
        }

        // Client-side sort (in case SSR sort differs after filter)
        if (sort === 'az') {
            list.sort((a, b) => (a.business_name || '').localeCompare(b.business_name || ''));
        } else if (sort === 'recent') {
            list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        return list;
    }, [initialVendors, searchQuery, activeCategory, sort]);

    const visibleVendors = filteredVendors.slice(0, visibleCount);
    const hasMore = visibleCount < filteredVendors.length;

    function clearFilters() {
        setSearchQuery('');
        setActiveCategory('');
        setSort('featured');
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
                            {filteredVendors.length} {filteredVendors.length === 1 ? 'business' : 'businesses'} in Harbour View
                        </p>
                    </div>
                </div>
            </div>

            <main className="px-6 pb-20">
                {/* ── Sticky filter bar ── */}
                <div className="sticky top-16 z-30 bg-white border-b border-border shadow-sm">
                    <div className="container-premium py-3">
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Search */}
                            <div className="flex-1 min-w-48">
                                <input
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
                                className="text-sm border border-border rounded-btn px-3 py-2 outline-none focus:border-brand bg-bg-alt text-text"
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
                                className="text-sm border border-border rounded-btn px-3 py-2 outline-none focus:border-brand bg-bg-alt text-text"
                            >
                                {SORT_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>

                            {/* Clear */}
                            {(searchQuery || activeCategory || sort !== 'featured') && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-text-muted hover:text-red-600 font-medium transition whitespace-nowrap"
                                >
                                    ✕ Clear
                                </button>
                            )}
                        </div>

                        {/* Active category chips row */}
                        {activeCategory && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                                <span className="text-xs text-text-muted">Filtered:</span>
                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-soft text-brand px-3 py-1 rounded-full">
                                    {activeCategory}
                                    <button onClick={() => setActiveCategory('')} className="ml-1 hover:opacity-70">✕</button>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="container-premium pt-8">
                    {/* Results count */}
                    {(searchQuery || activeCategory) && (
                        <p className="text-sm text-text-muted mb-6">
                            {filteredVendors.length === 0
                                ? 'No results found'
                                : `${filteredVendors.length} result${filteredVendors.length !== 1 ? 's' : ''}${activeCategory ? ` in ${activeCategory}` : ''}${searchQuery ? ` for "${searchQuery}"` : ''}`
                            }
                        </p>
                    )}

                    {/* ── Grid ── */}
                    {visibleVendors.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {visibleVendors.map(vendor => (
                                    <ListingCard key={vendor.id} vendor={vendor} />
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
                            <h2 className="text-2xl font-extrabold text-text mb-2">No businesses found</h2>
                            <p className="text-text-soft mb-8 max-w-md mx-auto">
                                {searchQuery
                                    ? `No results for "${searchQuery}"${activeCategory ? ` in ${activeCategory}` : ''}. Try a different search or category.`
                                    : `No businesses in ${activeCategory} yet. Try a different category.`
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
