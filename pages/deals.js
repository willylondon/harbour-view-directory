import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DEAL_CATEGORIES = [
    { emoji: '🍽️', label: 'Food & Drink Deals', desc: 'Lunch specials, discounts on meals, snacks, and drinks from local eateries.' },
    { emoji: '💆', label: 'Beauty Deals', desc: 'Discounted braids, haircuts, nail sets, and salon packages near Harbour View.' },
    { emoji: '📱', label: 'Phone & Tech Deals', desc: 'Cell phone repair specials, device discounts, and tech offers.' },
    { emoji: '🏠', label: 'Home Services Deals', desc: 'Discounted plumbing, electrical, carpentry, painting, and handyman services.' },
    { emoji: '🎓', label: 'Student Deals Near CMU', desc: 'Special pricing for Caribbean Maritime University students on food, transport, and services.' },
];

export default function DealsPage() {
    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Local Deals in Harbour View | Harbour View Directory</title>
                <meta name="description" content="Find local deals, discounts, promotions, and special offers from businesses in Harbour View, Kingston Jamaica. Food, beauty, tech, home services, and student deals near CMU." />
                <meta property="og:title" content="Local Deals in Harbour View | Harbour View Directory" />
                <meta property="og:description" content="Deals, discounts, and specials from local Harbour View businesses. Updated regularly." />
                <link rel="canonical" href="https://harbourviewdirectory.online/deals" />
            </Head>
            <Navbar />

            <main>
                {/* Hero */}
                <section className="bg-gradient-to-br from-brand-warm to-amber-500 pt-28 pb-16 px-6 text-center text-white">
                    <div className="container-premium max-w-2xl">
                        <span className="inline-block bg-white/20 backdrop-blur-sm text-sm font-medium px-4 py-1.5 rounded-full mb-5">🏷️ Local Deals & Offers</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Harbour View Deals</h1>
                        <p className="text-lg text-white/85 mb-8">
                            Local promotions, discounts, and specials from businesses serving Harbour View, Bull Bay, and the CMU area. Updated regularly — check back often.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a href="mailto:info@harbourviewdirectory.online?subject=Submit a Deal" className="bg-white text-brand-warm font-bold px-8 py-3.5 rounded-btn hover:bg-gray-50 transition shadow-lg">
                                Submit a Deal
                            </a>
                            <Link href="/post-ad" className="bg-transparent border-2 border-white/40 text-white font-bold px-8 py-3.5 rounded-btn hover:bg-white/10 transition">
                                List Your Business
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Deal Categories */}
                <section className="section-spacing px-6">
                    <div className="container-premium">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-extrabold text-text mb-2">Deal Categories</h2>
                            <p className="text-text-soft">Browse deals by type once listings are approved.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {DEAL_CATEGORIES.map(cat => (
                                <div key={cat.label} className="card-premium p-6 flex gap-4 items-start">
                                    <span className="text-4xl shrink-0">{cat.emoji}</span>
                                    <div>
                                        <h3 className="font-bold text-text mb-1">{cat.label}</h3>
                                        <p className="text-sm text-text-soft leading-relaxed">{cat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Empty state */}
                <section className="section-spacing bg-surface border-y border-border px-6">
                    <div className="container-premium max-w-2xl text-center">
                        <div className="text-6xl mb-5">🏷️</div>
                        <h2 className="text-2xl font-extrabold text-text mb-3">No Deals Posted Yet</h2>
                        <p className="text-text-soft mb-8 leading-relaxed">
                            This section is live and ready. Local businesses are invited to submit their deals, discounts, and limited-time offers.
                            All deals are reviewed before appearing here to ensure they're genuine and current.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="mailto:info@harbourviewdirectory.online?subject=Submit a Deal"
                                className="bg-brand-warm text-white font-bold px-8 py-3.5 rounded-btn hover:bg-amber-500 transition shadow-sm"
                            >
                                📧 Submit Your Deal
                            </a>
                            <a
                                href={`https://wa.me/18767978034?text=Hi!+I+would+like+to+submit+a+deal+for+my+business+on+Harbour+View+Directory.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-success text-white font-bold px-8 py-3.5 rounded-btn hover:bg-green-600 transition shadow-sm"
                            >
                                💬 WhatsApp Us
                            </a>
                        </div>
                        <p className="mt-6 text-xs text-text-muted">
                            Deals are reviewed within 24 hours before going live. Free for all listed businesses.
                        </p>
                    </div>
                </section>

                {/* How it works */}
                <section className="section-spacing px-6">
                    <div className="container-premium max-w-3xl">
                        <h2 className="text-2xl font-extrabold text-text text-center mb-10">How Deal Submissions Work</h2>
                        <div className="space-y-6">
                            {[
                                { step: 1, title: 'Submit Your Offer', desc: 'Send us your deal via WhatsApp or email with the business name, deal details, and expiry date.' },
                                { step: 2, title: 'We Review', desc: 'Our team checks that the deal is genuine and from a listed or listable Harbour View business.' },
                                { step: 3, title: 'Goes Live', desc: 'Approved deals are published here and featured in our community updates.' },
                                { step: 4, title: 'Expires Automatically', desc: 'Deals are removed after the end date, keeping the page fresh and trustworthy.' },
                            ].map(item => (
                                <div key={item.step} className="flex gap-5 items-start">
                                    <div className="w-10 h-10 rounded-full bg-brand-warm text-white flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                                    <div>
                                        <h3 className="font-bold text-text">{item.title}</h3>
                                        <p className="text-text-soft text-sm mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
