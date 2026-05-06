import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RentalSubmitPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.target);
        
        try {
            const res = await fetch('/api/rentals/submit', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit listing');
            }

            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Redirect after a short delay
            setTimeout(() => {
                router.push('/rent-near-cmu?success=1');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-bg">
                <Navbar />
                <main className="pt-32 pb-16 px-6">
                    <div className="container-premium max-w-lg text-center">
                        <div className="card-premium p-12">
                            <div className="text-6xl mb-6">🎉</div>
                            <h1 className="text-3xl font-extrabold text-text mb-4">Submission Received!</h1>
                            <p className="text-text-soft mb-8 leading-relaxed">
                                Thank you for listing your property. Our team will review your submission and notify you via WhatsApp once it is approved and live.
                            </p>
                            <div className="animate-pulse text-brand font-bold">Redirecting you to listings...</div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>List Your Rental | Harbour View Directory</title>
                <meta name="description" content="List your student housing, room, or apartment for rent near Caribbean Maritime University (CMU)." />
            </Head>
            <Navbar />

            <main className="pt-28 pb-16 px-6">
                <div className="container-premium max-w-3xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-text mb-2">List Your Rental</h1>
                        <p className="text-text-soft">Fill out the form below to promote your room or apartment near CMU.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-btn mb-8 text-sm font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <section className="card-premium p-8 bg-white space-y-6">
                            <h3 className="text-lg font-bold text-text border-b border-border pb-2">Basic Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-text mb-1">Listing Title *</label>
                                    <input name="title" type="text" required placeholder="e.g. Spacious Studio near CMU Main Gate"
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">Property Type *</label>
                                    <select name="type" required className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text">
                                        <option value="Room">Room</option>
                                        <option value="Studio">Studio</option>
                                        <option value="Apartment">Apartment</option>
                                        <option value="Shared">Shared Room</option>
                                        <option value="House">Whole House</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">Monthly Price (JMD) *</label>
                                    <input name="price" type="number" required placeholder="45000"
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">Security Deposit (JMD)</label>
                                    <input name="deposit" type="number" placeholder="45000"
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">Available From</label>
                                    <input name="available_date" type="date"
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-1">Description *</label>
                                <textarea name="description" rows="4" required placeholder="Tell students about the space, proximity to campus, etc."
                                    className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-1">Address/Location *</label>
                                <input name="location" type="text" required placeholder="e.g. 15 Neptune Avenue, Harbour View"
                                    className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                            </div>
                        </section>

                        {/* Student Details */}
                        <section className="card-premium p-8 bg-white space-y-6">
                            <h3 className="text-lg font-bold text-text border-b border-border pb-2">Student &amp; Location Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">Distance to CMU (Text)</label>
                                    <input name="distance_to_cmu" type="text" placeholder="e.g. 5 min walk"
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">Proximity Sort</label>
                                    <select name="distance_sort" className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text">
                                        <option value="1">1 - Extremely Close (Next to Gate)</option>
                                        <option value="2">2 - Walking distance (&lt; 10 min)</option>
                                        <option value="3" selected>3 - Walking distance (10-20 min)</option>
                                        <option value="4">4 - Short commute (Bus/Taxi)</option>
                                        <option value="5">5 - Further away</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6">
                                <label className="flex items-center gap-2 font-bold text-text cursor-pointer">
                                    <input name="furnished" type="checkbox" value="true" className="w-5 h-5 accent-brand" />
                                    Is Furnished?
                                </label>
                                <label className="flex items-center gap-2 font-bold text-text cursor-pointer">
                                    <input name="utilities_included" type="checkbox" value="true" className="w-5 h-5 accent-brand" />
                                    Utilities Included?
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-text mb-1">House Rules</label>
                                <textarea name="house_rules" rows="3" placeholder="e.g. No smoking, No overnight guests, etc."
                                    className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"></textarea>
                            </div>
                        </section>

                        {/* Photos */}
                        <section className="card-premium p-8 bg-white space-y-6">
                            <h3 className="text-lg font-bold text-text border-b border-border pb-2">Photos</h3>
                            <div>
                                <label className="block text-sm font-bold text-text mb-1">Upload Photos (Max 5, 5MB each)</label>
                                <input name="photos" type="file" multiple accept="image/*"
                                    className="w-full px-4 py-3 border border-border rounded-btn outline-none transition text-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-soft file:text-brand-deep hover:file:bg-brand/20" />
                                <p className="mt-2 text-xs text-text-muted">High-quality photos increase your chances of finding a tenant quickly.</p>
                            </div>
                        </section>

                        {/* Contact (Internal) */}
                        <section className="card-premium p-8 bg-white space-y-6">
                            <h3 className="text-lg font-bold text-text border-b border-border pb-2">Contact Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">Public Contact Name *</label>
                                    <input name="contact_name" type="text" required placeholder="e.g. Ms. Brown"
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">WhatsApp Number *</label>
                                    <input name="whatsapp" type="text" required placeholder="876 XXX XXXX"
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-text mb-1">Landlord Full Name (Private - for admin only) *</label>
                                    <input name="landlord_name" type="text" required placeholder="Full legal name"
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text" />
                                </div>
                            </div>
                        </section>

                        {/* Honeypot */}
                        <input type="text" name="hp_field" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" />

                        <div className="pt-4">
                            <button type="submit" disabled={loading}
                                className="w-full bg-brand text-white font-black py-4 rounded-btn hover:bg-brand-deep transition shadow-xl disabled:opacity-50 text-xl">
                                {loading ? 'Submitting...' : 'Submit Listing for Review'}
                            </button>
                            <p className="mt-4 text-center text-xs text-text-muted">
                                By submitting, you agree to our terms and verify that all information provided is accurate.
                            </p>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}
