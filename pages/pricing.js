import Head from 'next/head';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function PricingPage() {
    const paymentSteps = [
        {
            step: 1,
            title: 'Choose Your Plan',
            description: 'Select Free, Featured (JMD $2,500/month), or Premium (JMD $5,000/month) listing.',
            icon: '📋'
        },
        {
            step: 2,
            title: 'Submit Business Details',
            description: 'Fill out your business information through our simple online form.',
            icon: '🏢'
        },
        {
            step: 3,
            title: 'Receive WhatsApp Payment Request',
            description: 'We send you a secure payment request via WhatsApp with payment details.',
            icon: '💬'
        },
        {
            step: 4,
            title: 'Confirm Payment',
            description: 'Make payment via bank transfer, mobile money, or credit card as instructed.',
            icon: '✅'
        },
        {
            step: 5,
            title: 'Instant Activation',
            description: 'Your listing goes live immediately after payment confirmation.',
            icon: '⚡'
        },
        {
            step: 6,
            title: 'Receive Receipt & Support',
            description: 'Get payment receipt and dedicated support for your listing.',
            icon: '📧'
        }
    ];

    const benefits = [
        'Reach thousands of Harbour View residents',
        'Increase local visibility and credibility',
        'Get customer reviews and feedback',
        'WhatsApp direct messaging from customers',
        'Monthly performance analytics',
        'Priority customer support'
    ];

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Pricing & Plans | Harbour View Directory</title>
                <meta name="description" content="Affordable pricing plans for listing your business in Harbour View Directory. Free, Featured, and Premium options with easy WhatsApp payments." />
                <link rel="canonical" href="https://harbourviewdirectory.online/pricing" />
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-black text-gray-900 mb-6">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Choose the perfect plan to grow your local business. All plans include our easy WhatsApp payment workflow.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {/* Free Plan */}
                        <div className="bg-white rounded-2xl border-2 border-blue-200 p-8">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Listing</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-black text-gray-900">Free</span>
                                    <span className="text-gray-600 ml-2">Forever</span>
                                </div>
                                <p className="text-gray-600">Perfect for getting started</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Basic business listing</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Contact information</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Category listing</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Community reviews</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">48-hour approval</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">3 images maximum</span>
                                </li>
                            </ul>

                            <div className="text-center">
                                <Link 
                                    href="/register?plan=free"
                                    className="inline-block w-full bg-brand-blue text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Start Free Listing
                                </Link>
                            </div>
                        </div>

                        {/* Featured Plan */}
                        <div className="bg-white rounded-2xl border-2 border-yellow-300 shadow-xl p-8 relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    MOST POPULAR
                                </span>
                            </div>
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Featured</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-black text-gray-900">JMD $2,500</span>
                                    <span className="text-gray-600 ml-2">/month</span>
                                </div>
                                <p className="text-gray-600">Best for growing businesses</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700 font-medium">Everything in Free, plus:</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-yellow-500 mr-2">⭐</span>
                                    <span className="text-gray-700">Featured badge</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Top of category listings</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Priority approval</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Up to 10 images</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">WhatsApp contact button</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Basic analytics</span>
                                </li>
                            </ul>

                            <div className="text-center">
                                <Link 
                                    href="/register?plan=featured"
                                    className="inline-block w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition"
                                >
                                    Choose Featured
                                </Link>
                                <p className="text-gray-500 text-sm mt-3">30-day money-back guarantee</p>
                            </div>
                        </div>

                        {/* Premium Plan */}
                        <div className="bg-white rounded-2xl border-2 border-purple-300 p-8">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-black text-gray-900">JMD $5,000</span>
                                    <span className="text-gray-600 ml-2">/month</span>
                                </div>
                                <p className="text-gray-600">Maximum visibility & features</p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700 font-medium">Everything in Featured, plus:</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">🔥</span>
                                    <span className="text-gray-700">Top Ad placement</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Homepage visibility</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Unlimited images</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Advanced analytics</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Social media promotion</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Priority support</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-gray-700">Verified badge</span>
                                </li>
                            </ul>

                            <div className="text-center">
                                <Link 
                                    href="/register?plan=premium"
                                    className="inline-block w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition"
                                >
                                    Go Premium
                                </Link>
                                <p className="text-gray-500 text-sm mt-3">30-day money-back guarantee</p>
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp Payment Workflow */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Easy WhatsApp Payment Workflow</h2>
                        
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-8">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="text-6xl">💬</div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Why WhatsApp Payments?</h3>
                                    <p className="text-gray-700 mb-4">
                                        We use WhatsApp for payments because it's familiar, secure, and convenient for Jamaican businesses. 
                                        You get instant communication, payment confirmation, and support all in one place.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Familiar & Easy</span>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Secure & Private</span>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Instant Support</span>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Payment Receipts</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paymentSteps.map((step) => (
                                <div key={step.step} className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="bg-brand-blue text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                            {step.step}
                                        </div>
                                        <div className="text-3xl">{step.icon}</div>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Benefits of Listing With Us</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl text-green-500">✓</div>
                                        <h4 className="text-lg font-bold text-gray-900">{benefit}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-10 text-center text-white">
                        <h2 className="text-3xl font-bold mb-6">Start Reaching Customers Today</h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Join the growing community of Harbour View businesses connecting with local customers.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href="/post-ad"
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition text-lg"
                            >
                                Compare All Plans
                            </Link>
                            <a 
                                href="https://wa.me/18765551234?text=Hi!%20I%20have%20questions%20about%20Harbour%20View%20Directory%20pricing."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-600 transition text-lg inline-flex items-center justify-center gap-2"
                            >
                                💬 Chat on WhatsApp
                            </a>
                        </div>
                        <p className="text-blue-100 text-sm mt-6">
                            Have questions? Our team is available on WhatsApp to help you choose the right plan.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-gray-500">© {new Date().getFullYear()} Harbour View Directory</p>
                            <p className="text-gray-400 text-sm mt-1">Affordable local business marketing</p>
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