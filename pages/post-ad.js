import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function PostAdPage() {
    const [selectedPlan, setSelectedPlan] = useState('free');

    const plans = [
        {
            id: 'free',
            name: 'Free Listing',
            price: 'Free',
            period: 'Forever',
            features: [
                'Basic business listing',
                'Contact information',
                'Category listing',
                'Community reviews',
                'Approval within 48 hours',
                'Limited to 3 images'
            ],
            cta: 'Get Started Free',
            color: 'bg-blue-50 border-blue-200',
            buttonColor: 'bg-brand-blue hover:bg-blue-700'
        },
        {
            id: 'featured',
            name: 'Featured',
            price: 'JMD $2,500',
            period: 'per month',
            features: [
                'Everything in Free, plus:',
                '⭐ Featured badge',
                'Top of category listings',
                'Priority approval',
                'Up to 10 images',
                'WhatsApp contact button',
                'Basic analytics'
            ],
            cta: 'Choose Featured',
            color: 'bg-yellow-50 border-yellow-200',
            buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 'JMD $5,000',
            period: 'per month',
            features: [
                'Everything in Featured, plus:',
                '🔥 Top Ad placement',
                'Homepage visibility',
                'Unlimited images',
                'Advanced analytics',
                'Social media promotion',
                'Priority support',
                'Verified badge'
            ],
            cta: 'Go Premium',
            color: 'bg-purple-50 border-purple-200',
            buttonColor: 'bg-purple-600 hover:bg-purple-700'
        }
    ];

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>List Your Business | Harbour View Directory</title>
                <meta name="description" content="List your business in the Harbour View Directory. Choose from free, featured, or premium listings to reach local customers." />
                <link rel="canonical" href="https://harbourviewdirectory.online/post-ad" />
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-black text-gray-900 mb-6">
                            List Your Business in Harbour View
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Reach thousands of local customers. Choose the perfect listing plan for your business.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="#pricing" className="bg-brand-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                                View Pricing Plans
                            </a>
                            <a href="#how-it-works" className="bg-white text-brand-blue border-2 border-brand-blue px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                                How It Works
                            </a>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div id="how-it-works" className="mb-16">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
                                <div className="text-4xl mb-4">1️⃣</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Plan</h3>
                                <p className="text-gray-600">
                                    Select from Free, Featured, or Premium listings based on your business needs and budget.
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
                                <div className="text-4xl mb-4">2️⃣</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Submit Your Details</h3>
                                <p className="text-gray-600">
                                    Fill out your business information, upload photos, and provide contact details.
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
                                <div className="text-4xl mb-4">3️⃣</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Go Live & Get Customers</h3>
                                <p className="text-gray-600">
                                    Your listing goes live, and customers can find and contact you immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp Payment Info */}
                    <div className="mb-16 bg-green-50 border border-green-200 rounded-2xl p-8">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="text-6xl">💬</div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Easy WhatsApp Payments</h3>
                                <p className="text-gray-700 mb-4">
                                    For Featured and Premium plans, payment is simple and secure via WhatsApp. After submitting your listing, we'll send you a payment request on WhatsApp. Once confirmed, your listing goes live immediately!
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Secure Payment</span>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Instant Activation</span>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Receipt Provided</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Plans */}
                    <div id="pricing" className="mb-16">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Choose Your Plan</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.map((plan) => (
                                <div 
                                    key={plan.id} 
                                    className={`rounded-2xl border-2 p-8 transition-all ${selectedPlan === plan.id ? 'scale-105 shadow-xl' : 'shadow-sm'} ${plan.color}`}
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <div className="mb-4">
                                            <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                                            <span className="text-gray-600 ml-2">{plan.period}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-green-500 mr-2">✓</span>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="text-center">
                                        <Link 
                                            href={`/register?plan=${plan.id}`}
                                            className={`inline-block w-full text-white font-bold py-3 px-6 rounded-lg transition ${plan.buttonColor}`}
                                        >
                                            {plan.cta}
                                        </Link>
                                        {plan.id === 'free' && (
                                            <p className="text-gray-500 text-sm mt-3">No payment required</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-gray-600">
                                All plans include a 30-day money-back guarantee for paid listings.
                            </p>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Frequently Asked Questions</h2>
                        <div className="max-w-3xl mx-auto space-y-6">
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">How long does approval take?</h3>
                                <p className="text-gray-600">
                                    Free listings: 24-48 hours. Featured/Premium listings: Instant after payment confirmation.
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Can I upgrade my plan later?</h3>
                                <p className="text-gray-600">
                                    Yes! You can upgrade from Free to Featured or Premium at any time. The change takes effect immediately.
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">What payment methods do you accept?</h3>
                                <p className="text-gray-600">
                                    We accept payments via WhatsApp (most common), bank transfer, or credit/debit card for premium plans.
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Can I edit my listing after submission?</h3>
                                <p className="text-gray-600">
                                    Yes, you can edit all aspects of your listing anytime through your dashboard.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-center text-white">
                        <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Business?</h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Join hundreds of local businesses already reaching customers through Harbour View Directory.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href="/register?plan=free"
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition text-lg"
                            >
                                Start Free Listing
                            </Link>
                            <a 
                                href="https://wa.me/18765551234?text=Hi!%20I'm%20interested%20in%20listing%20my%20business%20on%20Harbour%20View%20Directory."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-600 transition text-lg inline-flex items-center justify-center gap-2"
                            >
                                💬 Chat on WhatsApp
                            </a>
                        </div>
                        <p className="text-blue-100 text-sm mt-6">
                            Need help choosing? Our team is available on WhatsApp to guide you.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-gray-500">© {new Date().getFullYear()} Harbour View Directory</p>
                            <p className="text-gray-400 text-sm mt-1">Helping local businesses thrive</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="/terms" className="text-gray-500 hover:text-brand-blue transition">Terms</a>
                            <a href="/privacy" className="text-gray-500 hover:text-brand-blue transition">Privacy</a>
                            <a href="/contact" className="text-gray-500 hover:text-brand-blue transition">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}