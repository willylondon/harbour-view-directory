import Link from 'next/link';
import { CONTACT_EMAIL } from '../lib/siteConfig';

export default function Footer() {
    return (
        <footer className="bg-text text-white py-16 px-6">
            <div className="container-premium">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    <div>
                        <h4 className="font-bold mb-4">Explore</h4>
                        <ul className="space-y-2.5 text-sm text-white/60">
                            <li><Link href="/" className="hover:text-white transition">Directory</Link></li>
                            <li><Link href="/rent-near-cmu" className="hover:text-white transition">Rooms &amp; Rentals</Link></li>
                            <li><Link href="/deals" className="hover:text-white transition">Deals</Link></li>
                            <li><Link href="/safety" className="hover:text-white transition">Safety</Link></li>
                            <li><Link href="/events" className="hover:text-white transition">Events</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                            <li><Link href="/post-ad" className="hover:text-white transition">List Business</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2.5 text-sm text-white/60">
                            <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
                            <li><Link href="/report" className="hover:text-white transition">Report a Listing</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                            <li><Link href="/listing-guidelines" className="hover:text-white transition">Listing Guidelines</Link></li>
                            <li>
                                <a
                                    href="https://wa.me/18767978034"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition"
                                >
                                    WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Trust & Policy</h4>
                        <ul className="space-y-2.5 text-sm text-white/60">
                            <li><Link href="/verification" className="hover:text-white transition">Verification Policy</Link></li>
                            <li><Link href="/listing-guidelines" className="hover:text-white transition">Listing Guidelines</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Harbour View Directory</h4>
                        <p className="text-sm text-white/60 leading-relaxed">
                            The trusted community marketplace for Harbour View, Kingston Jamaica. Connecting local businesses with the community.
                        </p>
                        <p className="text-sm text-white/40 mt-4">
                            📧 {CONTACT_EMAIL}
                        </p>
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-white/40">
                    <p>© {new Date().getFullYear()} Harbour View Directory. Built for our community.</p>
                    <p>Harbour View, Kingston, Jamaica 🇯🇲</p>
                </div>
            </div>
        </footer>
    );
}
