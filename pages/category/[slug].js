import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ListingCard from '../../components/VendorCard';
import { supabase } from '../../lib/supabase';
import { getCategoryLandingPage } from '../../lib/categoryLandingPages';
import { getDisplayCategory, vendorMatchesSearch } from '../../lib/categoryMap';
import {
    applyPublicVendorFilters,
    filterPublicVendors,
    PUBLIC_VENDOR_COLUMNS,
} from '../../lib/publicDirectory';

export async function getServerSideProps({ params, res }) {
    const page = getCategoryLandingPage(params.slug);

    if (!page) {
        return { notFound: true };
    }

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

    try {
        const { data: vendors, error } = await applyPublicVendorFilters(
            supabase
                .from('vendors')
                .select(PUBLIC_VENDOR_COLUMNS)
        )
            .order('is_top_ad', { ascending: false })
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(500);

        if (error) throw error;

        const filtered = filterPublicVendors(vendors || []).filter(vendor => {
            const categoryMatch = getDisplayCategory(vendor).display === page.displayCategory;
            const searchMatch = page.searchTerm ? vendorMatchesSearch(vendor, page.searchTerm) : true;
            return categoryMatch && searchMatch;
        });

        return {
            props: {
                page,
                vendors: filtered.slice(0, 24),
            },
        };
    } catch (err) {
        console.error('Category landing page error:', err.message);
        return {
            props: {
                page,
                vendors: [],
            },
        };
    }
}

export default function CategoryLandingPage({ page, vendors }) {
    const categoryUrl = `https://harbourviewdirectory.online/category/${page.slug}`;

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>{page.label} | Harbour View Directory</title>
                <meta name="description" content={page.description} />
                <meta property="og:title" content={`${page.label} | Harbour View Directory`} />
                <meta property="og:description" content={page.description} />
                <meta property="og:url" content={categoryUrl} />
                <link rel="canonical" href={categoryUrl} />
            </Head>

            <Navbar publicOnly />

            <main>
                <section className="bg-gradient-to-br from-[#0B2545] to-[#0369A1] px-6 pb-14 pt-28 text-white">
                    <div className="container-premium max-w-4xl">
                        <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">{page.heroBadge}</span>
                        <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">{page.heading}</h1>
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-sky-50/90">{page.intro}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href={`/directory?category=${encodeURIComponent(page.displayCategory)}&q=${encodeURIComponent(page.searchTerm)}`} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 hover:bg-sky-50 transition">
                                Browse matching listings
                            </Link>
                            <Link href="/post-ad" className="rounded-full bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/15 transition">
                                List your business
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="section-spacing px-6">
                    <div className="container-premium">
                        <div className="grid gap-4 md:grid-cols-3 mb-10">
                            {page.bullets.map(item => (
                                <div key={item} className="card-premium p-6">
                                    <p className="text-sm font-semibold leading-7 text-text-soft">{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h2 className="text-3xl font-extrabold text-text">Featured listings for this search intent</h2>
                                <p className="mt-2 text-text-soft">{vendors.length} {vendors.length === 1 ? 'listing' : 'listings'} matched this landing page.</p>
                            </div>
                            <Link href={`/directory?category=${encodeURIComponent(page.displayCategory)}&q=${encodeURIComponent(page.searchTerm)}`} className="font-bold text-brand hover:text-brand-deep transition">
                                Open full filtered directory →
                            </Link>
                        </div>

                        {vendors.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {vendors.map(vendor => (
                                    <ListingCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        ) : (
                            <div className="card-premium p-10 text-center">
                                <div className="text-5xl mb-4">🔎</div>
                                <h2 className="text-2xl font-extrabold text-text">No matching listings yet</h2>
                                <p className="mt-3 text-text-soft max-w-2xl mx-auto">
                                    This landing page is live and ready for search traffic. As more relevant Harbour View listings are approved, they will appear here automatically.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-3">
                                    <Link href="/post-ad" className="rounded-full bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-deep transition">
                                        Add a listing
                                    </Link>
                                    <Link href="/directory" className="rounded-full bg-bg-alt px-6 py-3 text-sm font-bold text-text hover:bg-slate-200 transition">
                                        Browse full directory
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
