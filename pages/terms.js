import Head from 'next/head';
import Navbar from '../components/Navbar';
import { CONTACT_EMAIL } from '../lib/siteConfig';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Terms of Service | Harbour View Directory</title>
                <meta name="description" content="Terms of Service for Harbour View Directory. Read our terms and conditions for using our community directory services." />
                <link rel="canonical" href="https://harbourviewdirectory.online/terms" />
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h1 className="text-4xl font-black text-gray-900 mb-6">Terms of Service</h1>
                        <p className="text-gray-600 mb-8">Last updated: May 5, 2026</p>

                        <div className="prose prose-lg max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                                <p className="text-gray-600 mb-4">
                                    By accessing and using the Harbour View Directory website ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this Service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                                <p className="text-gray-600 mb-4">
                                    Harbour View Directory is a community-based online directory that connects local businesses and service providers with residents in the Harbour View area of Kingston, Jamaica. The Service includes business listings, reviews, events, and community information.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                                <p className="text-gray-600 mb-4">
                                    When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Business Listings</h2>
                                <p className="text-gray-600 mb-4">
                                    Business owners are responsible for the accuracy of their listings. All listings must:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Be for legitimate businesses operating in or serving the Harbour View area</li>
                                    <li>Contain accurate contact information</li>
                                    <li>Not contain false or misleading claims</li>
                                    <li>Not promote illegal activities</li>
                                    <li>Respect intellectual property rights</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Reviews and Content</h2>
                                <p className="text-gray-600 mb-4">
                                    Users may submit reviews and comments. You agree that your content will:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Be truthful and based on personal experience</li>
                                    <li>Not contain hate speech, harassment, or personal attacks</li>
                                    <li>Not contain spam or promotional content</li>
                                    <li>Not violate any laws or third-party rights</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
                                <p className="text-gray-600 mb-4">
                                    You may not use the Service to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Violate any laws or regulations</li>
                                    <li>Infringe upon intellectual property rights</li>
                                    <li>Spread malware or engage in hacking</li>
                                    <li>Harass, abuse, or harm others</li>
                                    <li>Submit false or misleading information</li>
                                    <li>Impersonate any person or entity</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
                                <p className="text-gray-600 mb-4">
                                    The Service and its original content, features, and functionality are owned by Harbour View Directory and are protected by international copyright, trademark, and other intellectual property laws.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
                                <p className="text-gray-600 mb-4">
                                    We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                                <p className="text-gray-600 mb-4">
                                    In no event shall Harbour View Directory, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
                                <p className="text-gray-600 mb-4">
                                    These Terms shall be governed and construed in accordance with the laws of Jamaica, without regard to its conflict of law provisions.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
                                <p className="text-gray-600 mb-4">
                                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                                <p className="text-gray-600 mb-4">
                                    If you have any questions about these Terms, please contact us at:
                                </p>
                                <p className="text-gray-600">
                                    Email: {CONTACT_EMAIL}<br />
                                    Address: Harbour View Community Centre, Kingston, Jamaica
                                </p>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <a href="/" className="inline-flex items-center gap-2 text-brand-blue font-bold hover:underline">
                                ← Back to Harbour View Directory
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
                            <p className="text-gray-400 text-sm mt-1">Building community connections</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="/terms" className="text-gray-500 hover:text-brand-blue transition font-medium">Terms</a>
                            <a href="/privacy" className="text-gray-500 hover:text-brand-blue transition">Privacy</a>
                            <a href="/contact" className="text-gray-500 hover:text-brand-blue transition">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
