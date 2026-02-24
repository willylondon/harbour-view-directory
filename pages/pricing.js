import Head from 'next/head';
import Navbar from '../components/Navbar';

const tiers = [
    {
        name: 'Basic',
        price: 'JMD 2,000',
        description: 'Get listed in the events section with a clean, standard card.',
        features: [
            'Listed in events section',
            'Standard placement',
            'Ideal for small pop-ups'
        ],
        highlight: false
    },
    {
        name: 'Premium',
        price: 'JMD 5,000',
        description: 'Priority placement at the top of the events page.',
        features: [
            'Featured at top of events',
            'Premium spotlight rotation',
            'Great for ticketed events'
        ],
        highlight: true
    },
    {
        name: 'Featured',
        price: 'JMD 10,000',
        description: 'Maximum exposure with homepage hero + events top placement.',
        features: [
            'Homepage hero placement',
            'Top of events section',
            'Best for launches + festivals'
        ],
        highlight: false
    }
];

export default function PricingPage() {
    const whatsappLink = process.env.NEXT_PUBLIC_PAYMENTS_WHATSAPP || 'https://wa.me/18768617153';

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Pricing | Harbour View Directory</title>
                <meta name="description" content="Promote your events and products with paid placements." />
            </Head>

            <Navbar />

            <main className="pt-28 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900">Paid Advertising</h1>
                        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                            Choose a tier that matches your event or product launch. Payments are confirmed manually via WhatsApp for now.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`rounded-2xl border p-6 shadow-sm bg-white ${tier.highlight ? 'border-brand-blue ring-2 ring-brand-blue/40' : 'border-gray-200'}`}
                            >
                                {tier.highlight && (
                                    <div className="text-xs uppercase tracking-[0.2em] text-brand-blue font-semibold mb-3">Most Popular</div>
                                )}
                                <h2 className="text-2xl font-bold text-gray-900">{tier.name}</h2>
                                <p className="text-3xl font-black text-brand-blue mt-2">{tier.price}</p>
                                <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
                                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-brand-yellow"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 bg-brand-blue text-white rounded-2xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-bold">Ready to promote your event?</h3>
                            <p className="text-blue-100 mt-2">
                                Send payment via WhatsApp, then submit your event in the dashboard. We will approve it once payment is confirmed.
                            </p>
                        </div>
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-yellow text-gray-900 font-bold px-6 py-3 rounded-lg shadow-sm"
                        >
                            Pay via WhatsApp
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
