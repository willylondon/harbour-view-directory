import Link from 'next/link';

export default function EventCard({ event, showVendor = false }) {
    if (!event) return null;

    const eventDate = event.event_date ? new Date(event.event_date) : null;
    const formattedDate = eventDate
        ? eventDate.toLocaleString('en-JM', {
            dateStyle: 'medium',
            timeStyle: 'short',
            hour12: true
        })
        : '';

    const badgeClasses = {
        basic: 'bg-gray-100 text-gray-700',
        premium: 'bg-brand-blue text-white',
        featured: 'bg-brand-yellow text-gray-900'
    };

    const tierClass = badgeClasses[event.paid_tier] || badgeClasses.basic;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="relative h-44 w-full bg-gray-100">
                {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
                <div className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${tierClass}`}>
                    {event.paid_tier?.toUpperCase() || 'BASIC'}
                </div>
            </div>
            <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    {event.category && (
                        <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-2 py-1 rounded-full">
                            {event.category}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                <div className="text-sm text-gray-500 flex flex-col gap-1">
                    <span>{formattedDate}</span>
                    {event.location && <span>{event.location}</span>}
                </div>
                {showVendor && event.vendors?.business_name && (
                    <div className="text-xs text-gray-500">
                        Hosted by{' '}
                        <Link href={`/vendor/${event.vendor_id}`} className="text-brand-blue font-semibold hover:underline">
                            {event.vendors.business_name}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
