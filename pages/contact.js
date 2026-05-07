import { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '../lib/siteConfig';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
            
            // Reset status after 5 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 5000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Contact Us | Harbour View Directory</title>
                <meta name="description" content="Contact Harbour View Directory. Get in touch with questions, suggestions, or to report issues with business listings." />
                <link rel="canonical" href="https://harbourviewdirectory.online/contact" />
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-black text-gray-900 mb-6">Contact Us</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Have questions, suggestions, or need help? We're here to support the Harbour View community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contact Information */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">📍 Location</h3>
                                        <p className="text-gray-600">
                                            Harbour View Community Centre<br />
                                            Kingston, Jamaica
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">📧 Email</h3>
                                        <p className="text-gray-600">
                                            <a href={CONTACT_MAILTO} className="text-brand-blue hover:underline">
                                                {CONTACT_EMAIL}
                                            </a>
                                        </p>
                                    </div>



                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">🕒 Hours</h3>
                                        <p className="text-gray-600">
                                            Monday - Friday: 9:00 AM - 5:00 PM<br />
                                            Saturday: 10:00 AM - 2:00 PM<br />
                                            Sunday: Closed
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <a href="/post-ad" className="text-brand-blue hover:underline">
                                                List Your Business
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/report" className="text-brand-blue hover:underline">
                                                Report a Listing
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/verification" className="text-brand-blue hover:underline">
                                                Verification Policy
                                            </a>
                                        </li>
                                        <li>
                                            <a href="/listing-guidelines" className="text-brand-blue hover:underline">
                                                Listing Guidelines
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                                
                                {submitStatus === 'success' && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 font-medium">
                                            ✅ Thank you for your message! We'll get back to you soon.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="business-listing">Business Listing Inquiry</option>
                                            <option value="report-issue">Report an Issue</option>
                                            <option value="suggestion">Suggestion/Feedback</option>
                                            <option value="partnership">Partnership Opportunity</option>
                                            <option value="technical">Technical Support</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="6"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition resize-none"
                                            placeholder="How can we help you today?"
                                        ></textarea>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500">
                                            * Required fields
                                        </p>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="bg-brand-blue text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-bold text-gray-700">How long does it take to list my business?</h4>
                                            <p className="text-gray-600 text-sm mt-1">
                                                Free listings are typically approved within 24-48 hours. Premium listings are activated immediately after payment.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-700">Can I edit my business listing?</h4>
                                            <p className="text-gray-600 text-sm mt-1">
                                                Yes, you can edit your listing anytime by logging into your account and accessing the dashboard.
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-700">How do I report inaccurate information?</h4>
                                            <p className="text-gray-600 text-sm mt-1">
                                                Use the "Report Listing" feature on any business page, or contact us directly with details.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust & Support Links */}
                    <div className="mt-12 bg-gradient-to-r from-brand-deep to-brand rounded-2xl p-8 text-center text-white">
                        <h3 className="text-2xl font-bold mb-4">Community Trust & Safety</h3>
                        <p className="mb-6 max-w-2xl mx-auto text-white/80">
                            Help us keep Harbour View Directory accurate and trustworthy. Report issues, understand verification, or review listing guidelines.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                            <a href="/report" className="bg-white text-brand-deep px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition inline-flex items-center justify-center gap-2">
                                🚩 Report a Listing
                            </a>
                            <a href="/listing-guidelines" className="bg-brand-warm text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-500 transition inline-flex items-center justify-center gap-2">
                                📋 Listing Guidelines
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-gray-500">© {new Date().getFullYear()} Harbour View Directory</p>
                            <p className="text-gray-400 text-sm mt-1">Connecting our community</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="/terms" className="text-gray-500 hover:text-brand-blue transition">Terms</a>
                            <a href="/privacy" className="text-gray-500 hover:text-brand-blue transition">Privacy</a>
                            <a href="/contact" className="text-gray-500 hover:text-brand-blue transition font-medium">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
