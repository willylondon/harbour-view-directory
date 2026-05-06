import { useState } from 'react';
import Link from 'next/link';
import { getImageUrl, RENTAL_IMAGES_BUCKET } from '../lib/supabase';

export default function RentalCard({ rental }) {
    const [imgError, setImgError] = useState(false);

    const {
        id,
        title,
        type,
        price,
        location,
        furnished,
        utilities_included,
        distance_to_cmu,
        photos,
        slug
    } = rental || {};

    const rentalUrl = `/rent-near-cmu/${slug || id}`;
    const imageUrl = photos && photos.length > 0 ? getImageUrl(photos[0], RENTAL_IMAGES_BUCKET) : null;
    const showImage = imageUrl && !imgError;

    return (
        <Link href={rentalUrl} className="block group">
            <article className="card-premium overflow-hidden h-full flex flex-col">
                {/* Image / Placeholder */}
                <div className={`relative h-48 ${showImage ? '' : 'bg-brand-soft'} flex items-center justify-center border-b border-border`}>
                    {showImage ? (
                        <img
                            src={imageUrl}
                            alt={title || 'Rental'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="text-6xl opacity-60">🏠</span>
                    )}
                    
                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-white text-text font-bold px-3 py-1.5 rounded-btn shadow-sm text-sm">
                            JMD ${price?.toLocaleString()}
                        </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3">
                        <span className="bg-brand-deep text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {type}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold text-text mb-1 group-hover:text-brand transition-colors line-clamp-1">
                        {title}
                    </h3>

                    <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                        📍 {location}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {furnished && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-success-soft text-success px-2 py-0.5 rounded-full">
                                Furnished
                            </span>
                        )}
                        {utilities_included && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-brand-soft text-brand-deep px-2 py-0.5 rounded-full">
                                Utilities Incl.
                            </span>
                        )}
                        {distance_to_cmu && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                                🎓 {distance_to_cmu}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm font-semibold text-brand group-hover:text-brand-deep transition">
                            View Details →
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
