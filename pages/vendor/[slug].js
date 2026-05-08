import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase, getImageUrl } from '../../lib/supabase';
import { getDisplayCategory } from '../../lib/categoryMap';
import {
    applyPublicVendorFilters,
    filterPublicVendors,
    PUBLIC_VENDOR_COLUMNS,
} from '../../lib/publicDirectory';

const CATEGORY_FALLBACKS = {
    'Food & Restaurants':       { grad: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', emoji: '🍽️' },
    'Beauty & Wellness':        { grad: 'linear-gradient(135deg, #FDF2F8 0%, #FBCFE8 100%)', emoji: '💆' },
    'Home Services':            { grad: 'linear-gradient(135deg, #ECFDF5 0%, #A7F3D0 100%)', emoji: '🏠' },
    'Auto & Transport':         { grad: 'linear-gradient(135deg, #F1F5F9 0%, #CBD5E1 100%)', emoji: '🚗' },
    'Education':                { grad: 'linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)', emoji: '📚' },
    'Tech & Electronics':       { grad: 'linear-gradient(135deg, #ECFEFF 0%, #A5F3FC 100%)', emoji: '📱' },
    'Finance & Banking':        { grad: 'linear-gradient(135deg, #ECFDF5 0%, #6EE7B7 100%)', emoji: '🏦' },
    'Health & Medical':         { grad: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)', emoji: '⚕️' },
    'Retail & Shopping':        { grad: 'linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 100%)', emoji: '🛍️' },
    'Community & Church':       { grad: 'linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)', emoji: '⛪' },
    'Laundry & Cleaning':       { grad: 'linear-gradient(135deg, #F0F9FF 0%, #BAE6FD 100%)', emoji: '🧺' },
    'Professional / Legal / JP': { grad: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)', emoji: '🏢' },
    'Grocery & Convenience':    { grad: 'linear-gradient(135deg, #F0FDF4 0%, #BBF7D0 100%)', emoji: '🛒' },
    'Marine / Fishing Supplies':{ grad: 'linear-gradient(135deg, #ECFEFF 0%, #67E8F9 100%)', emoji: '⚓' },
};

export async function getServerSideProps(context) {
    const { slug } = context.params;

    try {
        // Try by slug first
        let { data: vendor, error: vendorError } = await applyPublicVendorFilters(
            supabase
                .from('vendors')
                .select('*, reviews(*)')
        )
            .eq('slug', slug)
            .single();

        if (vendorError) {
            // Fallback: try by ID
            const { data: vendorById, error: idError } = await applyPublicVendorFilters(
                supabase
                    .from('vendors')
                    .select('*, reviews(*)')
            )
                .eq('id', slug)
                .single();

            if (idError) return { notFound: true };

            if (vendorById && !vendorById.slug) {
                const generatedSlug = vendorById.business_name
                    .toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                await supabase.from('vendors').update({ slug: generatedSlug }).eq('id', vendorById.id);
                return { redirect: { destination: `/vendor/${generatedSlug}`, permanent: true } };
            }

            vendor = vendorById;
        }

        if (!vendor) return { notFound: true };

        // Fetch similar businesses (same normalized category, limit 3)
        const cat = getDisplayCategory(vendor);
        // Get vendors with same DB category or similar name pattern
        const { data: similar } = await applyPublicVendorFilters(
            supabase
                .from('vendors')
                .select(PUBLIC_VENDOR_COLUMNS)
        )
            .neq('id', vendor.id)
            .limit(40);

        // Filter similar by same normalized display category
        const similarFiltered = filterPublicVendors(similar || [])
            .filter(v => getDisplayCategory(v).display === cat.display)
            .slice(0, 3);

        return {
            props: {
                vendor,
                reviews: vendor.reviews || [],
                similar: similarFiltered,
                error: null,
            },
        };
    } catch (error) {
        console.error('Vendor SSR error:', error.message);
        return { notFound: true };
    }
}

export default function VendorDetailSlug({ vendor, reviews: initialReviews, similar }) {
    const router = useRouter();
    const [reviews, setReviews] = useState(initialReviews);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [userName, setUserName] = useState('');
    const [heroImgError, setHeroImgError] = useState(false);

    const cat = getDisplayCategory(vendor);
    const fallback = CATEGORY_FALLBACKS[cat.display] || CATEGORY_FALLBACKS['Professional / Legal / JP'];
    const heroImageUrl = getImageUrl(vendor?.images?.[0]);
    const displayAddress = vendor?.address || 'Local Harbour View business — address not listed';

    // Owner notes vs community reviews
    const OWNER_NOTE_PATTERNS = [
        /instagram\.com/i, /we accept/i, /online booking/i, /appointments only/i,
        /close on/i, /open on/i, /book (via|on|at|through)/i,
        /payment (accepted|methods)/i, /debt.{0,10}card/i, /credit.{0,10}card/i,
    ];
    function isOwnerNote(r) { return OWNER_NOTE_PATTERNS.some(p => p.test(r.comment || '')); }
    const communityReviews = reviews.filter(r => !isOwnerNote(r));
    const ownerNotes = reviews.filter(r => isOwnerNote(r));

    if (router.isFallback) {
        return (
            <div className="min-h-screen bg-bg"><Navbar />
                <div className="pt-32 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-bg"><Navbar />
                <div className="pt-32 text-center px-6">
                    <h1 className="text-2xl font-bold text-text">Business not found</h1>
                    <p className="text-text-soft mt-2">This listing may have been removed or doesn't exist.</p>
                    <Link href="/directory" className="inline-block mt-6 text-brand font-bold hover:underline">
                        ← Back to Directory
                    </Link>
                </div>
            </div>
        );
    }

    async function submitReview(e) {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert([{ vendor_id: vendor.id, user_name: userName || 'Anonymous', rating, comment }])
                .select();
            if (error) throw error;
            if (data?.length > 0) setReviews([data[0], ...reviews]);
        } catch {
            setReviews([{ id: Math.random().toString(), user_name: userName || 'Anonymous', rating, comment, created_at: new Date().toISOString() }, ...reviews]);
        }
        setShowReviewForm(false);
        setComment('');
        setRating(5);
    }

    // JSON-LD — only include aggregateRating if real reviews exist
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: vendor.business_name,
        description: vendor.description,
        address: {
            '@type': 'PostalAddress',
            streetAddress: vendor.address,
            addressLocality: 'Harbour View',
            addressRegion: 'Kingston',
            addressCountry: 'JM',
        },
        telephone: vendor.phone,
        url: `https://harbourviewdirectory.online/vendor/${vendor.slug || vendor.id}`,
        ...(vendor.images?.length > 0 && { image: vendor.images[0] }),
        ...(communityReviews.length > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: (communityReviews.reduce((s, r) => s + (r.rating || 0), 0) / communityReviews.length).toFixed(1),
                ratingCount: communityReviews.length,
                bestRating: 5,
                worstRating: 1,
            },
        }),
        areaServed: 'Harbour View, Kingston Jamaica',
        sameAs: vendor.whatsapp ? [vendor.whatsapp] : [],
    };

    const pageTitle = `${vendor.business_name} | ${cat.display} in Harbour View, Kingston Jamaica`;
    const pageDescription = vendor.description
        ? `${vendor.description.slice(0, 150)}…`
        : `${vendor.business_name} — ${cat.display} serving Harbour View, Kingston Jamaica. Contact details and location.`;

    const shareUrl = `https://harbourviewdirectory.online/vendor/${vendor.slug || vendor.id}`;
    const whatsappClaim = `https://wa.me/18767978034?text=I+would+like+to+claim+the+listing+for+${encodeURIComponent(vendor.business_name)}+on+Harbour+View+Directory.`;
    const whatsappReport = `https://wa.me/18767978034?text=I+want+to+report+incorrect+info+for+${encodeURIComponent(vendor.business_name)}+(${vendor.slug || vendor.id}).%0A%0AIssue+type:+[Wrong phone number / Wrong category / Business closed / Duplicate listing / Wrong address / Missing WhatsApp / Other]%0A%0AMy+correction:`;

    const shouldNoindex = !vendor.business_name || !vendor.category || vendor.is_approved === false;

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="business.business" />
                <meta property="og:url" content={shareUrl} />
                {vendor.images?.length > 0 && <meta property="og:image" content={vendor.images[0]} />}
                {shouldNoindex && <meta name="robots" content="noindex, nofollow" />}
                <link rel="canonical" href={shareUrl} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            </Head>
            <Navbar />

            <main className="pt-20 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-text-muted mb-6 mt-4" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-brand transition">Home</Link>
                        <span>/</span>
                        <Link href="/directory" className="hover:text-brand transition">Directory</Link>
                        <span>/</span>
                        <span className="text-text font-medium truncate">{vendor.business_name}</span>
                    </nav>

                    {/* ── Main card ── */}
                    <div className="card-premium-static overflow-hidden mb-6">
                        {/* Hero image */}
                        <div
                            className="relative h-64 w-full flex items-center justify-center"
                            style={!heroImageUrl || heroImgError ? { background: fallback.grad } : undefined}
                        >
                            {heroImageUrl && !heroImgError ? (
                                <Image
                                    src={heroImageUrl}
                                    alt={vendor.business_name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    onError={() => setHeroImgError(true)}
                                />
                            ) : (
                                <div className="text-center">
                                    <div className="text-7xl mb-2 opacity-70">{fallback.emoji}</div>
                                    <span className="text-text-muted text-sm font-medium">{cat.display}</span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-6 md:p-8">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-text mb-2 leading-tight">
                                        {vendor.business_name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className="badge-category"
                                            style={{ background: fallback.grad, color: '#374151' }}
                                        >
                                            {fallback.emoji} {cat.display}
                                        </span>
                                        {vendor.is_top_ad && (
                                            <span className="badge-featured" style={{ background: '#F59E0B', color: 'white' }}>⭐ Top Ad</span>
                                        )}
                                        {vendor.is_featured && !vendor.is_top_ad && (
                                            <span className="badge-featured">Featured</span>
                                        )}
                                        {communityReviews.length > 0 && (
                                            <span className="text-sm text-text-muted">
                                                ★ {(communityReviews.reduce((s, r) => s + (r.rating || 0), 0) / communityReviews.length).toFixed(1)} ({communityReviews.length} review{communityReviews.length !== 1 ? 's' : ''})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Share button */}
                                <button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({ title: vendor.business_name, url: shareUrl });
                                        } else {
                                            navigator.clipboard?.writeText(shareUrl);
                                        }
                                    }}
                                    className="text-sm font-medium text-text-muted hover:text-brand transition px-3 py-1.5 rounded-btn border border-border hover:border-brand"
                                    title="Share listing"
                                >
                                    🔗 Share
                                </button>
                            </div>

                            {/* Description */}
                            <div className="text-text-soft leading-relaxed mb-6 whitespace-pre-wrap">
                                {vendor.description || (vendor.phone || vendor.whatsapp
                                    ? 'Local Harbour View business. Details are being updated.'
                                    : 'Local Harbour View business. Contact details are being verified.')}
                            </div>

                            {/* Contact & CTAs */}
                            <div className="bg-bg-alt rounded-xl p-5 border border-border mb-4">
                                <h2 className="text-base font-bold text-text mb-4">Contact Information</h2>
                                
                                <div className="space-y-3 text-sm text-text-soft mb-5">
                                    <div className="flex items-start gap-2.5">
                                        <span className="mt-0.5 shrink-0">📍</span>
                                        <div>
                                            <strong className="text-text block text-xs font-bold uppercase tracking-wide mb-0.5">Address</strong>
                                            {displayAddress}
                                        </div>
                                    </div>
                                    {!vendor.phone && !vendor.whatsapp && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                                            <p className="font-medium text-amber-700 mb-1">Contact not verified yet</p>
                                            <p>Know this business? <a href={whatsappReport} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">Report the correct contact info</a>.</p>
                                        </div>
                                    )}
                                    {vendor.phone && (
                                        <div className="flex items-start gap-2.5">
                                            <span className="mt-0.5 shrink-0">📞</span>
                                            <div>
                                                <strong className="text-text block text-xs font-bold uppercase tracking-wide mb-0.5">Phone</strong>
                                                <a href={`tel:${vendor.phone}`} className="hover:text-brand transition font-medium">{vendor.phone}</a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Primary CTAs */}
                                <div className="flex flex-wrap gap-2.5 mb-5">
                                    {vendor.phone && (
                                        <a href={`tel:${vendor.phone}`} className="flex-1 min-w-[120px] text-center font-bold px-4 py-2.5 rounded-btn bg-brand text-white hover:bg-brand-deep transition shadow-sm">
                                            📞 Call Now
                                        </a>
                                    )}
                                    {vendor.whatsapp && (
                                        <a href={vendor.whatsapp} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px] text-center font-bold px-4 py-2.5 rounded-btn bg-[#25D366] text-white hover:bg-[#1DA851] transition shadow-sm">
                                            💬 WhatsApp
                                        </a>
                                    )}
                                    {vendor.address && (
                                        <a href={`https://maps.google.com/?q=${encodeURIComponent(vendor.business_name + ' ' + vendor.address + ', Harbour View, Jamaica')}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px] text-center font-bold px-4 py-2.5 rounded-btn bg-white border border-border text-text hover:border-brand transition shadow-sm">
                                            🗺️ Get Directions
                                        </a>
                                    )}
                                </div>

                                {/* Secondary CTAs */}
                                <div className="flex flex-wrap gap-3 text-sm pt-4 border-t border-border">
                                    <button 
                                        onClick={() => {
                                            if (navigator.share) navigator.share({ title: vendor.business_name, url: shareUrl });
                                            else navigator.clipboard?.writeText(shareUrl);
                                        }}
                                        className="text-text-muted hover:text-brand transition flex items-center gap-1 font-medium"
                                    >
                                        🔗 Share Listing
                                    </button>
                                    <span className="text-border">|</span>
                                    <a href={whatsappReport} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-red-600 transition flex items-center gap-1 font-medium">
                                        ⚑ Report Incorrect Info
                                    </a>
                                    <span className="text-border">|</span>
                                    <a href={whatsappClaim} target="_blank" rel="noopener noreferrer" className="text-brand-deep font-medium hover:underline flex items-center gap-1">
                                        🏷️ Claim This Listing
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Reviews ── */}
                    <div className="card-premium-static p-6 md:p-8 mb-6">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-text">Community Reviews</h2>
                            {!showReviewForm && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="text-sm font-bold px-4 py-2 rounded-btn border border-brand text-brand hover:bg-brand hover:text-white transition"
                                >
                                    Write a Review
                                </button>
                            )}
                        </div>

                        {showReviewForm && (
                            <form onSubmit={submitReview} className="bg-bg-alt p-5 rounded-xl border border-border mb-6 space-y-4">
                                <h3 className="font-bold text-text">Leave your review</h3>
                                <div>
                                    <label className="block text-xs font-bold text-text-soft uppercase tracking-wide mb-1.5">Your Name</label>
                                    <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-border rounded-btn outline-none focus:border-brand text-text text-sm bg-white"
                                        placeholder="Your name" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-soft uppercase tracking-wide mb-1.5">Rating</label>
                                    <select value={rating} onChange={e => setRating(Number(e.target.value))}
                                        className="w-full px-4 py-2.5 border border-border rounded-btn outline-none focus:border-brand text-text text-sm bg-white">
                                        <option value="5">5 — Excellent</option>
                                        <option value="4">4 — Very Good</option>
                                        <option value="3">3 — Average</option>
                                        <option value="2">2 — Poor</option>
                                        <option value="1">1 — Terrible</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-soft uppercase tracking-wide mb-1.5">Comment</label>
                                    <textarea rows="3" value={comment} onChange={e => setComment(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-border rounded-btn outline-none focus:border-brand text-text text-sm bg-white"
                                        placeholder="Share your experience…" required />
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" className="btn-primary text-sm py-2 px-5" style={{ background: '#0EA5E9', color: 'white', fontWeight: 700, borderRadius: '0.75rem', padding: '0.5rem 1.25rem' }}>Submit Review</button>
                                    <button type="button" onClick={() => setShowReviewForm(false)}
                                        className="text-sm text-text-muted font-medium px-4 py-2 hover:bg-bg-alt rounded-btn transition">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {communityReviews.length > 0 ? communityReviews.map(review => (
                                <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className="font-bold text-text text-sm">{review.user_name}</h4>
                                        <span className="text-brand-warm font-bold text-sm">★ {review.rating}</span>
                                    </div>
                                    <p className="text-text-soft text-sm leading-relaxed">{review.comment}</p>
                                    <p className="text-text-muted text-xs mt-1.5">
                                        {new Date(review.created_at).toLocaleDateString('en-JM', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            )) : (
                                <div className="text-center py-10 bg-bg-alt rounded-xl">
                                    <div className="text-3xl mb-2">⭐</div>
                                    <p className="font-semibold text-text mb-1">No community reviews yet</p>
                                    <p className="text-text-muted text-sm">Be the first to share your experience.</p>
                                </div>
                            )}
                        </div>

                        {ownerNotes.length > 0 && (
                            <div className="mt-6 pt-5 border-t border-border">
                                <h3 className="text-sm font-bold text-text-soft mb-3">
                                    📋 Business Notes <span className="font-normal text-text-muted">(from owner)</span>
                                </h3>
                                <div className="space-y-2.5">
                                    {ownerNotes.map(note => (
                                        <div key={note.id} className="bg-brand-soft border border-brand/20 rounded-xl p-4">
                                            <p className="text-sm text-text-soft leading-relaxed">{note.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Similar businesses ── */}
                    {similar && similar.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-text mb-4">Similar Businesses</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {similar.map(v => (
                                    <Link
                                        key={v.id}
                                        href={v.slug ? `/vendor/${v.slug}` : `/vendor/${v.id}`}
                                        className="card-premium p-4 block"
                                    >
                                        <p className="text-xs font-bold text-text-muted mb-1">{getDisplayCategory(v).display}</p>
                                        <h3 className="font-bold text-text text-sm hover:text-brand transition line-clamp-1">{v.business_name}</h3>
                                        {v.address && <p className="text-xs text-text-muted mt-1 truncate">📍 {v.address}</p>}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Back link */}
                    <div className="text-center mt-4">
                        <Link href="/directory" className="inline-flex items-center gap-1.5 text-brand font-bold hover:underline">
                            ← Back to Directory
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
