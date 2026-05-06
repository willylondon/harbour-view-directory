import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-text text-white py-16 px-6">
            <div className="container-premium">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
                    <div>
                        <h4 className="font-bold mb-4">Explore</h4>
                        <ul className="space-y-2.5 text-sm text-white/60">
                            <li><Link href="/" className="hover:text-white transition">Directory</Link></li>
                            <li><Link href="/events" className="hover:text-white transition">Events</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                            <li><Link href="/post-ad" className="hover:text-white transition">List Business</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Support</h4>
                        <ul className="space-y-2.5 text-sm text-white/60">
                            <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
                            <li><a href="https://wa.me/18765550100" target="_blank" rel="noopener" className="hover:text-white transition">WhatsApp</a></li>
                            <li><span className="cursor-default">FAQ</span></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2.5 text-sm text-white/60">
                            <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Harbour View Directory</h4>
                        <p className="text-sm text-white/60 leading-relaxed">
                            The trusted community marketplace for Harbour View, Kingston Jamaica. Connecting local businesses with the community.
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
