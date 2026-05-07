import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CONTACT_MAILTO } from '../lib/siteConfig';

const EMERGENCY_CONTACTS = [
    { label: 'Police (Emergency)', number: '119', href: 'tel:119', icon: '👮' },
    { label: 'Fire Brigade', number: '110', href: 'tel:110', icon: '🚒' },
    { label: 'Ambulance / NEMS', number: '110', href: 'tel:110', icon: '🚑' },
    { label: 'HV Police Station', number: '876-922-1492', href: 'tel:8769221492', icon: '🚔' },
];

const NOTICE_TYPES = [
    { emoji: '🚗', label: 'Road & Traffic Alerts', desc: 'Road closures, potholes, flooding, and traffic updates affecting Harbour View and surroundings.' },
    { emoji: '⚠️', label: 'Scam Warnings', desc: 'Local scam alerts, fraud warnings, and suspicious activity notices from community members.' },
    { emoji: '🔍', label: 'Lost & Found', desc: 'Missing persons, lost pets, found items, and reunification notices for the Harbour View community.' },
    { emoji: '📢', label: 'Community Notices', desc: 'Important updates, meeting announcements, and notices from community organizations.' },
];

export default function SafetyPage() {
    return (
        <div className="min-h-screen bg-bg">
            <Head>
                <title>Safety Notices — Harbour View | Harbour View Directory</title>
                <meta name="description" content="Community safety notices, emergency contacts, road alerts, scam warnings, lost and found, and urgent updates for Harbour View, Kingston Jamaica." />
                <meta property="og:title" content="Harbour View Safety Notices | Harbour View Directory" />
                <meta property="og:description" content="Emergency contacts, road alerts, scam warnings, lost & found, and community safety notices for Harbour View, Kingston." />
                <link rel="canonical" href="https://harbourviewdirectory.online/safety" />
            </Head>
            <Navbar />

            <main>
                {/* Hero */}
                <section className="bg-gradient-to-br from-red-700 to-red-500 pt-28 pb-16 px-6 text-center text-white">
                    <div className="container-premium max-w-2xl">
                        <span className="inline-block bg-white/20 backdrop-blur-sm text-sm font-medium px-4 py-1.5 rounded-full mb-5">🚨 Community Safety</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Harbour View Safety Notices</h1>
                        <p className="text-lg text-white/85 mb-8">
                            Community safety alerts, emergency contacts, road updates, scam warnings, and urgent local notices.
                            In a genuine emergency, always call 119 first.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a
                                href={`https://wa.me/18767978034?text=I+want+to+report+a+safety+notice+for+Harbour+View.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-red-700 font-bold px-8 py-3.5 rounded-btn hover:bg-gray-50 transition shadow-lg"
                            >
                                🚨 Report a Safety Notice
                            </a>
                            <Link href="/contact" className="bg-transparent border-2 border-white/40 text-white font-bold px-8 py-3.5 rounded-btn hover:bg-white/10 transition">
                                Contact Admin
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Emergency Disclaimer */}
                <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                    <div className="container-premium max-w-3xl flex items-start gap-3">
                        <span className="text-2xl shrink-0">🚨</span>
                        <p className="text-red-800 text-sm font-medium">
                            <strong>In any emergency, call 119 (Police) or 110 (Fire/Ambulance) immediately.</strong>{' '}
                            This page provides community information only — it is not a substitute for official emergency services.
                        </p>
                    </div>
                </div>

                {/* Emergency Contacts */}
                <section className="section-spacing px-6">
                    <div className="container-premium">
                        <h2 className="text-2xl font-extrabold text-text mb-6">Emergency Contacts</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {EMERGENCY_CONTACTS.map(contact => (
                                <a
                                    key={contact.label}
                                    href={contact.href}
                                    className="card-premium p-5 flex flex-col items-center text-center hover:border-red-300 hover:shadow-md transition group"
                                >
                                    <span className="text-4xl mb-3">{contact.icon}</span>
                                    <span className="font-bold text-text text-sm mb-1">{contact.label}</span>
                                    <span className="text-2xl font-extrabold text-red-600 group-hover:text-red-700">{contact.number}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Notice Categories */}
                <section className="section-spacing bg-surface border-y border-border px-6">
                    <div className="container-premium">
                        <h2 className="text-2xl font-extrabold text-text mb-2">Notice Categories</h2>
                        <p className="text-text-soft mb-8">Community-submitted safety notices by type.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {NOTICE_TYPES.map(type => (
                                <div key={type.label} className="card-premium p-6 flex gap-4 items-start">
                                    <span className="text-4xl shrink-0">{type.emoji}</span>
                                    <div>
                                        <h3 className="font-bold text-text mb-1">{type.label}</h3>
                                        <p className="text-sm text-text-soft leading-relaxed">{type.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Empty State */}
                <section className="section-spacing px-6">
                    <div className="container-premium max-w-2xl text-center">
                        <div className="text-6xl mb-5">✅</div>
                        <h2 className="text-2xl font-extrabold text-text mb-3">No Active Safety Notices</h2>
                        <p className="text-text-soft mb-8 leading-relaxed">
                            There are no active community safety notices at this time. If you have something important to report —
                            a scam warning, road hazard, lost person, or urgent community notice — submit it below.
                            All notices are reviewed before publishing.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href={`https://wa.me/18767978034?text=I+want+to+report+a+safety+notice+for+Harbour+View.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 text-white font-bold px-8 py-3.5 rounded-btn hover:bg-red-700 transition shadow-sm"
                            >
                                🚨 Submit Safety Notice
                            </a>
                            <a
                                href={`${CONTACT_MAILTO}?subject=Safety Notice`}
                                className="bg-bg-alt text-text font-bold px-8 py-3.5 rounded-btn hover:bg-border transition border border-border"
                            >
                                📧 Email Admin
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
