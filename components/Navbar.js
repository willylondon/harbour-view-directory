import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    return (
        <header className="bg-brand-blue text-white py-4 px-6 fixed w-full top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 border-2 border-brand-yellow shadow-sm group-hover:scale-105 transition-transform">
                            <Image
                                src="https://tmssl.akamaized.net/images/wappen/normquad/11090.png"
                                alt="HVFC Logo"
                                fill
                                className="object-contain p-0.5"
                                unoptimized
                            />
                        </div>
                        <h1 className="text-2xl font-bold group-hover:text-blue-100 transition tracking-tight">
                            Harbour View
                        </h1>
                    </div>
                </Link>
                <nav className="hidden md:flex gap-6 font-medium items-center">
                    <Link href="/">
                        <span className="cursor-pointer hover:text-brand-yellow transition">Directory</span>
                    </Link>
                    <Link href="/dashboard">
                        <span className="cursor-pointer hover:text-brand-blue bg-brand-yellow text-gray-900 px-5 py-2 rounded-md transition font-bold shadow-sm">Post Ad</span>
                    </Link>
                    <Link href="/login">
                        <span className="cursor-pointer bg-white text-brand-blue px-5 py-2 rounded-md hover:bg-gray-100 transition shadow-sm font-bold">Login</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
