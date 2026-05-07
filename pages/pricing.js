import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PricingPage() {
    const plans = [
        {
            name: 'Free', price: 'Free', period: 'forever', accent: 'bg-bg-alt border-border', btn: 'bg-brand text-white hover:bg-brand-deep',
            features: ['Business listing', 'Contact details', 'Category placement', 'Community reviews', '48-hour approval']
        },
        {
            name: 'Featured', price: 'JMD $2,500', period: '/month', accent: 'ring-2 ring-brand border-brand', btn: 'bg-brand text-white hover:bg-brand-deep',
            features: ['Everything in Free', '⭐ Featured badge', 'Top of category', 'Priority approval', 'WhatsApp button', '10 images', 'Monthly listing summary — coming soon'],
            popular: true
        },
        {
            name: 'Premium', price: 'JMD $5,000', period: '/month', accent: 'bg-gradient-to-b from-brand-deep to-brand text-white', btn: 'bg-white text-brand-deep hover:bg-gray-100',
            features: ['Everything in Featured', '🔥 Top Ad placement', 'Homepage visibility', 'Unlimited images', 'Priority placement reports — coming soon', 'Social promotion', 'Verified badge']
        }
    ];

    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Pricing &amp; Plans | Harbour View Directory</title>
                <meta name="description" content="Simple, transparent pricing for listing your business in Harbour View. Free, Featured (JMD $2,500/mo), and Premium (JMD $5,000/mo) plans with WhatsApp payments." />
                <link rel="canonical" href="https://harbourviewdirectory.online/pricing" />
            </Head>
            <Navbar />
            <main>
                <section className="bg-gradient-to-br from-brand-deep to-brand pt-28 pb-16 px-6 text-center text-white">
                    <div className="container-premium max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Simple, Transparent Pricing</h1>
                        <p className="text-lg text-white/80 mb-6">Choose the right plan to grow your business in Harbour View. Pay via WhatsApp — fast and secure.</p>
                    </div>
                </section>

                <section className="section-spacing px-6 -mt-16">
                    <div className="container-premium grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.name} className={`card-premium p-8 relative ${plan.accent}`}>
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-warm text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                                )}
                                <h3 className="text-xl font-bold text-text mb-1">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold text-text">{plan.price}</span>
                                    <span className="text-text-muted ml-1">{plan.period}</span>
                                </div>
                                <ul className="space-y-2.5 mb-8">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-start gap-2 text-sm text-text-soft">
                                            <span className="text-success shrink-0 mt-0.5">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>
                                <a href="/post-ad" className={`block text-center font-bold py-3 rounded-btn transition ${plan.btn}`}>Get Started</a>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="section-spacing bg-surface border-y border-border px-6">
                    <div className="container-premium max-w-3xl">
                        <h2 className="text-3xl font-extrabold text-text text-center mb-12">How Our WhatsApp Payment Works</h2>
                        <div className="space-y-8">
                            {[
                                { step: 1, title: 'Choose Your Plan', desc: 'Pick Free, Featured, or Premium on this page.' },
                                { step: 2, title: 'Fill Business Details', desc: 'Complete the simple online form with your business info.' },
                                { step: 3, title: 'Receive WhatsApp Invoice', desc: 'We send a secure payment request via WhatsApp with all details.' },
                                { step: 4, title: 'Pay & Confirm', desc: 'Pay via bank transfer, mobile money, or card — then send us the confirmation.' },
                                { step: 5, title: 'Go Live Instantly', desc: 'Your listing is activated immediately after payment verification.' },
                                { step: 6, title: 'Get Support', desc: 'Receive your receipt and dedicated support for your listing.' }
                            ].map(item => (
                                <div key={item.step} className="flex gap-5 items-start">
                                    <div className="w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0">{item.step}</div>
                                    <div>
                                        <h4 className="font-bold text-text">{item.title}</h4>
                                        <p className="text-text-soft text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="section-spacing px-6">
                    <div className="container-premium max-w-2xl">
                        <h2 className="text-3xl font-extrabold text-text text-center mb-10">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'How long does approval take?', a: 'Free listings: ~48 hours. Featured/Premium: within 12 hours.' },
                                { q: 'Can I switch plans later?', a: 'Yes — upgrade anytime. Just WhatsApp us and we\'ll adjust your listing.' },
                                { q: 'What payment methods are accepted?', a: 'Bank transfer, mobile money (JMMB, NCB, Scotia), and credit/debit cards via WhatsApp link.' },
                                { q: 'Can I cancel anytime?', a: 'Absolutely. Featured/Premium plans are month-to-month with no long-term commitment.' }
                            ].map(faq => (
                                <details key={faq.q} className="card-premium p-5 group">
                                    <summary className="font-bold text-text cursor-pointer list-none flex justify-between items-center">
                                        {faq.q}
                                        <span className="text-text-muted group-open:rotate-45 transition-transform">＋</span>
                                    </summary>
                                    <p className="text-text-soft text-sm mt-3">{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="section-spacing bg-brand-deep text-white px-6 text-center">
                    <div className="container-premium max-w-xl">
                        <h2 className="text-3xl font-extrabold mb-3">Ready to grow your business?</h2>
                        <p className="text-white/80 mb-8">Start with a free listing or go premium for maximum visibility in Harbour View.</p>
                        <a href="/post-ad" className="inline-block bg-brand-warm text-white font-bold px-10 py-4 rounded-btn hover:bg-amber-500 transition shadow-elevated">List Your Business Now</a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
