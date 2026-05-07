import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/VendorCard';
import { supabase } from '../lib/supabase';

const CATEGORY_CHIPS = [
    { label: 'Food', emoji: '🍽️', query: 'Food & Beverage' },
    { label: 'Beauty', emoji: '💆', query: 'Beauty & Wellness' },
    { label: 'Home Services', emoji: '🏠', query: 'Home Services' },
    { label: 'Tech', emoji: '📱', query: 'Tech & Electronics' },
    { label: 'Transport', emoji: '🚗', query: 'Auto & Transport' },
    { label: 'Tutors', emoji: '📚', query: 'Education & Tutoring' },
    { label: 'Rentals', emoji: '🏘️', href: '/rent-near-cmu' },
];

const TRUST_ITEMS = [
    { icon: '✅', title: 'Verified Listings', desc: 'Every business reviewed before publishing' },
    { icon: '💬', title: 'WhatsApp Contact', desc: 'Reach businesses directly, instantly' },
    { icon: '🛡️', title: 'Community Reporting', desc: 'Flag incorrect info anytime' },
    { icon: '🏘️', title: 'Built for Harbour View', desc: 'Local knowledge, local focus' },
];

export async function getServerSideProps() {
    try {
        // Curated listings: featured/top_ad first, fall back to most recent — limit 8
        const { data: featuredVendors } = await supabase
            .from('vendors')
            .select('id, business_name, category, description, slug, address, whatsapp, images, is_featured, is_top_ad, created_at')
            .eq('is_approved', true)
            .order('is_top_ad', { ascending: false })
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8);

        // Recent additions (different set — used for "Recently Added" strip)
        const { data: recentVendors } = await supabase
            .from('vendors')
            .select('id, business_name, category, description, slug, address, whatsapp, images, is_featured, is_top_ad, created_at')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(4);

        // Rentals preview
        const { data: rentals } = await supabase
            .from('rentals')
            .select('id, title, type, price, location, furnished, slug, created_at')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(3);

        return {
            props: {
                featuredVendors: featuredVendors || [],
                recentVendors: recentVendors || [],
                rentals: rentals || [],
            },
        };
    } catch (err) {
        console.error('Homepage SSR error:', err.message);
        return { props: { featuredVendors: [], recentVendors: [], rentals: [] } };
    }
}

