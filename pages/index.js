import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/VendorCard';
import { supabase } from '../lib/supabase';
import {
    applyPublicRentalFilters,
    applyPublicVendorFilters,
    filterPublicRentals,
    filterPublicVendors,
    PUBLIC_RENTAL_COLUMNS,
    PUBLIC_VENDOR_COLUMNS,
} from '../lib/publicDirectory';

const QUICK_CHIPS = [
    { label: 'Find Food', href: '/directory?q=food' },
    { label: 'Find Taxi', href: '/directory?q=taxi' },
    { label: 'Find Pharmacy', href: '/directory?q=pharmacy' },
    { label: 'Rooms & Rentals', href: '/rent-near-cmu' },
    { label: 'Report Info', href: '/report' },
];

const QUICK_ACTIONS = [
    { label: 'Food', icon: '🍽️', href: '/directory?q=food', hint: 'Restaurants, cook shops, lunch' },
    { label: 'Taxi', icon: '🚕', href: '/directory?q=taxi', hint: 'Transport and local rides' },
    { label: 'Pharmacy', icon: '⚕️', href: '/directory?q=pharmacy', hint: 'Health and pharmacy listings' },
    { label: 'ATM', icon: '🏧', href: '/directory?q=atm', hint: 'Cash, banking, bill pay' },
    { label: 'Laundry', icon: '🧺', href: '/directory?q=laundry', hint: 'Wash, dry, cleaning' },
    { label: 'Mechanic', icon: '🔧', href: '/directory?q=mechanic', hint: 'Auto repairs and parts' },
    { label: 'Rooms', icon: '🏠', href: '/rent-near-cmu', hint: 'Rooms and rentals near CMU' },
    { label: 'Emergency / Safety', icon: '🚨', href: '/safety', hint: 'Notices and key contacts' },
];

const FOOD_SHORTCUTS = [
    'Chinese',
    'Cook Shop',
    'Jerk',
    'Fried Chicken',
    'Patty',
    'Bakery',
    'Lunch',
    'Seafood',
];

const COMMUNITY_NOTICES = [
    { title: 'Lost & Found', icon: '🔎', desc: 'Report missing items, pets, or found property.' },
    { title: 'Road / Traffic', icon: '🚧', desc: 'Community road, commute, and traffic updates.' },
    { title: 'Water / Electricity', icon: '💧', desc: 'Service interruption notes and local updates.' },
    { title: 'Safety Notices', icon: '🛡️', desc: 'Scam warnings and safety information.' },
    { title: 'Events', icon: '📅', desc: 'Markets, church events, workshops, and meetups.' },
    { title: 'Rental Alerts', icon: '🏘️', desc: 'New rooms and available housing leads.' },
];

const HELP_CTAS = [
    { label: 'Submit a Business', href: '/post-ad', icon: '➕' },
    { label: 'Claim a Listing', href: '/post-ad', icon: '🏷️' },
    { label: 'Report Wrong Info', href: '/report', icon: '⚑' },
    { label: 'Submit a Rental', href: '/rent-near-cmu/submit', icon: '🏠' },
];

function formatJamaicaTime(date = new Date()) {
    return new Intl.DateTimeFormat('en-JM', {
        timeZone: 'America/Jamaica',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        weekday: 'short',
    }).format(date);
}

export async function getServerSideProps() {
    try {
        const { data: featuredVendors } = await applyPublicVendorFilters(
            supabase
                .from('vendors')
                .select(PUBLIC_VENDOR_COLUMNS)
        )
            .order('is_top_ad', { ascending: false })
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(8);

        const { data: recentVendors } = await applyPublicVendorFilters(
            supabase
                .from('vendors')
                .select(PUBLIC_VENDOR_COLUMNS)
        )
            .order('created_at', { ascending: false })
            .limit(4);

        const { data: rentals } = await applyPublicRentalFilters(
            supabase
                .from('rentals')
                .select(PUBLIC_RENTAL_COLUMNS)
        )
            .order('created_at', { ascending: false })
            .limit(3);

        return {
            props: {
                featuredVendors: filterPublicVendors(featuredVendors || []),
                recentVendors: filterPublicVendors(recentVendors || []),
                rentals: filterPublicRentals(rentals || []),
            },
        };
    } catch (err) {
        console.error('Homepage SSR error:', err.message);
        return { props: { featuredVendors: [], recentVendors: [], rentals: [] } };
    }
}

