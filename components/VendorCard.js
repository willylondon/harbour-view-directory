import { useState } from 'react';
import Link from 'next/link';
import { getImageUrl } from '../lib/supabase';
import { getNormalizedCategory } from '../lib/categoryMap';

export default function ListingCard({ vendor }) {
    const [imgError, setImgError] = useState(false);

    const {
        id,
        business_name,
        category,
        description,
        is_featured,
        is_top_ad,
        images,
        rating = 0,
        reviewCount = 0,
        slug,
        address,
        whatsapp
    } = vendor || {};

    const cat = getNormalizedCategory(vendor);
    const displayCategory = cat.display;
    const vendorUrl = slug ? `/vendor/${slug}` : `/vendor/${id}`;

    const imageUrl = images && images.length > 0 ? getImageUrl(images[0]) : null;
    const showImage = imageUrl && !imgError;

    return (
        <Link href={vendorUrl} className="block group">
            <article className={`card-premium overflow-hidden ${is_top_ad ? 'ring-2 ring-brand-warm/60 ring-offset-2 ring-offset-bg' : ''}`}>
                {/* Image / Placeholder */}
                <div className={`relative h-48 ${showImage ? '' : cat.bg} flex items-center justify-center border-b ${cat.border}`}>
                    {showImage ? (
                        <img
                            src={imageUrl}
                            alt={business_name || 'Business'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="text-6xl opacity-60">{cat.emoji}</span>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {is_top_ad && (
                            <span className="bg-brand-warm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                ⭐ Top Ad
                            </span>
                        )}
                        {is_featured && !is_top_ad && (
                            <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                Featured
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.bg} text-text-soft`}>
                            {displayCategory}
                        </span>
                        {rating > 0 && (
                            <span className="text-xs text-text-muted flex items-center gap-1 ml-auto">
                                ⭐ {rating.toFixed(1)} <span className="opacity-60">({reviewCount})</span>
                            </span>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-text mb-1.5 group-hover:text-brand transition-colors line-clamp-1">
                        {business_name}
                    </h3>

                    {description && (
                        <p className="text-sm text-text-soft mb-3 line-clamp-2 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {address && (
                        <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                            📍 {address}
                        </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <span className="text-sm font-semibold text-brand group-hover:text-brand-deep transition">
                            View Details →
                        </span>
                        {whatsapp && (
                            <a
                                href={whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-success bg-success-soft px-3 py-1.5 rounded-btn hover:bg-success/10 transition"
                                onClick={e => e.stopPropagation()}
                            >
                                💬 WhatsApp
                            </a>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}
