import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PostAdPage() {
    const [tab, setTab] = useState('business');

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>List Your Business | Harbour View Directory</title>
                <meta name="description" content="List your business in the Harbour View Directory. Choose Free, Featured, or Premium. Simple WhatsApp payment workflow." />
                <link rel="canonical" href="https://harbourviewdirectory.online/post-ad" />
            </Head>
            <Navbar />
            <main>
                <section className="bg-gradient-to-br from-brand-deep to-brand pt-28 pb-14 px-6 text-center text-white">
                    <div className="container-premium max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">List Your Business in Harbour View</h1>
                        <p className="text-lg text-white/80">Reach thousands of local customers. Start free or go premium — it only takes a few minutes.</p>
                    </div>
                </section>

                <section className="section-spacing px-6">
                    <div className="container-premium max-w-4xl">
                        <div className="flex flex-wrap justify-center gap-3 mb-10">
                            {[
                                { key: 'business', icon: '🏢', label: 'List a Business' },
                                { key: 'event', icon: '📅', label: 'Promote an Event' },
                                { key: 'featured', icon: '⭐', label: 'Go Featured / Premium' }
                            ].map(opt => (
                                <button key={opt.key} onClick={() => setTab(opt.key)}
                                    className={`card-premium px-6 py-4 text-left flex items-center gap-3 min-w-[200px] transition ${tab === opt.key ? 'ring-2 ring-brand' : ''}`}>
                                    <span className="text-2xl">{opt.icon}</span>
                                    <span className="font-bold text-text">{opt.label}</span>
                                </button>
                            ))}
                        </div>

                        {tab === 'business' && (
                            <div className="card-premium p-8 max-w-2xl mx-auto">
                                <h2 className="text-2xl font-extrabold text-text mb-4">🏢 List Your Business</h2>
                                <p className="text-text-soft mb-6">Create a listing for your business — restaurant, shop, service provider, or any local enterprise.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    {[
                                        { name: 'Free', desc: 'Basic listing, forever free', cls: 'bg-brand text-white' },
                                        { name: 'Featured', desc: 'JMD $2,500/mo', cls: 'bg-brand text-white' },
                                        { name: 'Premium', desc: 'JMD $5,000/mo', cls: 'bg-brand-warm text-white' }
                                    ].map(p => (
                                        <div key={p.name} className="border border-border rounded-btn p-4 text-center">
                                            <div className="font-bold text-text">{p.name}</div>
                                            <div className="text-xs text-text-muted mb-3">{p.desc}</div>
                                            <a href="/pricing" className={`block text-sm font-semibold py-1.5 rounded-btn ${p.cls}`}>Learn More</a>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-brand-soft rounded-btn p-5 mb-6">
                                    <h4 className="font-bold text-brand-deep mb-2">How to get listed:</h4>
                                    <ol className="text-sm text-text-soft space-y-1.5 list-decimal list-inside">
                                        <li>Register an account or log in</li>
                                        <li>Fill in your business details</li>
                                        <li>For paid plans: we'll WhatsApp you a payment link</li>
                                        <li>No listing goes public before admin approval</li>
                                    </ol>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <a href="/register" className="bg-brand text-white font-bold px-8 py-3 rounded-btn hover:bg-brand-deep transition">Register &amp; Start</a>
                                    <a href="/login" className="border-2 border-brand text-brand font-bold px-8 py-3 rounded-btn hover:bg-brand-soft transition">Login</a>
                                    <a href="https://wa.me/18767978034" target="_blank" rel="noopener" className="bg-success text-white font-bold px-8 py-3 rounded-btn hover:bg-emerald-600 transition">WhatsApp Us</a>
                                </div>
                            </div>
                        )}

                        {tab === 'event' && (
                            <div className="card-premium p-8 max-w-2xl mx-auto">
                                <h2 className="text-2xl font-extrabold text-text mb-4">📅 Promote an Event</h2>
                                <p className="text-text-soft mb-6">List your community event, workshop, market, or gathering for free.</p>
                                <div className="bg-brand-soft rounded-btn p-5 mb-6">
                                    <h4 className="font-bold text-brand-deep mb-2">How it works:</h4>
                                    <ol className="text-sm text-text-soft space-y-1.5 list-decimal list-inside">
                                        <li>Register or log in to your account</li>
                                        <li>Fill in event details (date, location, description)</li>
                                        <li>Submit for approval — typically within 24 hours</li>
                                        <li>Your event appears on the Events page</li>
                                    </ol>
                                </div>
                                <a href="/register" className="bg-brand text-white font-bold px-8 py-3 rounded-btn hover:bg-brand-deep transition inline-block">Register &amp; Submit Event</a>
                            </div>
                        )}

                        {tab === 'featured' && (
                            <div className="card-premium p-8 max-w-2xl mx-auto">
                                <h2 className="text-2xl font-extrabold text-text mb-4">⭐ Go Featured or Premium</h2>
                                <p className="text-text-soft mb-6">Want maximum visibility? Upgrade your existing listing to Featured or Premium.</p>
                                <div className="space-y-4 mb-6">
                                    <div className="border border-brand rounded-btn p-5">
                                        <h4 className="font-bold text-text">Featured — JMD $2,500/month</h4>
                                        <p className="text-sm text-text-soft mt-1">Top of category, featured badge, WhatsApp button, priority review, and up to 10 images.</p>
                                    </div>
                                    <div className="bg-brand-deep text-white rounded-btn p-5">
                                        <h4 className="font-bold">Premium — JMD $5,000/month</h4>
                                        <p className="text-sm opacity-80 mt-1">Top Ad placement on homepage, expanded image gallery, social promotion request support, and verification review eligibility.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <a href="/register" className="bg-brand text-white font-bold px-8 py-3 rounded-btn hover:bg-brand-deep transition">Get Started</a>
                                    <a href="https://wa.me/18767978034" target="_blank" rel="noopener" className="bg-success text-white font-bold px-8 py-3 rounded-btn hover:bg-emerald-600 transition">WhatsApp to Upgrade</a>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
