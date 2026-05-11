import { useState } from 'react';
import Link from 'next/link';
import { getDisplayCategory } from '../lib/categoryMap';
import { getBrandedPlaceholder, getVendorImage } from '../lib/categoryFallbackImages';
import { getWhatsAppHref } from '../lib/contactLinks';
import { getVendorDisplayAddress, getVendorDisplayDescription } from '../lib/listingCopy';
import { getTrustBadgeClass, getTrustStateDescription, getTrustStatus } from '../lib/trustState';

// Is the listing "new" — created within the last 14 days?
function isNew(createdAt) {
    if (!createdAt) return false;
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days < 14;
}

export default function ListingCard({ vendor, imageResolver, resolvedImage }) {
    const [imgError, setImgError] = useState(false);

    const {
        id,
        business_name,
        is_featured,
        is_top_ad,
        slug,
        phone,
        whatsapp,
        created_at,
    } = vendor || {};

    const cat = getDisplayCategory(vendor);
    const vendorUrl = slug ? `/vendor/${slug}` : `/vendor/${id}`;
    const vendorImage = resolvedImage || (imageResolver ? imageResolver(vendor) : getVendorImage(vendor));
    const placeholder = getBrandedPlaceholder();
    const trustStatus = getTrustStatus(vendor);
    const trustState = trustStatus.primary;
    const trustDescription = getTrustStateDescription(trustState);

    const showImage = vendorImage.src && !imgError;
    const showNew = isNew(created_at) && !is_featured && !is_top_ad;
    const displayAddress = getVendorDisplayAddress(vendor);
    const displayDescription = getVendorDisplayDescription(vendor);
    const whatsappHref = getWhatsAppHref(whatsapp);

    return (
        <Link href={vendorUrl} className="block min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded-2xl">
            <article
                className={`h-full min-w-0 overflow-hidden rounded-[1.4rem] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_30px_90px_rgba(15,23,42,0.16)] ${is_top_ad ? 'ring-2 ring-amber-300/70 ring-offset-1' : ''}`}
            >
                {/* ── Image / Fallback ── */}
                <div
                    className="relative h-48 flex items-center justify-center overflow-hidden"
                    style={!showImage ? { background: placeholder.gradient } : undefined}
                >
                    {showImage ? (
                        <img
                            src={vendorImage.src}
                            alt={vendorImage.alt || business_name || 'Business'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            width="400"
                            height="192"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="px-5 text-center text-white">
                            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-200">Harbour View</span>
                            <p className="mt-2 text-lg font-black leading-tight">{cat.display}</p>
                        </div>
                    )}
                    {showImage && (
                        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/8 to-transparent" />
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
                        className="mb-2 self-start rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-600"
                    >
                        {cat.emoji} {cat.display}
                    </span>
                    <span
                        className={`mb-2 self-start rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${getTrustBadgeClass(trustState.tone)}`}
                        title={trustDescription}
                        aria-label={`${trustState.label}: ${trustDescription}`}
                    >
                        {trustState.label}
                    </span>

                    {/* Business name */}
                    <h3 className="text-base font-bold text-text mb-1 group-hover:text-brand transition-colors line-clamp-2 leading-snug break-words">
                        {business_name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-text-soft mb-2 line-clamp-2 leading-relaxed flex-1 break-words">
                        {displayDescription}
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
                        {whatsappHref && (
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-white bg-green-500 px-2.5 py-1.5 rounded-btn hover:bg-green-600 transition"
                                onClick={e => e.stopPropagation()}
                                aria-label={`WhatsApp ${business_name}`}
                            >
                                💬 <span>Chat</span>
                            </a>
                        )}
                        {trustStatus.showContactNotice && (
                            <span className="ml-auto text-xs font-semibold text-amber-600">
                                Contact not verified yet
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}
