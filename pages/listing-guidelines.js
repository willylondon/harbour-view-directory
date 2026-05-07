import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '../lib/siteConfig';

export default function ListingGuidelinesPage() {
    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Listing Guidelines | Harbour View Directory</title>
                <meta name="description" content="Learn who can be listed in the Harbour View Directory, what types of businesses qualify, and the rules for listing approval and removal." />
                <link rel="canonical" href="https://harbourviewdirectory.online/listing-guidelines" />
            </Head>
            <Navbar />

            <main className="pt-28 pb-16 px-6">
                <div className="container-premium max-w-3xl">
                    <div className="mb-10">
                        <span className="inline-block bg-brand-soft text-brand text-sm font-bold px-3 py-1 rounded-full mb-4">📋 Directory Policy</span>
                        <h1 className="text-4xl font-extrabold text-text mb-3">Listing Guidelines</h1>
                        <p className="text-text-soft text-lg leading-relaxed">
                            The Harbour View Directory exists to serve the Harbour View, Kingston community and nearby areas.
                            These guidelines explain who qualifies for a listing, what is not allowed, and how listings are managed.
                        </p>
                    </div>

                    {/* Who can be listed */}
                    <section className="card-premium p-8 mb-8">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">Who Can Be Listed</h2>
                        <p className="text-text-soft mb-4">
                            Any individual, sole trader, or business that genuinely serves people in these communities:
                        </p>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['Harbour View', 'Bull Bay', 'CMU / Caribbean Maritime University Area', 'Twickenham Park', 'Kingston East', 'St. Thomas (nearby)'].map(area => (
                                <span key={area} className="bg-brand-soft text-brand text-sm font-semibold px-3 py-1 rounded-full">{area}</span>
                            ))}
                        </div>
                        <p className="text-text-soft text-sm">
                            If your business is based outside these areas but frequently serves customers here, you may still qualify.
                            Contact us to discuss.
                        </p>
                    </section>

                    {/* Requirements */}
                    <section className="card-premium p-8 mb-8">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">Listing Requirements</h2>
                        <ul className="space-y-4">
                            {[
                                { icon: '📞', text: 'You must have a legitimate, working contact number (WhatsApp preferred).' },
                                { icon: '🏷️', text: 'Your business name must accurately reflect what you do — no misleading or exaggerated names.' },
                                { icon: '📍', text: 'Your address or service area must be genuine and verifiable.' },
                                { icon: '🗂️', text: 'You must select the most accurate category for your business.' },
                                { icon: '🖼️', text: 'Photos (if provided) must be of your actual product or premises, not stock photos.' },
                            ].map(item => (
                                <li key={item.text} className="flex items-start gap-3">
                                    <span className="text-2xl shrink-0">{item.icon}</span>
                                    <span className="text-text-soft">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* What is NOT allowed */}
                    <section className="card-premium p-8 mb-8 border-l-4 border-red-400">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">What Is Not Allowed</h2>
                        <ul className="space-y-3">
                            {[
                                'Illegal businesses or services of any kind.',
                                'Scams, fraudulent services, or deceptive listings.',
                                'Spam listings (the same business submitted multiple times).',
                                'Adult content or services.',
                                'Listings with fabricated reviews or ratings.',
                                'Businesses that primarily operate outside the qualifying areas.',
                                'Listings that impersonate another business or individual.',
                            ].map(item => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="text-red-500 text-lg shrink-0">✗</span>
                                    <span className="text-text-soft">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Free vs Paid */}
                    <section className="card-premium p-8 mb-8">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">Free vs. Paid Listings</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-bg-alt rounded-btn p-5">
                                <h3 className="font-bold text-text mb-3">Free Listing</h3>
                                <ul className="space-y-2 text-sm text-text-soft">
                                    <li>✓ Business name, category, contact</li>
                                    <li>✓ Approved within 24–48 hours</li>
                                    <li>✓ Standard category placement</li>
                                    <li>✗ No featured badge or top placement</li>
                                </ul>
                            </div>
                            <div className="bg-brand-soft rounded-btn p-5">
                                <h3 className="font-bold text-brand-deep mb-3">Featured / Premium</h3>
                                <ul className="space-y-2 text-sm text-text-soft">
                                    <li>✓ Priority approval (within 12 hours)</li>
                                    <li>✓ Featured or Top Ad badge</li>
                                    <li>✓ Higher placement in search results</li>
                                    <li>✓ Additional images, WhatsApp button</li>
                                </ul>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-text-muted">
                            See <a href="/pricing" className="text-brand hover:underline">our pricing page</a> for full details.
                        </p>
                    </section>

                    {/* Rejection & Removal */}
                    <section className="card-premium p-8 mb-8">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">Rejection & Removal</h2>
                        <p className="text-text-soft mb-4">
                            We reserve the right to reject or remove any listing that violates these guidelines, without notice.
                            Common reasons for rejection include:
                        </p>
                        <ul className="space-y-2 text-sm text-text-soft list-disc list-inside">
                            <li>Unverifiable contact information.</li>
                            <li>Reported as closed, fake, or misleading by community members.</li>
                            <li>Category is clearly inappropriate for the business.</li>
                            <li>Description contains spam language or keyword stuffing.</li>
                        </ul>
                        <p className="mt-4 text-text-soft">
                            If you believe your listing was incorrectly removed, contact us at{' '}
                            <a href={CONTACT_MAILTO} className="text-brand hover:underline">
                                {CONTACT_EMAIL}
                            </a>.
                        </p>
                    </section>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="/post-ad" className="flex-1 text-center bg-brand text-white font-bold px-6 py-3.5 rounded-btn hover:bg-brand-deep transition">
                            Submit Your Listing
                        </a>
                        <a href="/report" className="flex-1 text-center bg-bg-alt text-text font-bold px-6 py-3.5 rounded-btn hover:bg-border transition border border-border">
                            Report a Problem
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
