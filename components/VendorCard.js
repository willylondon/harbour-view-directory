import Image from 'next/image';
import Link from 'next/link';

export default function VendorCard({ vendor }) {
    const {
        id,
        business_name,
        category,
        description,
        is_featured,
        is_top_ad,
        images,
        rating = 0,
        reviewCount = 0
    } = vendor || {};

    const imageUrl = images && images.length > 0 ? images[0] : '/placeholder.png';

    return (
        <Link href={`/vendor/${id}`} className="block group">
            <div
                className={`bg-bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border 
          ${is_top_ad ? 'border-brand-yellow ring-2 ring-brand-yellow/50' : 'border-gray-200 group-hover:border-brand-blue/30'}
        `}
            >
                <div className="flex flex-col sm:flex-row p-4 gap-4 items-start sm:items-center">
                    <div className="relative w-full sm:w-28 h-48 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-white flex items-center justify-center border border-gray-100">
                        {imageUrl === '/placeholder.png' ? (
                            <span className="text-gray-400 font-medium text-sm">No Image</span>
                        ) : (
                            <Image
                                src={imageUrl}
                                alt={business_name}
                                fill
                                sizes="(max-width: 640px) 100vw, 112px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        )}
                        {is_top_ad && (
                            <div className="absolute top-2 left-2 sm:hidden bg-brand-yellow text-gray-900 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                TOP AD
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-brand-blue transition-colors">
                                {business_name}
                            </h3>
                            <div className="hidden sm:flex gap-2 shrink-0 ml-2">
                                {is_top_ad && (
                                    <span className="bg-brand-yellow text-gray-900 text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                                        TOP AD
                                    </span>
                                )}
                                {is_featured && !is_top_ad && (
                                    <span className="bg-brand-blue text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm">
                                        FEATURED
                                    </span>
                                )}
                            </div>
                        </div>

                        <p className="text-sm font-semibold text-brand-blue mb-2">{category}</p>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                            {description}
                        </p>

                        <div className="flex items-center gap-1 text-sm bg-white w-max px-2 py-1 rounded-md border border-gray-200">
                            <div className="flex text-brand-yellow">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-4 w-4 ${i < rating ? 'fill-current text-brand-yellow' : 'text-gray-200'}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span className="text-gray-600 font-medium ml-1.5 text-xs">
                                {rating > 0 ? rating.toFixed(1) : 'New'} <span className="text-gray-400 font-normal">({reviewCount} reviews)</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
