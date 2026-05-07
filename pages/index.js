import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/VendorCard';
import { supabase } from '../lib/supabase';

const CATEGORY_CHIPS = [
    { label: 'Food', emoji: '🍽️', query: 'Food & Restaurants' },
    { label: 'Beauty', emoji: '💆', query: 'Beauty & Wellness' },
    { label: 'Home Services', emoji: '🏠', query: 'Home Services' },
    { label: 'Auto', emoji: '🚗', query: 'Auto & Transport' },
    { label: 'Health', emoji: '⚕️', query: 'Health & Medical' },
    { label: 'Laundry', emoji: '🧺', query: 'Laundry & Cleaning' },
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
            .eq('public_visibility', true)
            .in('locality_status', ['harbour_view_verified', 'harbour_view_likely'])
            .order('is_top_ad', { ascending: false })
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8);

        // Recent additions (different set — used for "Recently Added" strip)
        const { data: recentVendors } = await supabase
            .from('vendors')
            .select('id, business_name, category, description, slug, address, whatsapp, images, is_featured, is_top_ad, created_at')
            .eq('is_approved', true)
            .eq('public_visibility', true)
            .in('locality_status', ['harbour_view_verified', 'harbour_view_likely'])
            .order('created_at', { ascending: false })
            .limit(4);

        // Rentals preview
        const { data: rentals } = await supabase
            .from('rentals')
            .select('id, title, type, price, location, furnished, slug, created_at')
            .eq('status', 'approved')
            .eq('public_visibility', true)
            .in('locality_status', ['harbour_view_verified', 'harbour_view_likely', 'nearby_allowed'])
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
                <meta property="og:image" content="https://harbourviewdirectory.online/hero.png" />
                <link rel="canonical" href="https://harbourviewdirectory.online" />
                {/* Preload hero image for LCP */}
                <link
                    rel="preload"
                    as="image"
                    href="/hero.webp"
                    type="image/webp"
                    media="(min-width: 769px)"
                />
                <link
                    rel="preload"
                    as="image"
                    href="/hero-mobile.webp"
                    type="image/webp"
                    media="(max-width: 768px)"
                />
            </Head>

            <Navbar />

            <main>
                {/* ═══════════════════════════════════════════════════════
                    HERO — harbour.png photo hero with layered overlays
                ═══════════════════════════════════════════════════════ */}
                <section
                    className="relative overflow-hidden"
                    style={{ minHeight: 'clamp(520px, 72vh, 780px)' }}
                >
                    {/* ── Background photo (responsive WebP with PNG fallback) ── */}
                    <picture>
                        <source
                            srcSet="/hero.webp"
                            type="image/webp"
                            media="(min-width: 769px)"
                        />
                        <source
                            srcSet="/hero-mobile.webp"
                            type="image/webp"
                            media="(max-width: 768px)"
                        />
                        <img
                            src="/hero.png"
                            alt="Aerial view of Harbour View, Kingston Jamaica at golden hour"
                            className="absolute inset-0 w-full h-full"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'center 40%',
                            }}
                            fetchPriority="high"
                            decoding="async"
                            width="1536"
                            height="1024"
                        />
                    </picture>

                    {/* ── Layer 1: deep navy vignette — bottom-left, where text lives ── */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                'linear-gradient(to right, rgba(11,37,69,0.88) 0%, rgba(11,37,69,0.60) 40%, rgba(11,37,69,0.10) 75%, transparent 100%),' +
                                'linear-gradient(to top, rgba(11,37,69,0.80) 0%, rgba(11,37,69,0.30) 40%, transparent 70%)',
                        }}
                    />

                    {/* ── Layer 2: brand blue tint — ties photo to site palette ── */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'rgba(3,105,161,0.12)' }}
                    />

                    {/* ── Layer 3: warm gold glow — mirrors the sun in the photo (top-right) ── */}
                    <div
                        aria-hidden="true"
                        className="absolute pointer-events-none"
                        style={{
                            top: '-8%',
                            right: '-5%',
                            width: '55%',
                            height: '70%',
                            background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.18) 0%, rgba(251,191,36,0.06) 45%, transparent 70%)',
                        }}
                    />

                    {/* ── Text content ── */}
                    <div
                        className="relative z-10 flex flex-col justify-end h-full px-6 pb-0"
                        style={{ minHeight: 'clamp(520px, 72vh, 780px)' }}
                    >
                        <div className="container-premium">
                            <div className="max-w-2xl pb-16 md:pb-20">

                                {/* Location pill */}
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-bold tracking-wide px-4 py-1.5 rounded-full mb-6 uppercase">
                                    <span aria-hidden="true">🏘️</span>
                                    Harbour View · Kingston 17, Jamaica
                                </div>

                                {/* Main headline */}
                                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.12] mb-4">
                                    Harbour View's<br />
                                    <span
                                        style={{
                                            color: '#F59E0B',
                                            textShadow: '0 2px 12px rgba(245,158,11,0.35)',
                                        }}
                                    >
                                        Trusted Local Directory
                                    </span>
                                </h1>

                                {/* Sub-headline */}
                                <p
                                    className="text-base md:text-lg leading-relaxed mb-8"
                                    style={{ color: 'rgba(255,255,255,0.82)' }}
                                >
                                    Businesses · Rentals near CMU · Services · Deals · Community notices
                                </p>

                                {/* CTA buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/directory"
                                        className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-btn transition-all"
                                        style={{
                                            background: 'white',
                                            color: '#0B2545',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#F0F9FF'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        <span aria-hidden="true">🔍</span>
                                        Browse Directory
                                    </Link>
                                    <Link
                                        href="/post-ad"
                                        className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-btn transition-all border-2"
                                        style={{
                                            background: 'rgba(245,158,11,0.92)',
                                            borderColor: 'rgba(245,158,11,0.5)',
                                            color: 'white',
                                            boxShadow: '0 4px 20px rgba(245,158,11,0.30)',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#F59E0B'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.92)'; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        <span aria-hidden="true">➕</span>
                                        List Your Business
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    SEARCH CARD — frosted glass, floats below hero
                    Negative margin pulls it up to overlap the hero/next section seam
                ═══════════════════════════════════════════════════════ */}
                <div
                    className="relative z-20 px-6"
                    style={{ marginTop: '-4rem' }}
                >
                    <div className="container-premium">
                        <div
                            className="max-w-2xl mx-auto rounded-2xl p-5"
                            style={{
                                background: 'rgba(255,255,255,0.97)',
                                boxShadow: '0 24px 60px -10px rgba(11,37,69,0.22), 0 8px 20px -5px rgba(0,0,0,0.10)',
                                border: '1px solid rgba(226,232,240,0.8)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                            }}
                        >
                            {/* Search row */}
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-1">
                                    <span
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-base pointer-events-none"
                                        aria-hidden="true"
                                    >
                                        🔍
                                    </span>
                                    <input
                                        type="text"
                                        id="hero-search"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search plumber, tutor, phone repair, cooking gas…"
                                        className="w-full text-sm md:text-base border border-border rounded-btn pl-10 pr-4 py-3 outline-none focus:border-brand transition text-text placeholder-text-muted bg-bg-alt"
                                        aria-label="Search businesses"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="font-bold px-5 py-3 rounded-btn shrink-0 transition-all"
                                    style={{ background: '#0EA5E9', color: 'white' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#0369A1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#0EA5E9'; }}
                                >
                                    Search
                                </button>
                            </form>

                            {/* Category chips */}
                            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border">
                                <span className="text-xs text-text-muted font-medium pt-1 pr-1" aria-hidden="true">Quick:</span>
                                {CATEGORY_CHIPS.map(chip => (
                                    <button
                                        key={chip.label}
                                        onClick={() => handleChipClick(chip)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-bg-alt text-text-soft hover:border-brand hover:text-brand hover:bg-brand-soft transition-all"
                                        type="button"
                                    >
                                        <span aria-hidden="true">{chip.emoji}</span>
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════
                    TRUST STRIP MOVED BELOW
                ═══════════════════════════════════════════════════════ */}

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
                {rentals.length > 0 && (
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
                        </div>
                    </section>
                )}

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
                                Submit / Claim Business
                            </Link>
                            <a
                                href="https://wa.me/18767978034?text=I+want+to+report+incorrect+info+on+Harbour+View+Directory"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border-2 border-white/30 text-white font-bold px-8 py-3.5 rounded-btn hover:bg-white/10 transition-all"
                            >
                                ⚑ Report Incorrect Info
                            </a>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════
                    TRUST STRIP
                ═══════════════════════════════════════════════════════ */}
                <section className="py-14 px-6 bg-bg-alt border-t border-border">
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
            </main>

            <Footer />
        </div>
    );
}
