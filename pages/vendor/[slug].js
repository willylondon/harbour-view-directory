import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabase';

export async function getServerSideProps(context) {
    const { slug } = context.params;
    
    try {
        // Try to find vendor by slug first
        const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .select('*, reviews(*)')
            .eq('slug', slug)
            .eq('is_approved', true)
            .single();

        if (vendorError) {
            // If not found by slug, try by ID (for backward compatibility)
            const { data: vendorById, error: idError } = await supabase
                .from('vendors')
                .select('*, reviews(*)')
                .eq('id', slug)
                .eq('is_approved', true)
                .single();

            if (idError) {
                throw new Error('Vendor not found');
            }

            // If found by ID but has no slug, redirect to slug URL if possible
            if (vendorById && !vendorById.slug) {
                // Generate slug from business name
                const generatedSlug = vendorById.business_name
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();

                // Update vendor with slug
                await supabase
                    .from('vendors')
                    .update({ slug: generatedSlug })
                    .eq('id', vendorById.id);

                return {
                    redirect: {
                        destination: `/vendor/${generatedSlug}`,
                        permanent: true,
                    },
                };
            }

            return {
                props: {
                    vendor: vendorById,
                    reviews: vendorById.reviews || [],
                    error: null
                }
            };
        }

        return {
            props: {
                vendor,
                reviews: vendor.reviews || [],
                error: null
            }
        };
    } catch (error) {
        console.error('Error fetching vendor data:', error.message);
        
        return {
            notFound: true,
        };
    }
}

