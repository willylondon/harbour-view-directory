import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONTACT_MAILTO } from '../lib/siteConfig';

export default function ReportPage() {
    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Report a Listing | Harbour View Directory</title>
                <meta name="description" content="Report incorrect, misleading, or abusive listings in the Harbour View Directory. We review all reports before making changes." />
                <link rel="canonical" href="https://harbourviewdirectory.online/report" />
            </Head>
            <Navbar />

            <main className="pt-28 pb-16 px-6">
                <div className="container-premium max-w-3xl">
                    <div className="mb-10">
                        <span className="inline-block bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full mb-4">🚩 Community Safety</span>
                        <h1 className="text-4xl font-extrabold text-text mb-3">Report a Listing</h1>
                        <p className="text-text-soft text-lg leading-relaxed">
                            Help us keep the Harbour View Directory accurate, safe, and trustworthy.
                            All reports are reviewed by our team before any public changes are made.
                        </p>
                    </div>

                    {/* What you can report */}
                    <section className="card-premium p-8 mb-8">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">What You Can Report</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { icon: '📞', label: 'Wrong or disconnected phone number' },
                                { icon: '🚫', label: 'Business is permanently closed' },
                                { icon: '📍', label: 'Incorrect address or location' },
                                { icon: '👥', label: 'Duplicate or near-identical listing' },
                                { icon: '🤖', label: 'Spam or fake business' },
                                { icon: '⚠️', label: 'Abusive or unsafe content' },
                                { icon: '🖼️', label: 'Inappropriate or wrong photos' },
                                { icon: '💬', label: 'Misleading business description' },
                            ].map(item => (
                                <div key={item.label} className="flex items-start gap-3 p-3 rounded-btn bg-bg-alt">
                                    <span className="text-xl shrink-0">{item.icon}</span>
                                    <span className="text-sm text-text-soft">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How to report */}
                    <section className="card-premium p-8 mb-8">
                        <h2 className="text-xl font-bold text-text mb-5 pb-3 border-b border-border">How to Submit a Report</h2>
                        <p className="text-text-soft mb-6">
                            We currently accept reports via WhatsApp or email. Include the business name, what is incorrect,
                            and any supporting information you can provide.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a
                                href="https://wa.me/18767978034?text=I+would+like+to+report+a+listing+on+Harbour+View+Directory."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-success text-white font-bold px-6 py-3.5 rounded-btn hover:bg-green-600 transition"
                            >
                                💬 Report via WhatsApp
                            </a>
                            <a
                                href={`${CONTACT_MAILTO}?subject=Listing Report`}
                                className="flex items-center justify-center gap-2 bg-bg-alt text-text font-bold px-6 py-3.5 rounded-btn hover:bg-border transition border border-border"
                            >
                                📧 Report via Email
                            </a>
                        </div>
                    </section>

                    {/* Review process */}
                    <section className="card-premium p-8">
                        <h2 className="text-xl font-bold text-text mb-4 pb-3 border-b border-border">Our Review Process</h2>
                        <ol className="space-y-4">
                            {[
                                'We receive your report and acknowledge it within 24 hours.',
                                'Our team contacts the business owner or investigates independently.',
                                'If the report is confirmed, the listing is corrected, flagged, or removed.',
                                'Anonymous reports are accepted — we never share who filed a report.',
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <span className="w-7 h-7 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                    <p className="text-text-soft pt-0.5">{step}</p>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
