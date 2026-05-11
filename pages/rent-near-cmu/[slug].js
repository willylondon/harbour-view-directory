import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase, getImageUrl, RENTAL_IMAGES_BUCKET } from '../../lib/supabase';
import { applyPublicRentalFilters } from '../../lib/publicDirectory';
import { getBrandedPlaceholder, getCategoryFallbackImage } from '../../lib/categoryFallbackImages';

const PUBLIC_RENTAL_DETAIL_COLUMNS = 'id, title, description, contact_name, whatsapp, type, price, deposit, location, available_date, utilities_included, furnished, distance_to_cmu, photos, house_rules, slug, created_at';

export async function getServerSideProps(context) {
    const { slug } = context.params;
    
    try {
        const { data: rental, error } = await applyPublicRentalFilters(
            supabase
                .from('rentals')
                .select(PUBLIC_RENTAL_DETAIL_COLUMNS)
        )
            .eq('slug', slug)
            .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
            .single();

        if (error || !rental) {
            return { notFound: true };
        }

        return { props: { rental } };
    } catch (err) {
        console.error('Rental Detail SSR error:', err.message);
        return { notFound: true };
    }
}

export default function RentalDetailPage({ rental }) {
    const router = useRouter();
    const [mainImageIndex, setMainImageIndex] = useState(0);

    if (!rental) return null;

    const {
        title,
        description,
        contact_name,
        whatsapp,
        type,
        price,
        deposit,
        location,
        available_date,
        utilities_included,
        furnished,
        distance_to_cmu,
        photos,
        house_rules
    } = rental;

    const pageTitle = `${title} | Rent Near CMU`;
    const pageDescription = description || `View details for this ${type} near Caribbean Maritime University. Price: JMD $${price.toLocaleString()}.`;
    const fallbackImage = getCategoryFallbackImage('Rooms & Rentals', rental);
    const placeholder = getBrandedPlaceholder();
    const mainUploadedImage = photos && photos.length > 0 ? getImageUrl(photos[mainImageIndex], RENTAL_IMAGES_BUCKET) : null;

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`https://harbourviewdirectory.online/rent-near-cmu/${rental.slug}`} />
            </Head>
            <Navbar />

            <main className="pt-28 pb-16">
                <div className="container-premium max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Column: Gallery & Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Gallery */}
                            <div className="card-premium overflow-hidden bg-white">
                                <div
                                    className="relative h-[400px] flex items-center justify-center overflow-hidden"
                                    style={!mainUploadedImage && !fallbackImage.src ? { background: placeholder.gradient } : undefined}
                                >
                                    {mainUploadedImage ? (
                                        <img 
                                            src={mainUploadedImage}
                                            alt={title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : fallbackImage.src ? (
                                        <img
                                            src={fallbackImage.src}
                                            alt={fallbackImage.alt}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-white">
                                            <div className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-amber-200">Harbour View</div>
                                            <span className="text-sm font-bold">Rooms & Rentals</span>
                                        </div>
                                    )}
                                    {(mainUploadedImage || fallbackImage.src) && <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-brand-deep text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                            {type}
                                        </span>
                                    </div>
                                </div>
                                {photos && photos.length > 1 && (
                                    <div className="p-4 flex gap-3 overflow-x-auto">
                                        {photos.map((photo, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => setMainImageIndex(idx)}
                                                className={`relative w-20 h-20 flex-shrink-0 rounded-btn overflow-hidden border-2 transition ${mainImageIndex === idx ? 'border-brand' : 'border-transparent'}`}
                                            >
                                                <img src={getImageUrl(photo, RENTAL_IMAGES_BUCKET)} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="card-premium p-8 bg-white">
                                <h1 className="text-3xl font-extrabold text-text mb-4">{title}</h1>
                                <p className="text-sm text-text-muted flex items-center gap-1 mb-6">
                                    📍 {location}
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-bg-alt p-4 rounded-btn border border-border">
                                        <span className="block text-[10px] font-bold text-text-muted uppercase">Monthly Rent</span>
                                        <span className="text-lg font-bold text-text">JMD ${price.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-bg-alt p-4 rounded-btn border border-border">
                                        <span className="block text-[10px] font-bold text-text-muted uppercase">Security Deposit</span>
                                        <span className="text-lg font-bold text-text">JMD ${deposit?.toLocaleString() || 'None'}</span>
                                    </div>
                                    <div className="bg-bg-alt p-4 rounded-btn border border-border">
                                        <span className="block text-[10px] font-bold text-text-muted uppercase">Furnished</span>
                                        <span className="text-lg font-bold text-text">{furnished ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="bg-bg-alt p-4 rounded-btn border border-border">
                                        <span className="block text-[10px] font-bold text-text-muted uppercase">Utilities</span>
                                        <span className="text-lg font-bold text-text">{utilities_included ? 'Incl.' : 'Extra'}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-text mb-2">Description</h3>
                                        <p className="text-text-soft leading-relaxed whitespace-pre-wrap">{description}</p>
                                    </div>

                                    {house_rules && (
                                        <div>
                                            <h3 className="text-lg font-bold text-text mb-2">House Rules</h3>
                                            <p className="text-text-soft leading-relaxed whitespace-pre-wrap">{house_rules}</p>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-border flex flex-wrap gap-4">
                                        {distance_to_cmu && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-xl">🎓</span>
                                                <span className="font-semibold text-text">Distance to CMU:</span>
                                                <span className="text-text-soft">{distance_to_cmu}</span>
                                            </div>
                                        )}
                                        {available_date && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-xl">📅</span>
                                                <span className="font-semibold text-text">Available From:</span>
                                                <span className="text-text-soft">{new Date(available_date).toLocaleDateString('en-JM', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: CTA & Landlord */}
                        <div className="space-y-6">
                            <div className="card-premium p-6 bg-white sticky top-[100px]">
                                <h3 className="text-xl font-bold text-text mb-4">Interested?</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-bg-alt rounded-btn border border-border">
                                        <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand-deep font-bold">
                                            {contact_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold text-text-muted uppercase">Contact Person</span>
                                            <span className="font-bold text-text">{contact_name}</span>
                                        </div>
                                    </div>

                                    <a 
                                        href={`https://wa.me/${whatsapp.replace(/\+/g, '')}?text=Hi, I am interested in your rental listing: ${title}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-success text-white font-bold py-4 rounded-btn hover:bg-emerald-600 transition shadow-md"
                                    >
                                        <span>💬</span> Message on WhatsApp
                                    </a>

                                    <p className="text-[10px] text-center text-text-muted">Mention you found it on Harbour View Directory</p>
                                </div>
                            </div>

                            <div className="p-4 text-center">
                                <a href="/rent-near-cmu" className="text-brand font-bold hover:underline text-sm flex items-center justify-center gap-1">
                                    ← Back to all rentals
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