export default function VendorDetailSlug({ vendor, reviews: initialReviews, error }) {
    const router = useRouter();
    const [reviews, setReviews] = useState(initialReviews);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [userName, setUserName] = useState('');

    if (router.isFallback) {
        return (
            <div className="min-h-screen bg-bg-primary">
                <Navbar />
                <div className="pt-32 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-bg-primary">
                <Navbar />
                <div className="pt-32 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Vendor not found</h1>
                    <p className="text-gray-600 mt-2">This business listing may have been removed or doesn't exist.</p>
                    <a href="/" className="inline-block mt-6 text-brand-blue font-bold hover:underline">
                        ← Back to directory
                    </a>
                </div>
            </div>
        );
    }

    async function submitReview(e) {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert([{
                    vendor_id: vendor.id,
                    user_name: userName || 'Anonymous',
                    rating,
                    comment
                }])
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                setReviews([data[0], ...reviews]);
            }

            setShowReviewForm(false);
            setComment('');
            setRating(5);
        } catch (error) {
            console.error('Error inserting review:', error.message);
            // Fallback update
            const newReview = {
                id: Math.random().toString(),
                user_name: userName || 'Anonymous',
                rating,
                comment,
                created_at: new Date().toISOString()
            };
            setReviews([newReview, ...reviews]);
            setShowReviewForm(false);
            setComment('');
            setRating(5);
        }
    }

    // Generate JSON-LD structured data
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
            addressCountry: 'JM'
        },
        telephone: vendor.phone,
        url: `https://harbourviewdirectory.online/vendor/${vendor.slug || vendor.id}`,
        image: vendor.images && vendor.images.length > 0 ? vendor.images[0] : '/placeholder.png',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: vendor.rating || 4.0,
            ratingCount: reviews.length,
            bestRating: 5,
            worstRating: 1
        },
        priceRange: '$$',
        areaServed: 'Harbour View, Kingston Jamaica',
        sameAs: vendor.whatsapp ? [vendor.whatsapp] : []
    };

    const pageTitle = `${vendor.business_name} | ${vendor.category} in Harbour View Kingston Jamaica`;
    const pageDescription = vendor.description || `${vendor.business_name} - ${vendor.category} serving the Harbour View community. Contact details, reviews, and location.`;

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="keywords" content={`${vendor.business_name}, ${vendor.category}, Harbour View, Kingston Jamaica, local business`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="business.business" />
                <meta property="og:url" content={`https://harbourviewdirectory.online/vendor/${vendor.slug || vendor.id}`} />
                {vendor.images && vendor.images.length > 0 && vendor.images[0] !== '/placeholder.png' && (
                    <meta property="og:image" content={vendor.images[0]} />
                )}
                <meta property="business:contact_data:street_address" content={vendor.address} />
                <meta property="business:contact_data:locality" content="Harbour View" />
                <meta property="business:contact_data:region" content="Kingston" />
                <meta property="business:contact_data:postal_code" content="JMAAW01" />
                <meta property="business:contact_data:country_name" content="Jamaica" />
                <link rel="canonical" href={`https://harbourviewdirectory.online/vendor/${vendor.slug || vendor.id}`} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </Head>
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="relative h-64 w-full bg-gray-100 flex items-center justify-center">
                            {vendor.images && vendor.images.length > 0 && vendor.images[0] !== '/placeholder.png' ? (
                                <Image 
                                    src={vendor.images[0]} 
                                    alt={vendor.business_name} 
                                    fill 
                                    className="object-cover" 
                                    sizes="(max-width: 768px) 100vw, 768px"
                                />
                            ) : (
                                <div className="text-center">
                                    <div className="text-6xl mb-4">
                                        {vendor.category === 'Food & Dining' && '🍽️'}
                                        {vendor.category === 'Professional Services' && '💼'}
                                        {vendor.category === 'Automotive' && '🚗'}
                                        {vendor.category === 'Beauty & Wellness' && '💅'}
                                        {vendor.category === 'Home Services' && '🏠'}
                                        {vendor.category === 'Retail Shops' && '🛍️'}
                                        {!['Food & Dining', 'Professional Services', 'Automotive', 'Beauty & Wellness', 'Home Services', 'Retail Shops'].includes(vendor.category) && '🏢'}
                                    </div>
                                    <span className="text-gray-400 font-medium">No Image Available</span>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 mb-2">{vendor.business_name}</h1>
                                    <span className="bg-brand-blue text-white text-sm font-bold px-3 py-1 rounded shadow-sm">
                                        {vendor.category}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1 text-brand-yellow mb-1 text-lg">
                                        ★ <span className="text-gray-900 font-bold ml-1">{vendor.rating || 'New'}</span>
                                    </div>
                                    <span className="text-gray-500 text-sm">
                                        {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="prose max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
                                {vendor.description}
                            </div>

                            <div className="bg-bg-card rounded-xl p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                                <div className="space-y-3 text-gray-600">
                                    {vendor.address && (
                                        <div className="flex items-start">
                                            <span className="mr-3">📍</span>
                                            <div>
                                                <strong className="block text-sm font-bold text-gray-700">Address</strong>
                                                <p>{vendor.address}</p>
                                            </div>
                                        </div>
                                    )}
                                    {vendor.phone && (
                                        <div className="flex items-start">
                                            <span className="mr-3">📞</span>
                                            <div>
                                                <strong className="block text-sm font-bold text-gray-700">Phone</strong>
                                                <a href={`tel:${vendor.phone}`} className="hover:text-brand-blue">{vendor.phone}</a>
                                            </div>
                                        </div>
                                    )}
                                    {vendor.whatsapp && (
                                        <div className="mt-4">
                                            <a 
                                                href={vendor.whatsapp} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition shadow-sm"
                                            >
                                                <span>💬</span>
                                                Message on WhatsApp
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Community Reviews</h2>
                            {!showReviewForm && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="bg-brand-yellow text-gray-900 font-bold px-4 py-2 rounded shadow-sm hover:bg-yellow-400 transition"
                                >
                                    Write a Review
                                </button>
                            )}
                        </div>

                        {showReviewForm && (
                            <form onSubmit={submitReview} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Leave your review</h3>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                        placeholder="John Doe"
                                        value={userName} 
                                        onChange={e => setUserName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                        value={rating} 
                                        onChange={e => setRating(Number(e.target.value))}
                                    >
                                        <option value="5">5 - Excellent</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="3">3 - Average</option>
                                        <option value="2">2 - Poor</option>
                                        <option value="1">1 - Terrible</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Comment</label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                        placeholder="Tell us about your experience..."
                                        value={comment} 
                                        onChange={e => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                <div className="flex gap-3">
                                    <button type="submit" className="bg-brand-blue text-white font-bold px-6 py-2 rounded shadow-sm hover:bg-blue-700 transition">
                                        Submit Review
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewForm(false)}
                                        className="text-gray-500 font-bold px-4 py-2 hover:bg-gray-200 rounded transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {reviews.length > 0 ? (
                                reviews.map(review => (
                                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900">{review.user_name}</h4>
                                            <span className="text-brand-yellow font-medium">★ {review.rating}</span>
                                        </div>
                                        <p className="text-gray-600">{review.comment}</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            {new Date(review.created_at).toLocaleDateString('en-JM', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No reviews yet. Be the first to review this business!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Back to directory */}
                    <div className="mt-8 text-center">
                        <a href="/" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:underline">
                            ← Back to Harbour View Directory
                        </a>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-gray-500">© {new Date().getFullYear()} Harbour View Directory</p>
                            <p className="text-gray-400 text-sm mt-1">Supporting local businesses in Harbour View</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="/" className="text-gray-500 hover:text-brand-blue transition">Home</a>
                            <a href="/events" className="text-gray-500 hover:text-brand-blue transition">Events</a>
                            <a href="/pricing" className="text-gray-500 hover:text-brand-blue transition">Pricing</a>
                            <a href="/contact" className="text-gray-500 hover:text-brand-blue transition">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}