export default function Home({ featuredVendors, recentVendors, rentals }) {
    const [searchQuery, setSearchQuery] = useState('');

    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/directory?q=${encodeURIComponent(searchQuery.trim())}`;
        }
    }

    function handleChipClick(chip) {
        if (chip.href) {
            window.location.href = chip.href;
        } else {
            window.location.href = `/directory?category=${encodeURIComponent(chip.query)}`;
        }
    }

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Harbour View Directory — Local Businesses, Services &amp; Events | Kingston, Jamaica</title>
                <meta name="description" content="Harbour View's trusted local directory for businesses, rentals near CMU, services, deals, and community notices. Kingston, Jamaica." />
                <meta property="og:title" content="Harbour View Directory — Trusted Local Directory" />
                <meta property="og:description" content="Local businesses, rentals, deals, and community notices in one place. Harbour View, Kingston Jamaica." />
                <meta property="og:url" content="https://harbourviewdirectory.online" />
                <meta property="og:image" content="https://harbourviewdirectory.online/og-image.png" />
                <link rel="canonical" href="https://harbourviewdirectory.online" />
            </Head>

            <Navbar />

            <main>
                {/* ═══════════════════════════════════════════════════════
                    HERO — Deep navy, grid-dot texture, strong headline
                ═══════════════════════════════════════════════════════ */}
                <section
                    className="relative overflow-hidden pt-28 pb-48 px-6"
                    style={{
                        background: 'linear-gradient(135deg, #0B2545 0%, #0F3460 45%, #0369A1 100%)',
                    }}
                >
                    {/* Dot-grid texture overlay */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                            backgroundSize: '28px 28px',
                        }}
                    />
                    {/* Radial glow top-right */}
                    <div
                        aria-hidden="true"
                        className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)' }}
                    />

                    <div className="container-premium relative z-10">
                        <div className="max-w-3xl mx-auto text-center">
                            {/* Location pill */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full mb-7">
                                🏘️ Harbour View · Kingston, Jamaica
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-5 leading-tight">
                                Harbour View's<br />
                                <span style={{ color: '#F59E0B' }}>Trusted Local Directory</span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed mb-3">
                                Local businesses, rentals, deals, and community notices in one place.
                            </p>

                            <div className="flex flex-wrap justify-center gap-3 mt-9">
                                <Link
                                    href="/directory"
                                    className="bg-white text-brand-navy font-bold px-8 py-3.5 rounded-btn shadow-elevated hover:bg-gray-50 transition-all"
                                    style={{ color: '#0B2545' }}
                                >
                                    Browse Directory
                                </Link>
                                <Link
                                    href="/post-ad"
                                    style={{ background: '#F59E0B' }}
                                    className="text-white font-bold px-8 py-3.5 rounded-btn shadow-elevated hover:opacity-90 transition-all"
                                >
                                    List Your Business
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    FLOATING SEARCH CARD — overlaps hero
                ═══════════════════════════════════════════════════════ */}
                <div className="relative z-20 px-6" style={{ marginTop: '-7rem' }}>
                    <div className="container-premium">
                        <div
                            className="max-w-2xl mx-auto bg-white rounded-2xl p-5"
                            style={{ boxShadow: '0 24px 48px -12px rgba(0,0,0,0.22)' }}
                        >
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search plumber, tutor, phone repair, cooking gas…"
                                    className="flex-1 text-sm md:text-base border border-border rounded-btn px-4 py-3 outline-none focus:border-brand transition text-text placeholder-text-muted bg-bg-alt"
                                />
                                <button
                                    type="submit"
                                    className="bg-brand text-white font-bold px-5 py-3 rounded-btn hover:bg-brand-deep transition shrink-0"
                                    style={{ background: '#0EA5E9' }}
                                >
                                    Search
                                </button>
                            </form>

                            {/* Category chips */}
                            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
                                <span className="text-xs text-text-muted font-medium pt-1 pr-1">Quick:</span>
                                {CATEGORY_CHIPS.map(chip => (
                                    <button
                                        key={chip.label}
                                        onClick={() => handleChipClick(chip)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-bg-alt text-text-soft hover:border-brand hover:text-brand hover:bg-brand-soft transition-all"
                                    >
                                        <span>{chip.emoji}</span>
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════
                    TRUST STRIP
                ═══════════════════════════════════════════════════════ */}
                <section className="py-14 px-6 bg-bg">
                    <div className="container-premium">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {TRUST_ITEMS.map(item => (
                                <div
                                    key={item.title}
                                    className="text-center p-5 rounded-2xl bg-white border border-border"
                                    style={{ boxShadow: 'var(--shadow-soft)' }}
                                >
                                    <div className="text-3xl mb-2">{item.icon}</div>
                                    <div className="font-bold text-text text-sm mb-0.5">{item.title}</div>
                                    <div className="text-xs text-text-muted leading-relaxed">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    FEATURED BUSINESSES — curated 6–8
                ═══════════════════════════════════════════════════════ */}
                <section className="section-spacing px-6 bg-bg-alt">
                    <div className="container-premium">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-warm mb-1 block">
                                    Local Businesses
                                </span>
                                <h2 className="text-3xl font-extrabold text-text">Featured in Harbour View</h2>
                                <p className="text-text-soft mt-1">Trusted businesses serving our community.</p>
                            </div>
                            <Link
                                href="/directory"
                                className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-deep transition shrink-0"
                            >
                                View All Businesses →
                            </Link>
                        </div>

                        {featuredVendors.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {featuredVendors.slice(0, 8).map(vendor => (
                                        <ListingCard key={vendor.id} vendor={vendor} />
                                    ))}
                                </div>
                                <div className="text-center mt-10">
                                    <Link
                                        href="/directory"
                                        className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-btn border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all"
                                    >
                                        View All Businesses →
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-border">
                                <div className="text-5xl mb-3">🏪</div>
                                <h3 className="font-bold text-text mb-1">No listings yet</h3>
                                <p className="text-text-muted text-sm mb-6">Be the first business in Harbour View Directory.</p>
                                <Link href="/post-ad" className="btn-primary">List Your Business — It&apos;s Free</Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    RENT NEAR CMU PREVIEW
                ═══════════════════════════════════════════════════════ */}
                <section className="section-spacing px-6">
                    <div className="container-premium">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-brand mb-1 block">
                                    🎓 Student Housing
                                </span>
                                <h2 className="text-3xl font-extrabold text-text">Rent Near CMU</h2>
                                <p className="text-text-soft mt-1">Rooms and apartments near Caribbean Maritime University.</p>
                            </div>
                            <Link
                                href="/rent-near-cmu"
                                className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-deep transition shrink-0"
                            >
                                View All Rentals →
                            </Link>
                        </div>

                        {rentals.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {rentals.map(rental => (
                                        <Link
                                            key={rental.id}
                                            href={`/rent-near-cmu/${rental.slug || rental.id}`}
                                            className="card-premium p-5 block"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-soft text-brand">{rental.type}</span>
                                                {rental.furnished && <span className="text-xs text-text-muted">Furnished</span>}
                                            </div>
                                            <h3 className="font-bold text-text mb-1 line-clamp-1">{rental.title}</h3>
                                            {rental.location && <p className="text-xs text-text-muted mb-2">📍 {rental.location}</p>}
                                            {rental.price && (
                                                <p className="text-base font-extrabold text-brand-deep mt-2">
                                                    J${rental.price.toLocaleString()}<span className="text-xs font-normal text-text-muted">/mo</span>
                                                </p>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                                <div className="text-center mt-8">
                                    <Link href="/rent-near-cmu" className="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-btn border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all">
                                        View All Rentals →
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="card-premium p-10 text-center max-w-xl mx-auto">
                                <div className="text-4xl mb-3">🏠</div>
                                <h3 className="font-bold text-text mb-2">No rentals posted yet</h3>
                                <p className="text-sm text-text-soft mb-6">
                                    Submit the first rental near CMU — free for landlords.
                                </p>
                                <Link href="/rent-near-cmu/submit" className="btn-primary">Submit a Rental</Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    DEALS PREVIEW
                ═══════════════════════════════════════════════════════ */}
                <section className="section-spacing px-6 bg-bg-alt">
                    <div className="container-premium">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-warm mb-1 block">🏷️ Promotions</span>
                                <h2 className="text-3xl font-extrabold text-text">Local Deals</h2>
                                <p className="text-text-soft mt-1">Discounts and specials from Harbour View businesses.</p>
                            </div>
                            <Link href="/deals" className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-deep transition shrink-0">
                                View All Deals →
                            </Link>
                        </div>

                        {/* Empty state — deals are manual submit workflow */}
                        <div className="card-premium p-10 text-center max-w-xl mx-auto">
                            <div className="text-4xl mb-3">🏷️</div>
                            <h3 className="font-bold text-text mb-2">No active deals yet</h3>
                            <p className="text-sm text-text-soft mb-6">
                                Submit a deal — free for all listed businesses. Reviewed within 24 hours.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <a
                                    href="mailto:info@harbourviewdirectory.online?subject=Submit a Deal"
                                    className="btn-primary"
                                    style={{ background: '#F59E0B' }}
                                >
                                    📧 Submit a Deal
                                </a>
                                <Link href="/deals" className="btn-secondary">Browse Deals Page</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    SAFETY PREVIEW
                ═══════════════════════════════════════════════════════ */}
                <section className="section-spacing px-6">
                    <div className="container-premium">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1 block">🚨 Community</span>
                                <h2 className="text-3xl font-extrabold text-text">Safety Notices</h2>
                                <p className="text-text-soft mt-1">Road alerts, scam warnings, and community notices.</p>
                            </div>
                            <Link href="/safety" className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-deep transition shrink-0">
                                View Safety Page →
                            </Link>
                        </div>

                        <div className="card-premium p-10 text-center max-w-xl mx-auto border-l-4 border-green-400">
                            <div className="text-4xl mb-3">✅</div>
                            <h3 className="font-bold text-text mb-2">No active safety notices</h3>
                            <p className="text-sm text-text-soft mb-6">
                                Nothing urgent at this time. To report a road hazard, scam, or community notice:
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <a
                                    href="https://wa.me/18767978034?text=I+want+to+report+a+safety+notice+for+Harbour+View."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-whatsapp"
                                >
                                    💬 Report via WhatsApp
                                </a>
                                <Link href="/safety" className="btn-secondary">View Safety Page</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    RECENTLY ADDED
                ═══════════════════════════════════════════════════════ */}
                {recentVendors.length > 0 && (
                    <section className="section-spacing px-6 bg-bg-alt">
                        <div className="container-premium">
                            <div className="mb-8">
                                <span className="text-xs font-bold uppercase tracking-widest text-brand mb-1 block">New</span>
                                <h2 className="text-3xl font-extrabold text-text">Recently Added</h2>
                                <p className="text-text-soft mt-1">Latest businesses to join Harbour View Directory.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {recentVendors.slice(0, 4).map(vendor => (
                                    <ListingCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ═══════════════════════════════════════════════════════
                    LIST YOUR BUSINESS CTA
                ═══════════════════════════════════════════════════════ */}
                <section
                    className="section-spacing px-6 text-center text-white relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0B2545 0%, #0F3460 60%, #0369A1 100%)' }}
                >
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
                            backgroundSize: '28px 28px',
                        }}
                    />
                    <div className="container-premium max-w-2xl relative z-10">
                        <div className="text-5xl mb-4">🏪</div>
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Part of the Harbour View community?</h2>
                        <p className="text-lg text-white/75 mb-8 leading-relaxed">
                            List your business, promote a service, or let neighbours know what you offer. It starts free.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/post-ad"
                                className="bg-white font-bold px-8 py-3.5 rounded-btn shadow-elevated hover:bg-gray-50 transition-all"
                                style={{ color: '#0B2545' }}
                            >
                                List Your Business
                            </Link>
                            <Link
                                href="/pricing"
                                className="border-2 border-white/30 text-white font-bold px-8 py-3.5 rounded-btn hover:bg-white/10 transition-all"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
