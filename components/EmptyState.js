import Link from 'next/link';

export default function EmptyState({
    icon = '📭',
    title = 'Nothing here yet',
    description = 'Check back soon — we\'re adding new listings every day.',
    ctaText = 'List Your Business',
    ctaHref = '/post-ad',
    secondaryCtaText = '',
    secondaryCtaHref = ''
}) {
    return (
        <div className="card-premium p-12 text-center max-w-md mx-auto">
            <div className="text-5xl mb-5">{icon}</div>
            <h3 className="text-xl font-bold text-text mb-2">{title}</h3>
            <p className="text-text-soft mb-6 leading-relaxed">{description}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    href={ctaHref}
                    className="inline-flex items-center justify-center bg-brand text-white font-semibold px-6 py-3 rounded-btn hover:bg-brand-deep transition"
                >
                    {ctaText}
                </Link>
                {secondaryCtaText && secondaryCtaHref && (
                    <Link
                        href={secondaryCtaHref}
                        className="inline-flex items-center justify-center border-2 border-brand text-brand font-semibold px-6 py-3 rounded-btn hover:bg-brand-soft transition"
                    >
                        {secondaryCtaText}
                    </Link>
                )}
            </div>
        </div>
    );
}
