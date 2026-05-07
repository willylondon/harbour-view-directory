import Head from 'next/head';
import Navbar from '../components/Navbar';
import { CONTACT_EMAIL } from '../lib/siteConfig';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Privacy Policy | Harbour View Directory</title>
                <meta name="description" content="Privacy Policy for Harbour View Directory. Learn how we collect, use, and protect your personal information." />
                <link rel="canonical" href="https://harbourviewdirectory.online/privacy" />
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h1 className="text-4xl font-black text-gray-900 mb-6">Privacy Policy</h1>
                        <p className="text-gray-600 mb-8">Last updated: May 5, 2026</p>

                        <div className="prose prose-lg max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                                <p className="text-gray-600 mb-4">
                                    Harbour View Directory ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">Personal Information</h3>
                                <p className="text-gray-600 mb-4">
                                    When you create an account or submit a business listing, we may collect:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Name and contact information</li>
                                    <li>Email address</li>
                                    <li>Phone number</li>
                                    <li>Business information</li>
                                    <li>Payment information (for premium listings)</li>
                                </ul>

                                <h3 className="text-xl font-bold text-gray-800 mb-3">Automatically Collected Information</h3>
                                <p className="text-gray-600 mb-4">
                                    We automatically collect certain information when you visit our website:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>IP address and browser type</li>
                                    <li>Device information</li>
                                    <li>Pages visited and time spent</li>
                                    <li>Referring website</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                                <p className="text-gray-600 mb-4">
                                    We use the information we collect to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Provide and maintain our Service</li>
                                    <li>Process business listings and payments</li>
                                    <li>Send administrative information</li>
                                    <li>Respond to inquiries and support requests</li>
                                    <li>Improve our website and services</li>
                                    <li>Monitor usage and analyze trends</li>
                                    <li>Prevent fraudulent activity</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
                                <p className="text-gray-600 mb-4">
                                    We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>With service providers who assist in our operations</li>
                                    <li>To comply with legal obligations</li>
                                    <li>To protect our rights and safety</li>
                                    <li>With your consent</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Business Listings Information</h2>
                                <p className="text-gray-600 mb-4">
                                    Information submitted for business listings (business name, contact details, description) is publicly visible on our website. This information is intended to help community members find local businesses.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
                                <p className="text-gray-600 mb-4">
                                    We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
                                <p className="text-gray-600 mb-4">
                                    We use cookies and similar tracking technologies to track activity on our website and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
                                <p className="text-gray-600 mb-4">
                                    Our Service may contain links to third-party websites or services that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
                                <p className="text-gray-600 mb-4">
                                    Our Service does not address anyone under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Your Rights</h2>
                                <p className="text-gray-600 mb-4">
                                    Depending on your location, you may have the right to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 mb-4">
                                    <li>Access your personal information</li>
                                    <li>Correct inaccurate information</li>
                                    <li>Request deletion of your information</li>
                                    <li>Object to processing of your information</li>
                                    <li>Data portability</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                                <p className="text-gray-600 mb-4">
                                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                                <p className="text-gray-600 mb-4">
                                    If you have any questions about this Privacy Policy, please contact us at:
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
                            <p className="text-gray-400 text-sm mt-1">Protecting your privacy</p>
                        </div>
                        <div className="flex gap-6">
                            <a href="/terms" className="text-gray-500 hover:text-brand-blue transition">Terms</a>
                            <a href="/privacy" className="text-gray-500 hover:text-brand-blue transition font-medium">Privacy</a>
                            <a href="/contact" className="text-gray-500 hover:text-brand-blue transition">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
