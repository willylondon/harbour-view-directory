export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-16 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col gap-1">
                    <div className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Harbour View Digital Directory. Built for our community.
                    </div>
                    <div className="text-xs text-brand-blue/60 font-medium tracking-wide">
                        done by willy london
                    </div>
                </div>
                <div className="flex gap-4 text-sm font-medium text-gray-600">
                    <a href="#" className="hover:text-brand-blue transition">Terms</a>
                    <a href="#" className="hover:text-brand-blue transition">Privacy</a>
                    <a href="#" className="hover:text-brand-blue transition">Contact</a>
                </div>
            </div>
        </footer>
    );
}
