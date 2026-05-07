import { useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '../lib/supabase';
import { getDisplayCategory } from '../lib/categoryMap';

// Category-based gradient fallbacks — rich visual placeholders
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
    'Books / Stationery':       { grad: 'linear-gradient(135deg, #FEFCE8 0%, #FDE68A 100%)', emoji: '📖' },
    'Pets / Animals':           { grad: 'linear-gradient(135deg, #F7FEE7 0%, #BEF264 100%)', emoji: '🐾' },
    'Online Retail':            { grad: 'linear-gradient(135deg, #FDF4FF 0%, #F5D0FE 100%)', emoji: '🛒' },
    'Events / Bookings':        { grad: 'linear-gradient(135deg, #FFF1F2 0%, #FDA4AF 100%)', emoji: '🎟️' },
    'General Services':         { grad: 'linear-gradient(135deg, #FAFAF9 0%, #D6D3D1 100%)', emoji: '🧰' },
    'Grocery & Convenience':    { grad: 'linear-gradient(135deg, #F0FDF4 0%, #BBF7D0 100%)', emoji: '🛒' },
    'Marine / Fishing Supplies': { grad: 'linear-gradient(135deg, #ECFEFF 0%, #67E8F9 100%)', emoji: '⚓' },
};

function getFallback(display) {
    return CATEGORY_FALLBACKS[display] || CATEGORY_FALLBACKS['Professional / Legal / JP'];
}

// Is the listing "new" — created within the last 14 days?
function isNew(createdAt) {
    if (!createdAt) return false;
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days < 14;
}

export default function ListingCard({ vendor }) {
    const [imgError, setImgError] = useState(false);

    const {
        id,
        business_name,
        description,
        is_featured,
        is_top_ad,
        images,
        slug,
        address,
        whatsapp,
        created_at,
    } = vendor || {};

    const cat = getDisplayCategory(vendor);
    const fallback = getFallback(cat.display);
    const vendorUrl = slug ? `/vendor/${slug}` : `/vendor/${id}`;

    const imageUrl = images && images.length > 0 ? getImageUrl(images[0]) : null;
    const showImage = imageUrl && !imgError;
    const showNew = isNew(created_at) && !is_featured && !is_top_ad;
    const displayAddress = address || 'Local Harbour View business — address not listed';

    return (
        <Link href={vendorUrl} className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-2xl">
            <article
                className={`card-premium overflow-hidden h-full flex flex-col ${is_top_ad ? 'ring-2 ring-brand-warm/50 ring-offset-1' : ''}`}
            >
                {/* ── Image / Fallback ── */}
                <div
                    className="relative h-44 flex items-center justify-center overflow-hidden"
                    style={!showImage ? { background: fallback.grad } : undefined}
                >
                    {showImage ? (
                        <img
                            src={imageUrl}
                            alt={business_name || 'Business'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            width="400"
                            height="176"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span
                            className="text-5xl"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}
                            aria-hidden="true"
                        >
                            {fallback.emoji}
                        </span>
                    )}

                    {/* Badges — top left */}
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap max-w-[75%]">
                        {is_top_ad && (
                            <span className="badge-featured" style={{ background: '#F59E0B', color: 'white' }}>
                                ⭐ Top Ad
                            </span>
                        )}
                        {is_featured && !is_top_ad && (
                            <span className="badge-featured">Featured</span>
                        )}
                        {showNew && (
                            <span className="badge-new">New</span>
                        )}
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="p-4 flex flex-col flex-1">
                    {/* Category badge */}
                    <span
                        className="badge-category mb-2 self-start"
                        style={{ background: fallback.grad, color: '#374151' }}
                    >
                        {fallback.emoji} {cat.display}
                    </span>

                    {/* Business name */}
                    <h3 className="text-base font-bold text-text mb-1 group-hover:text-brand transition-colors line-clamp-1 leading-snug">
                        {business_name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-text-soft mb-2 line-clamp-2 leading-relaxed flex-1">
                        {description || `${business_name} is listed as a ${cat.display} business serving the Harbour View community. Contact and listing details are being verified.`}
                    </p>

                    {/* Location */}
                    <p className="text-xs text-text-muted mb-3 flex items-center gap-1 truncate">
                        <span aria-hidden="true">📍</span>
                        <span className="truncate">{displayAddress}</span>
                    </p>

                    {/* ── Action row ── */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                        <span className="text-sm font-bold text-brand group-hover:text-brand-deep transition">
                            View Details →
                        </span>
                        {whatsapp && (
                            <a
                                href={whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-white bg-green-500 px-2.5 py-1.5 rounded-btn hover:bg-green-600 transition"
                                onClick={e => e.stopPropagation()}
                                aria-label={`WhatsApp ${business_name}`}
                            >
                                💬 <span>Chat</span>
                            </a>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}
