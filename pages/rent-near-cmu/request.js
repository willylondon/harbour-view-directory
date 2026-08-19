import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RequestRoomPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        whatsapp: '',
        email: '',
        occupant_type: 'Student',
        cmu_affiliation: true,
        requested_type: 'Room',
        max_budget: '',
        move_in_date: '',
        duration: 'Long Term (6+ months)',
        need_furnished: true,
        need_utilities_included: true,
        need_parking: false,
        notes: '',
        hp_field: ''
    });

    const [status, setStatus] = useState({ loading: false, success: false, error: null });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        try {
            const res = await fetch('/api/rentals/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            setStatus({ loading: false, success: true, error: null });
        } catch (err) {
            console.error('Submission error:', err);
            setStatus({ loading: false, error: err.message, success: false });
        }
    };

    const whatsappDirectMessage = `https://wa.me/18767978034?text=${encodeURIComponent(
        `Hi Harbour View Directory, I am looking for a rental.\nName: ${formData.full_name || 'N/A'}\nType: ${formData.requested_type}\nBudget: JMD $${formData.max_budget || 'N/A'}\nMove-in: ${formData.move_in_date || 'ASAP'}\nAffiliation: ${formData.cmu_affiliation ? 'CMU Student/Staff' : formData.occupant_type}`
    )}`;

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Request a Room or Rental | Harbour View Directory</title>
                <meta name="description" content="Looking for a room, studio, or apartment in Harbour View near CMU? Submit your request and let landlords match your budget and move-in timeline." />
                <link rel="canonical" href="https://harbourviewdirectory.online/rent-near-cmu/request" />
            </Head>
            <Navbar />

            <main className="pt-28 pb-20 px-6">
                <div className="container-premium max-w-3xl">
                    <div className="mb-8">
                        <Link href="/rent-near-cmu" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline mb-4">
                            ← Back to Rooms &amp; Rentals
                        </Link>
                        <span className="inline-block bg-brand-soft text-brand-deep text-xs font-extrabold uppercase px-3 py-1 rounded-full mb-3">
                            Renter &amp; Boarder Waitlist
                        </span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-3">
                            Tell Us What Room You Need
                        </h1>
                        <p className="text-text-soft text-base leading-relaxed">
                            Looking for housing in Harbour View or near Caribbean Maritime University (CMU)? 
                            Submit your budget and requirements. We notify matching landlords and send verified vacancies directly to your WhatsApp.
                        </p>
                    </div>

                    {status.success ? (
                        <div className="card-premium p-10 bg-white text-center space-y-6 shadow-xl border-emerald-200">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
                                ✓
                            </div>
                            <h2 className="text-2xl font-bold text-text">Your Request is Registered!</h2>
                            <p className="text-text-soft max-w-lg mx-auto">
                                Thank you, <strong>{formData.full_name}</strong>. We have added your vacancy request to our East Kingston &amp; Harbour View matching pool.
                            </p>

                            <div className="bg-bg-alt p-6 rounded-2xl border border-border text-left max-w-md mx-auto space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Requested Space:</span>
                                    <span className="font-semibold text-text">{formData.requested_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Target Budget:</span>
                                    <span className="font-semibold text-brand">JMD ${parseFloat(formData.max_budget).toLocaleString()}/mo</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">WhatsApp Contact:</span>
                                    <span className="font-semibold text-text">{formData.whatsapp}</span>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                                <a 
                                    href={whatsappDirectMessage}
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-btn hover:bg-emerald-600 transition inline-flex items-center justify-center gap-2"
                                >
                                    💬 Open in WhatsApp Directly
                                </a>
                                <Link 
                                    href="/rent-near-cmu" 
                                    className="bg-bg-alt text-text font-semibold px-6 py-3 rounded-btn hover:bg-border transition inline-flex items-center justify-center"
                                >
                                    Browse Current Listings
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Honeypot */}
                            <input 
                                type="text" 
                                name="hp_field" 
                                value={formData.hp_field} 
                                onChange={handleChange} 
                                style={{ display: 'none' }} 
                                tabIndex="-1" 
                                autoComplete="off" 
                            />

                            {/* Section 1: Who is looking */}
                            <section className="card-premium p-8 bg-white space-y-6">
                                <h3 className="text-lg font-bold text-text border-b border-border pb-2 flex items-center gap-2">
                                    <span>👤</span> Your Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-text mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            required
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            placeholder="e.g. Johnathan Campbell"
                                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text mb-1">WhatsApp Number *</label>
                                        <input
                                            type="tel"
                                            name="whatsapp"
                                            required
                                            value={formData.whatsapp}
                                            onChange={handleChange}
                                            placeholder="876 XXX XXXX"
                                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                        />
                                        <p className="mt-1 text-xs text-text-muted">We will send matching vacancy alerts here.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="johnathan@gmail.com"
                                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text mb-1">Who is this rental for? *</label>
                                        <select
                                            name="occupant_type"
                                            value={formData.occupant_type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                        >
                                            <option value="Student">Student (Single)</option>
                                            <option value="Worker">Port / Maritime / Professional Worker</option>
                                            <option value="Couple">Couple</option>
                                            <option value="Family">Family</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-3 font-semibold text-text cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="cmu_affiliation"
                                                checked={formData.cmu_affiliation}
                                                onChange={handleChange}
                                                className="w-5 h-5 accent-brand rounded"
                                            />
                                            <span>Attending or Working at CMU (Caribbean Maritime University)</span>
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Requirements */}
                            <section className="card-premium p-8 bg-white space-y-6">
                                <h3 className="text-lg font-bold text-text border-b border-border pb-2 flex items-center gap-2">
                                    <span>🏠</span> Room &amp; Budget Requirements
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-text mb-1">Type of Accommodation *</label>
                                        <select
                                            name="requested_type"
                                            value={formData.requested_type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                        >
                                            <option value="Room">Single Private Room</option>
                                            <option value="Studio">Self-Contained Studio</option>
                                            <option value="Shared">Shared Room / Boarding</option>
                                            <option value="Apartment">1-2 Bed Apartment</option>
                                            <option value="House">Whole House</option>
                                            <option value="Any">Any Suitable Option</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text mb-1">Max Monthly Budget (JMD) *</label>
                                        <input
                                            type="number"
                                            name="max_budget"
                                            required
                                            value={formData.max_budget}
                                            onChange={handleChange}
                                            placeholder="e.g. 40000"
                                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text mb-1">Target Move-in Date</label>
                                        <input
                                            type="date"
                                            name="move_in_date"
                                            value={formData.move_in_date}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text mb-1">Expected Stay Duration</label>
                                        <select
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                        >
                                            <option value="Academic Year (9-12 months)">Academic Year (9-12 months)</option>
                                            <option value="Semester (4-5 months)">Semester (4-5 months)</option>
                                            <option value="Long Term (1+ year)">Long Term (1+ year)</option>
                                            <option value="Short Term (< 3 months)">Short Term (Under 3 months)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="block text-sm font-bold text-text">Essential Preferences</label>
                                    <div className="flex flex-wrap gap-5">
                                        <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="need_furnished"
                                                checked={formData.need_furnished}
                                                onChange={handleChange}
                                                className="w-4 h-4 accent-brand rounded"
                                            />
                                            Must be Furnished
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="need_utilities_included"
                                                checked={formData.need_utilities_included}
                                                onChange={handleChange}
                                                className="w-4 h-4 accent-brand rounded"
                                            />
                                            Utilities Included (Light/Water)
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-medium text-text cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="need_parking"
                                                checked={formData.need_parking}
                                                onChange={handleChange}
                                                className="w-4 h-4 accent-brand rounded"
                                            />
                                            Vehicle Parking Needed
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-text mb-1">Additional Notes / Preferences</label>
                                    <textarea
                                        name="notes"
                                        rows="3"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="e.g. Quiet environment preferred, walking distance to roundabout/CMU gate, looking for female-only flatmates..."
                                        className="w-full px-4 py-3 border border-border rounded-btn focus:ring-2 focus:ring-brand outline-none transition text-text"
                                    ></textarea>
                                </div>
                            </section>

                            {status.error && (
                                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-btn text-sm">
                                    ⚠️ {status.error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={status.loading}
                                    className="w-full bg-brand text-white font-extrabold py-4 rounded-btn hover:bg-brand-deep transition shadow-xl disabled:opacity-50 text-lg flex items-center justify-center gap-2"
                                >
                                    {status.loading ? 'Submitting Request...' : '🔔 Submit Room Request & Get Alerts'}
                                </button>
                                
                                <p className="text-center text-xs text-text-muted">
                                    🔒 Your contact details are kept strictly private and only used to connect you with verified vacancies matching your criteria.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
