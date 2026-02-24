import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabase';

export default function VendorDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [vendor, setVendor] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (id) {
            fetchVendor();
            fetchReviews();
        }
    }, [id]);

    async function fetchVendor() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) setVendor(data);
        } catch (error) {
            console.error('Error fetching vendor:', error.message);
            // Fallback
            setVendor({
                id,
                business_name: 'Willy London Graphics',
                category: 'Professional Services',
                description: 'Local graphic design and printing services for Harbour View residents. Quality prints at affordable prices. We do flyers, banners, and more!',
                address: 'Shop 4, Harbour View Shopping Centre',
                phone: '876-555-0100',
                whatsapp: 'https://wa.me/18765550100',
                images: ['/placeholder.png'],
                rating: 4.8,
                reviewCount: 2
            });
        } finally {
            setLoading(false);
        }
    }

    async function fetchReviews() {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('vendor_id', id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error.message);
            setReviews([
                { id: '1', user_name: 'John Doe', rating: 5, comment: 'Great service! Highly recommended.', created_at: new Date().toISOString() },
                { id: '2', user_name: 'Jane Smith', rating: 4, comment: 'Good prints, but a bit slow today.', created_at: new Date(Date.now() - 86400000).toISOString() }
            ]);
        }
    }

    async function submitReview(e) {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('reviews')
                .insert([{
                    vendor_id: id,
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

    if (loading || !vendor) {
        return (
            <div className="min-h-screen bg-bg-primary">
                <Navbar />
                <div className="pt-32 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>{vendor.business_name} | Harbour View Directory</title>
            </Head>
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="relative h-64 w-full bg-gray-100 flex items-center justify-center">
                            {vendor.images && vendor.images.length > 0 && vendor.images[0] !== '/placeholder.png' ? (
                                <Image src={vendor.images[0]} alt={vendor.business_name} fill sizes="(max-width: 1024px) 100vw, 896px" className="object-cover" />
                            ) : (
                                <span className="text-gray-400 font-medium h-full flex items-center">No Image Available</span>
                            )}
                        </div>

                        <div className="p-8">
                            {vendor.images && vendor.images.length > 1 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                    {vendor.images.slice(1).map((imageUrl) => (
                                        <div key={imageUrl} className="relative h-24 w-full rounded-lg overflow-hidden border border-gray-200">
                                            <Image src={imageUrl} alt={vendor.business_name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}

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
                                    {vendor.address && <p><strong>Address:</strong> {vendor.address}</p>}
                                    {vendor.phone && <p><strong>Phone:</strong> {vendor.phone}</p>}
                                    {vendor.whatsapp && (
                                        <a
                                            href={vendor.whatsapp.includes('http') ? vendor.whatsapp : `https://wa.me/${vendor.whatsapp.replace(/\\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-2 bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition shadow-sm"
                                        >
                                            Message on WhatsApp
                                        </a>
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
                                        value={userName} onChange={e => setUserName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                        value={rating} onChange={e => setRating(Number(e.target.value))}
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
                                        value={comment} onChange={e => setComment(e.target.value)}
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
                                        <p className="text-gray-600 mb-1">{review.comment}</p>
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                                    <p>No reviews yet. Be the first to leave a review!</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export async function getServerSideProps() {
    return {
        props: {}
    };
}