export default function Home({ featuredVendors, recentVendors, rentals }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [jamaicaTime, setJamaicaTime] = useState('Loading local time...');

    useEffect(() => {
        setJamaicaTime(formatJamaicaTime());
        const timer = setInterval(() => setJamaicaTime(formatJamaicaTime()), 30000);
        return () => clearInterval(timer);
    }, []);

    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/directory?q=${encodeURIComponent(searchQuery.trim())}`;
        }
    }

    const businessPreview = featuredVendors.length ? featuredVendors : recentVendors;

    return (
        <div className="min-h-screen bg-[#08111f] text-white">
            <Head>
                <title>Harbour View Directory — Kingston 17 Community Portal</title>
                <meta name="description" content="Find businesses, rooms, food, services, deals, and community notices in Harbour View, Kingston 17." />
                <meta property="og:title" content="Harbour View Directory — Kingston 17 Community Portal" />
                <meta property="og:description" content="Businesses, rooms, food, services, deals, and community notices in one local Harbour View portal." />
                <meta property="og:url" content="https://harbourviewdirectory.online" />
                <meta property="og:image" content="https://harbourviewdirectory.online/hero.png" />
                <link rel="canonical" href="https://harbourviewdirectory.online" />
                <link rel="preload" as="image" href="/hero.webp" type="image/webp" media="(min-width: 769px)" />
                <link rel="preload" as="image" href="/hero-mobile.webp" type="image/webp" media="(max-width: 768px)" />
            </Head>

            <Navbar />

            <main className="overflow-hidden">
                <section className="relative px-6 pb-10 pt-12 md:pb-20 md:pt-20">
                    <picture>
                        <source srcSet="/hero.webp" type="image/webp" media="(min-width: 769px)" />
                        <source srcSet="/hero-mobile.webp" type="image/webp" media="(max-width: 768px)" />
                        <img
                            src="/hero.png"
                            alt="Aerial view of Harbour View, Kingston Jamaica at golden hour"
                            className="absolute inset-0 h-full w-full object-cover opacity-45"
                            style={{ objectPosition: 'center 40%' }}
                            fetchPriority="high"
                            decoding="async"
                            width="1536"
                            height="1024"
                        />
                    </picture>
                    <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(circle at 78% 18%, rgba(245,158,11,0.32), transparent 32%), linear-gradient(135deg, rgba(8,17,31,0.96) 0%, rgba(11,37,69,0.92) 48%, rgba(3,105,161,0.72) 100%)',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)',
                            backgroundSize: '30px 30px',
                        }}
                    />

                    <div className="container-premium relative z-10">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.72fr)] lg:items-end">
                            <div className="max-w-3xl pt-6 md:pt-10">
                                <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-sky-100 backdrop-blur">
                                    Harbour View · Kingston 17
                                </p>
                                <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white md:text-6xl lg:text-7xl">
                                    Find what you need in Harbour View.
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 md:text-xl">
                                    Businesses, rooms, food, services, deals, and community notices — built for Kingston 17.
                                </p>

                                <form onSubmit={handleSearch} className="mt-8 max-w-2xl rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl shadow-sky-950/40 backdrop-blur-xl">
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <label className="sr-only" htmlFor="portal-search">Search Harbour View Directory</label>
                                        <input
                                            id="portal-search"
                                            type="text"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Search food, taxi, pharmacy, rooms..."
                                            className="min-h-12 flex-1 rounded-xl border border-white/10 bg-white px-4 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-400/20"
                                        />
                                        <button type="submit" className="min-h-12 rounded-xl bg-amber-400 px-6 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300">
                                            Search
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-5 flex flex-wrap gap-2">
                                    {QUICK_CHIPS.map(chip => (
                                        <Link key={chip.label} href={chip.href} className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white/90 transition hover:border-amber-300/70 hover:bg-amber-300/15">
                                            {chip.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <aside className="rounded-[2rem] border border-white/15 bg-slate-950/62 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Harbour View Today</p>
                                        <h2 className="mt-2 text-2xl font-black text-white">{jamaicaTime}</h2>
                                    </div>
                                    <span className="rounded-2xl bg-sky-400/15 px-3 py-2 text-2xl">🌦️</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                                        <p className="text-xs font-semibold text-slate-400">Weather</p>
                                        <p className="mt-2 text-lg font-black text-white">Coming next</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-400">Weather will appear here when the safe API route is added.</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                                        <p className="text-xs font-semibold text-slate-400">Rain chance</p>
                                        <p className="mt-2 text-lg font-black text-white">Unavailable</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-400">The card stays useful even when weather is unavailable.</p>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-2">
                                    {QUICK_CHIPS.map(chip => (
                                        <Link key={chip.label} href={chip.href} className="rounded-xl bg-white px-3 py-2 text-center text-xs font-black text-slate-950 transition hover:bg-amber-300">
                                            {chip.label}
                                        </Link>
                                    ))}
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>

                <section className="bg-[#0b1526] px-6 py-8">
                    <div className="container-premium">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                            {QUICK_ACTIONS.map(action => (
                                <Link key={action.label} href={action.href} className="group rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-sky-300/50 hover:bg-white/[0.09]">
                                    <div className="mb-3 text-3xl">{action.icon}</div>
                                    <h3 className="font-black text-white">{action.label}</h3>
                                    <p className="mt-1 hidden text-xs leading-5 text-slate-400 sm:block">{action.hint}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-6 py-16 text-slate-950 md:py-20">
                    <div className="container-premium">
                        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                            <div className="rounded-[2rem] bg-[#0b2545] p-6 text-white shadow-2xl shadow-slate-900/20 md:p-8">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Rooms & Rentals</p>
                                <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">Housing near CMU and East Kingston work hubs.</h2>
                                <p className="mt-4 text-sm leading-7 text-slate-200 md:text-base">
                                    Rooms, studios, apartments, and houses for CMU students, port workers, dry dock workers, construction workers, and people relocating to East Kingston.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link href="/rent-near-cmu/submit?type=Room" className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300">List a Room</Link>
                                    <Link href="/rent-near-cmu" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-[#0b2545] transition hover:bg-sky-50">Find Rentals</Link>
                                    <a href="https://wa.me/18767978034?text=Please%20add%20me%20to%20Harbour%20View%20rental%20alerts." target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">Join Rental Alerts</a>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                {rentals.length > 0 ? rentals.map(rental => (
                                    <Link key={rental.id} href={`/rent-near-cmu/${rental.slug || rental.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 transition hover:-translate-y-1 hover:border-sky-300">
                                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">{rental.type}</span>
                                        <h3 className="mt-4 line-clamp-2 text-lg font-black text-slate-950">{rental.title}</h3>
                                        <p className="mt-2 text-xs font-semibold text-slate-500">{rental.location || 'Harbour View area'}</p>
                                        {rental.price && <p className="mt-4 text-xl font-black text-[#0b2545]">J${rental.price.toLocaleString()}<span className="text-xs font-semibold text-slate-500">/mo</span></p>}
                                    </Link>
                                )) : (
                                    <div className="md:col-span-3 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xl shadow-slate-200/70">
                                        <div className="text-5xl">🏠</div>
                                        <h3 className="mt-4 text-xl font-black text-slate-950">Rooms and rentals are being added now.</h3>
                                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Landlords can submit rooms, studios, apartments, and houses. Exact home addresses stay private by default.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white px-6 py-16 text-slate-950 md:py-20">
                    <div className="container-premium">
                        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-600">Featured Local Businesses</p>
                                <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Useful places, reviewed for the community.</h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Curated and recently added listings from the public Harbour View directory.</p>
                            </div>
                            <Link href="/directory" className="text-sm font-black text-sky-700 hover:text-sky-900">View all businesses →</Link>
                        </div>

                        <div className="mb-5 flex flex-wrap gap-2">
                            {['Verified', 'Community Pick', 'Recently Added', 'Owner Claimed'].map(badge => (
                                <span key={badge} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-600">{badge}</span>
                            ))}
                        </div>

                        {businessPreview.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                                {businessPreview.slice(0, 8).map(vendor => (
                                    <ListingCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                                <div className="text-5xl">🏪</div>
                                <h3 className="mt-3 text-xl font-black">No public listings yet</h3>
                                <p className="mt-2 text-sm text-slate-500">Approved businesses will appear here once available.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="bg-[#0b1526] px-6 py-16 md:py-20">
                    <div className="container-premium">
                        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Hungry in Harbour View</p>
                                <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">Jump straight to food.</h2>
                                <p className="mt-3 text-sm leading-7 text-slate-400">Fast shortcuts for the searches people actually make when lunch, dinner, or a snack is urgent.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {FOOD_SHORTCUTS.map(item => (
                                    <Link key={item} href={`/directory?q=${encodeURIComponent(item)}`} className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 text-center text-sm font-black text-white transition hover:-translate-y-1 hover:border-amber-300/60 hover:bg-amber-300/15">
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 px-6 py-16 text-slate-950 md:py-20">
                    <div className="container-premium">
                        <div className="mb-8 max-w-2xl">
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">Community Notices</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">A cleaner place for local updates.</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">Admin-approved notices will live here. For now, these channels are ready for community submissions.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {COMMUNITY_NOTICES.map(notice => (
                                <Link key={notice.title} href={notice.title === 'Events' ? '/events' : notice.title === 'Safety Notices' ? '/safety' : '/report'} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 transition hover:-translate-y-1 hover:border-sky-300">
                                    <div className="text-3xl">{notice.icon}</div>
                                    <h3 className="mt-4 text-lg font-black">{notice.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">{notice.desc}</p>
                                    <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">No active public notice</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#08111f] px-6 py-16 text-white md:py-20">
                    <div className="container-premium">
                        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b2545] to-[#0369a1] p-6 shadow-2xl shadow-black/30 md:p-10">
                            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Help Build the Directory</p>
                                    <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Community-built means community-corrected.</h2>
                                    <p className="mt-3 text-sm leading-7 text-sky-50/80">Soft launch is for finding missing businesses, correcting phone numbers, claiming listings, and adding rentals.</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {HELP_CTAS.map(cta => (
                                        <Link key={cta.label} href={cta.href} className="rounded-2xl border border-white/15 bg-white px-4 py-4 text-sm font-black text-[#0b2545] transition hover:-translate-y-1 hover:bg-amber-300">
                                            <span className="mr-2">{cta.icon}</span>
                                            {cta.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
