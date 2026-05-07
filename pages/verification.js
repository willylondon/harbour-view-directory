import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function VerificationPage() {
    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Verification Policy | Harbour View Directory</title>
                <meta name="description" content="Understand what the Harbour View Directory verified badge means, how verification works, and how to claim your listing." />
                <link rel="canonical" href="https://harbourviewdirectory.online/verification" />
            </Head>
            <Navbar />

            <main className="pt-28 pb-16 px-6">
                <div className="container-premium max-w-3xl">
                    <div className="mb-10">
                        <span className="inline-block bg-brand-soft text-brand text-sm font-bold px-3 py-1 rounded-full mb-4">✅ Verification</span>
                        <h1 className="text-4xl font-extrabold text-text mb-3">Verified Badge Policy</h1>
                        <p className="text-text-soft text-lg leading-relaxed">
                            The Harbour View Directory verified badge indicates that a listing's basic contact information
                            has been manually reviewed. Here is exactly what verification means — and what it does not.
                        </p>
                    </div>

                    {/* What verified means */}
                    <section className="card-premium p-8 mb-8">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">✅ What Verified Means</h2>
                        <ul className="space-y-3">
                            {[
                                'A member of our team has checked that the contact number listed is reachable.',
                                'The business name and category appeared consistent at time of review.',
                                'The address or service area was confirmed as plausible.',
                                'No obvious duplicate, spam, or fake listing signals were detected.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-success text-lg shrink-0">✓</span>
                                    <span className="text-text-soft">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* What verified does NOT mean */}
                    <section className="card-premium p-8 mb-8 border-l-4 border-brand-warm">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">⚠️ What Verified Does Not Mean</h2>
                        <p className="text-text-soft mb-4 text-sm">
                            The verified badge is <strong>not</strong> a guarantee or endorsement. Verification does not mean:
                        </p>
                        <ul className="space-y-3">
                            {[
                                'The directory guarantees the quality of goods or services provided.',
                                'Pricing, availability, or hours of operation are current or accurate.',
                                'The business is licensed, insured, or professionally accredited.',
                                'The directory is responsible for any outcome of your interaction with this business.',
                                'Safety of work performed has been inspected or guaranteed.',
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="text-brand-warm text-lg shrink-0">✗</span>
                                    <span className="text-text-soft">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* How to get verified */}
                    <section className="card-premium p-8 mb-8">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">How to Get Verified</h2>
                        <p className="text-text-soft mb-6">
                            Verification is currently available to Premium plan subscribers. To request verification for your
                            listing, contact us via WhatsApp with your listing name and business details.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="/post-ad"
                                className="flex items-center justify-center gap-2 bg-brand text-white font-bold px-6 py-3.5 rounded-btn hover:bg-brand-deep transition"
                            >
                                🏪 Claim Your Listing
                            </a>
                            <a
                                href="/report"
                                className="flex items-center justify-center gap-2 bg-bg-alt text-text font-bold px-6 py-3.5 rounded-btn hover:bg-border transition border border-border"
                            >
                                🚩 Report Incorrect Info
                            </a>
                        </div>
                    </section>

                    {/* Disclaimer */}
                    <section className="bg-bg-alt rounded-btn p-6 text-sm text-text-muted border border-border">
                        <p>
                            Harbour View Directory acts as a community information platform. We are not agents, brokers, or
                            representatives of any listed business. Always exercise due diligence before engaging any service provider.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
