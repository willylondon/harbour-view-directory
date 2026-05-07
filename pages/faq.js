import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FAQS = [
    {
        section: 'Listings',
        items: [
            { q: 'How do I list my business?', a: 'Click "List Business" in the navigation bar. Fill out the form with your business details. Free listings are reviewed within 24–48 hours.' },
            { q: 'How long does approval take?', a: 'Free listings: 24–48 hours. Featured listings: within 12 hours of payment confirmation.' },
            { q: 'Can I edit my listing after it\'s approved?', a: 'Yes. Log into your account and access your Dashboard. From there you can view and manage your listings. Contact us via WhatsApp for edits.' },
            { q: 'Why was my listing rejected?', a: 'Common reasons: unverifiable contact info, business outside our service area, duplicate listing, or description that doesn\'t accurately reflect the business. Contact us at info@harbourviewdirectory.online for details.' },
            { q: 'Can I have multiple listings?', a: 'Yes, if you operate multiple distinct businesses in the Harbour View area.' },
        ]
    },
    {
        section: 'Pricing & Payment',
        items: [
            { q: 'Is listing really free?', a: 'Yes. A basic listing is completely free. Featured and Premium plans have monthly fees paid via WhatsApp bank transfer.' },
            { q: 'What\'s the difference between Free, Featured, and Premium?', a: 'Free listings appear in the standard directory. Featured listings get a badge and higher placement. Premium listings get top ad placement, homepage visibility, and a verified badge. See our Pricing page for full details.' },
            { q: 'How do I pay for a paid plan?', a: 'We send a WhatsApp invoice after you apply for a paid plan. Payment is by bank transfer or mobile money (NCB, JMMB, Scotia).' },
            { q: 'Can I cancel my paid plan?', a: 'Yes, any time. Plans are month-to-month. Message us on WhatsApp to cancel.' },
        ]
    },
    {
        section: 'Trust & Verification',
        items: [
            { q: 'What does the verified badge mean?', a: 'It means a directory team member has confirmed your contact number is reachable and the listing appears consistent. It does not guarantee quality or service outcomes.' },
            { q: 'How do I report a wrong or closed listing?', a: 'Use the Report a Listing page. All reports are reviewed before changes are made.' },
            { q: 'Are reviews from real people?', a: 'We show community reviews from the public. If you see a review that appears to be owner-submitted promotional content, use the Report feature to flag it.' },
        ]
    },
    {
        section: 'Rent Near CMU',
        items: [
            { q: 'Who can list a rental?', a: 'Any landlord or property owner with space near Caribbean Maritime University (CMU) in Harbour View.' },
            { q: 'How long does a rental listing stay active?', a: 'Approved rental listings are active for 90 days. After that, you can renew via the admin panel or by contacting us.' },
            { q: 'Is the rental listing free?', a: 'Yes, currently free during launch. We may introduce featured options in future.' },
        ]
    },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>FAQ — Frequently Asked Questions | Harbour View Directory</title>
                <meta name="description" content="Frequently asked questions about listing your business, pricing, verification, rentals near CMU, and community features on Harbour View Directory." />
                <link rel="canonical" href="https://harbourviewdirectory.online/faq" />
            </Head>
            <Navbar />

            <main className="pt-28 pb-16 px-6">
                <div className="container-premium max-w-3xl">
                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold text-text mb-3">Frequently Asked Questions</h1>
                        <p className="text-text-soft text-lg">
                            Answers to common questions about the Harbour View Directory — listings, pricing, verification, rentals, and more.
                        </p>
                    </div>

                    <div className="space-y-10">
                        {FAQS.map(section => (
                            <section key={section.section}>
                                <h2 className="text-lg font-extrabold text-brand uppercase tracking-wide mb-4 pb-2 border-b border-border">
                                    {section.section}
                                </h2>
                                <div className="space-y-3">
                                    {section.items.map(faq => (
                                        <details key={faq.q} className="card-premium p-5 group">
                                            <summary className="font-bold text-text cursor-pointer list-none flex justify-between items-center gap-4">
                                                <span>{faq.q}</span>
                                                <span className="text-text-muted shrink-0 group-open:rotate-45 transition-transform text-xl">＋</span>
                                            </summary>
                                            <p className="text-text-soft text-sm mt-3 leading-relaxed">{faq.a}</p>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    <div className="mt-12 bg-brand-soft rounded-btn p-8 text-center">
                        <h3 className="text-xl font-bold text-text mb-2">Still have questions?</h3>
                        <p className="text-text-soft mb-6 text-sm">Send us a message and we'll get back to you promptly.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href={`https://wa.me/18767978034`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-success text-white font-bold px-6 py-3 rounded-btn hover:bg-green-600 transition"
                            >
                                💬 WhatsApp Us
                            </a>
                            <a
                                href="mailto:info@harbourviewdirectory.online"
                                className="bg-brand text-white font-bold px-6 py-3 rounded-btn hover:bg-brand-deep transition"
                            >
                                📧 Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
