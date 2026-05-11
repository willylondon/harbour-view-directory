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

const LOCAL_SEARCH_GROUPS = [
    { title: 'Lunch in Harbour View', desc: 'Cook shops, patties, jerk, seafood, and quick bites.', queries: ['Lunch', 'Patty', 'Jerk'] },
    { title: 'Errands on the strip', desc: 'Laundry, ATM, pharmacy, and everyday services.', queries: ['Laundry', 'ATM', 'Pharmacy'] },
    { title: 'Getting around Kingston 17', desc: 'Taxi, mechanic, auto parts, and transport help.', queries: ['Taxi', 'Mechanic', 'Auto'] },
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
    { label: 'List your business free', href: '/post-ad', icon: '➕' },
    { label: 'Claim a Listing', href: '/post-ad', icon: '🏷️' },
    { label: 'Report Wrong Info', href: '/report', icon: '⚑' },
    { label: 'Submit a Rental', href: '/rent-near-cmu/submit', icon: '🏠' },
];

const TRUST_POINTS = ['Community-built', 'Locally reviewed', 'Report wrong info anytime', 'List your business free'];

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
    const featuredPick = businessPreview[0];
    const featuredPicks = businessPreview.slice(0, 4);
    const newThisWeek = recentVendors.slice(0, 4);

    return (
        <div className="min-h-screen bg-[#08111f] text-white">
            <Head>
                <title>Harbour View Directory — Kingston 17 Community Portal</title>
                <meta name="description" content="Harbour View, all in one place. Find trusted local businesses, rooms, food, services, and community updates across Harbour View and Kingston 17." />
                <meta property="og:title" content="Harbour View Directory — Kingston 17 Community Portal" />
                <meta property="og:description" content="Businesses, rooms, food, services, deals, and community notices in one local Harbour View portal." />
                <meta property="og:url" content="https://harbourviewdirectory.online" />
                <meta property="og:image" content="https://harbourviewdirectory.online/hero.png" />
                <link rel="canonical" href="https://harbourviewdirectory.online" />
                <link rel="preload" as="image" href="/hero.webp" type="image/webp" media="(min-width: 769px)" />
                <link rel="preload" as="image" href="/hero-mobile.webp" type="image/webp" media="(max-width: 768px)" />
            </Head>

            <Navbar />

            <main className="overflow-hidden bg-[#07101d]">
                <section className="relative isolate px-6 pb-28 pt-14 md:pb-32 md:pt-24">
                    <picture>
                        <source srcSet="/hero.webp" type="image/webp" media="(min-width: 769px)" />
                        <source srcSet="/hero-mobile.webp" type="image/webp" media="(max-width: 768px)" />
                        <img
                            src="/hero.png"
                            alt="Aerial view of Harbour View, Kingston Jamaica at golden hour"
                            className="absolute inset-0 h-full w-full object-cover opacity-60"
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
                                'radial-gradient(circle at 78% 16%, rgba(245,158,11,0.30), transparent 28%), radial-gradient(circle at 12% 88%, rgba(14,165,233,0.28), transparent 30%), linear-gradient(128deg, rgba(3,7,18,0.98) 0%, rgba(8,17,31,0.94) 42%, rgba(7,50,82,0.84) 100%)',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-[0.18]"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                            backgroundSize: '44px 44px',
                        }}
                    />
                    <div aria-hidden="true" className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
                    <div aria-hidden="true" className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />

                    <div className="container-premium relative z-10">
                        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.64fr)] lg:items-center">
                            <div className="max-w-4xl pt-4 md:pt-8">
                                <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white md:text-7xl lg:text-8xl">
                                    Harbour View, all in one place.
                                </h1>
                                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200/90 md:text-xl">
                                    Find trusted local businesses, rooms, food, services, and community updates across Harbour View and Kingston 17.
                                </p>

                                <form onSubmit={handleSearch} className="mt-9 max-w-2xl rounded-[1.6rem] bg-white/[0.11] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.38)] ring-1 ring-white/10 backdrop-blur-2xl">
                                    <div className="flex flex-col gap-2 rounded-[1.2rem] bg-slate-950/45 p-1.5 shadow-inner shadow-white/5 sm:flex-row sm:items-center">
                                        <label className="sr-only" htmlFor="portal-search">Search Harbour View Directory</label>
                                        <div className="flex min-h-[3.25rem] flex-1 items-center gap-3 rounded-[1rem] bg-white px-4 text-slate-950">
                                            <span className="text-slate-400" aria-hidden="true">⌕</span>
                                            <input
                                                id="portal-search"
                                                type="text"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                placeholder="Try lunch, taxi, pharmacy, rooms..."
                                                className="min-h-12 flex-1 bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                                            />
                                        </div>
                                        <button type="submit" className="min-h-12 rounded-[1rem] bg-gradient-to-r from-amber-300 to-amber-500 px-7 text-sm font-black text-slate-950 shadow-[0_14px_35px_rgba(245,158,11,0.28)] transition hover:translate-y-[-1px] hover:from-amber-200 hover:to-amber-400">
                                            Search
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {QUICK_CHIPS.map(chip => (
                                        <Link key={chip.label} href={chip.href} className="rounded-full bg-white/[0.09] px-4 py-2 text-xs font-bold text-white/90 shadow-inner shadow-white/5 backdrop-blur transition hover:bg-amber-300/15 hover:text-amber-100">
                                            {chip.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <aside className="relative overflow-hidden rounded-[2.2rem] bg-white/[0.08] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.42)] ring-1 ring-white/10 backdrop-blur-2xl md:p-7 lg:translate-y-10">
                                <div aria-hidden="true" className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-300/15 blur-2xl" />
                                <div aria-hidden="true" className="absolute -bottom-20 left-6 h-40 w-40 rounded-full bg-amber-300/10 blur-2xl" />
                                <div className="relative flex items-start justify-between gap-5">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">Harbour View Today</p>
                                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">{jamaicaTime}</h2>
                                        <p className="mt-2 text-sm font-semibold text-sky-100/80">Kingston 17 local time</p>
                                    </div>
                                    <span className="rounded-full bg-white/10 px-3 py-2 text-2xl shadow-inner shadow-white/10" aria-hidden="true">🇯🇲</span>
                                </div>
                                <div className="relative mt-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <p className="relative mt-6 max-w-sm text-sm leading-7 text-slate-200/82">
                                    Start with food, rooms near CMU, trusted services, or a correction that helps the next neighbour.
                                </p>
                                <div className="relative mt-7 space-y-3 text-sm">
                                    {featuredPick && (
                                        <Link href={`/vendor/${featuredPick.slug || featuredPick.id}`} className="block rounded-2xl bg-white/[0.08] px-4 py-3 text-slate-100 transition hover:bg-white/[0.13]">
                                            <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">Local pick</span>
                                            <span className="mt-1 block truncate font-black">{featuredPick.business_name}</span>
                                        </Link>
                                    )}
                                    <Link href="/rent-near-cmu" className="block rounded-2xl bg-white/[0.08] px-4 py-3 text-slate-100 transition hover:bg-white/[0.13]">
                                        <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">Rentals</span>
                                        <span className="mt-1 block font-black">Rooms near CMU and East Kingston</span>
                                    </Link>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 -mt-16 px-6 pb-14">
                    <div className="container-premium">
                        <div className="grid grid-cols-2 gap-3 rounded-[2rem] bg-white/[0.055] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.36)] ring-1 ring-white/10 backdrop-blur-2xl sm:grid-cols-4 lg:grid-cols-8">
                            {QUICK_ACTIONS.map(action => (
                                <Link key={action.label} href={action.href} className="group rounded-[1.45rem] bg-white/[0.07] p-4 transition hover:-translate-y-1 hover:bg-white/[0.12]">
                                    <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/35 text-2xl shadow-inner shadow-white/5">{action.icon}</div>
                                        <h3 className="text-sm font-black text-white">{action.label}</h3>
                                    <p className="mt-1 hidden text-xs leading-5 text-slate-400/90 sm:block">{action.hint}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef4f8_100%)] px-6 py-20 text-slate-950 md:py-24">
                    <div className="container-premium">
                        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                            <div className="relative overflow-hidden rounded-[2.4rem] bg-[#071f3b] p-7 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] md:p-10">
                                <div aria-hidden="true" className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
                                <div aria-hidden="true" className="absolute -bottom-24 left-12 h-56 w-56 rounded-full bg-amber-300/12 blur-3xl" />
                                <p className="relative text-[11px] font-black uppercase tracking-[0.26em] text-amber-300">Rooms & Rentals</p>
                                <h2 className="relative mt-4 text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">A better rental lane for Kingston 17.</h2>
                                <p className="relative mt-5 text-sm leading-8 text-slate-200/88 md:text-base">
                                    Rooms, studios, apartments, and houses for CMU students, port workers, dry dock workers, construction workers, and people relocating to East Kingston.
                                </p>
                                <div className="relative mt-8 flex flex-wrap gap-3">
                                    <Link href="/rent-near-cmu/submit?type=Room" className="rounded-full bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_14px_35px_rgba(245,158,11,0.24)] transition hover:bg-amber-300">List a Room</Link>
                                    <Link href="/rent-near-cmu" className="rounded-full bg-white/95 px-6 py-3 text-sm font-black text-[#0b2545] transition hover:bg-sky-50">Find Rentals</Link>
                                    <a href="https://wa.me/18767978034?text=Please%20add%20me%20to%20Harbour%20View%20rental%20alerts." target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/[0.08] px-6 py-3 text-sm font-black text-white ring-1 ring-white/12 transition hover:bg-white/14">Join Rental Alerts</a>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                {rentals.length > 0 ? rentals.map(rental => (
                                    <Link key={rental.id} href={`/rent-near-cmu/${rental.slug || rental.id}`} className="rounded-[1.8rem] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] transition hover:-translate-y-1">
                                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">{rental.type}</span>
                                        <h3 className="mt-4 line-clamp-2 text-lg font-black text-slate-950">{rental.title}</h3>
                                        <p className="mt-2 text-xs font-semibold text-slate-500">{rental.location || 'Harbour View area'}</p>
                                        {rental.price && <p className="mt-4 text-xl font-black text-[#0b2545]">J${rental.price.toLocaleString()}<span className="text-xs font-semibold text-slate-500">/mo</span></p>}
                                    </Link>
                                )) : (
                                    <div className="md:col-span-3 rounded-[2rem] bg-white/88 p-9 text-center shadow-[0_24px_80px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5">
                                        <div className="text-5xl">🏠</div>
                                        <h3 className="mt-4 text-xl font-black text-slate-950">Rooms and rentals are being added now.</h3>
                                        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Landlords can submit rooms, studios, apartments, and houses. Exact home addresses stay private by default.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[#fbfcfd] px-6 py-20 text-slate-950 md:py-24">
                    <div className="container-premium">
                        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-amber-600">Featured Local Picks</p>
                                <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] md:text-5xl">Places the community should be able to find fast.</h2>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">A tighter edit of useful Harbour View listings, from Seashore Place to Everest Drive and Nautilus Avenue.</p>
                            </div>
                            <Link href="/directory" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(15,23,42,0.16)] transition hover:bg-sky-800">View all businesses →</Link>
                        </div>

                        <div className="mb-7 flex flex-wrap gap-2">
                            {['Verified', 'Community Pick', 'Recently Added', 'Owner Claimed'].map(badge => (
                                <span key={badge} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-black text-slate-600 shadow-inner shadow-white">{badge}</span>
                            ))}
                        </div>

                        {businessPreview.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                                {featuredPicks.map(vendor => (
                                    <ListingCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[2rem] bg-slate-50 p-10 text-center shadow-inner shadow-white ring-1 ring-slate-900/5">
                                <div className="text-5xl">🏪</div>
                                <h3 className="mt-3 text-xl font-black">No public listings yet</h3>
                                <p className="mt-2 text-sm text-slate-500">Approved businesses will appear here once available.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="relative overflow-hidden bg-[#07101d] px-6 py-20 md:py-24">
                    <div aria-hidden="true" className="absolute left-[-12rem] top-10 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
                    <div className="container-premium">
                        <div className="relative grid gap-10 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-amber-300">Popular in Harbour View</p>
                                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">Lunch, errands, repairs, and a way home.</h2>
                                <p className="mt-4 text-sm leading-7 text-slate-400">Shortcuts for the searches that make a local portal feel useful on an ordinary day.</p>
                            </div>
                            <div className="space-y-4">
                                {LOCAL_SEARCH_GROUPS.map(group => (
                                    <div key={group.title} className="rounded-[1.8rem] bg-white/[0.075] p-5 shadow-inner shadow-white/5">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="text-lg font-black text-white">{group.title}</h3>
                                                <p className="mt-1 text-sm leading-6 text-slate-400">{group.desc}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {group.queries.map(item => (
                                                    <Link key={item} href={`/directory?q=${encodeURIComponent(item)}`} className="rounded-full bg-white/[0.08] px-4 py-2 text-xs font-black text-white transition hover:bg-amber-300/15 hover:text-amber-100">
                                                        {item}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[#fbfcfd] px-6 py-20 text-slate-950 md:py-24">
                    <div className="container-premium">
                        <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:items-start">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-sky-700">New This Week</p>
                                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">Fresh additions without the duplicate grid.</h2>
                                <p className="mt-4 text-sm leading-7 text-slate-500">Recently added records are shown as a compact local log so the homepage has rhythm, not another wall of cards.</p>
                            </div>
                            <div className="divide-y divide-slate-200/80 rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5">
                                {newThisWeek.length > 0 ? newThisWeek.map(vendor => (
                                    <Link key={vendor.id} href={`/vendor/${vendor.slug || vendor.id}`} className="grid gap-3 px-6 py-5 transition hover:bg-slate-50 md:grid-cols-[1fr_auto] md:items-center">
                                        <div>
                                            <h3 className="font-black text-slate-950">{vendor.business_name}</h3>
                                            <p className="mt-1 text-sm text-slate-500">{vendor.category || 'Local business'} · {vendor.address || 'Local Harbour View business — address not listed'}</p>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">View</span>
                                    </Link>
                                )) : (
                                    <div className="px-6 py-8 text-sm text-slate-500">New approved listings will appear here after review.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[linear-gradient(180deg,#eef4f8_0%,#f8fafc_100%)] px-6 py-20 text-slate-950 md:py-24">
                    <div className="container-premium">
                        <div className="mb-10 max-w-2xl">
                            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-sky-700">Community Notices</p>
                            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">Notices without the group-chat chaos.</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-500">Lost items, road issues, water and electricity updates, safety notes, events, and rental alerts can live here once approved.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {COMMUNITY_NOTICES.map(notice => (
                                <Link key={notice.title} href={notice.title === 'Events' ? '/events' : notice.title === 'Safety Notices' ? '/safety' : '/report'} className="group rounded-[1.8rem] bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 transition hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(14,165,233,0.13)]">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl transition group-hover:bg-sky-50">{notice.icon}</div>
                                    <h3 className="mt-5 text-lg font-black">{notice.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">{notice.desc}</p>
                                    <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">No active public notice</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden bg-[#07101d] px-6 py-20 text-white md:py-24">
                    <div aria-hidden="true" className="absolute right-[-10rem] top-0 h-96 w-96 rounded-full bg-sky-500/12 blur-3xl" />
                    <div className="container-premium">
                        <div className="relative overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-[#08213d] via-[#0b3a5d] to-[#0476a8] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.36)] ring-1 ring-white/10 md:p-11">
                            <div aria-hidden="true" className="absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
                            <div className="relative grid gap-9 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.26em] text-amber-300">Help Build the Directory</p>
                                    <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">Community-built. Locally reviewed.</h2>
                                    <p className="mt-4 text-sm leading-7 text-sky-50/82">Soft launch is for finding missing businesses, correcting phone numbers, claiming listings, and adding rentals.</p>
                                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                                        {TRUST_POINTS.map(point => (
                                            <div key={point} className="flex items-center gap-2 text-sm font-bold text-sky-50/86">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                                                {point}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {HELP_CTAS.map(cta => (
                                        <Link key={cta.label} href={cta.href} className="rounded-[1.2rem] bg-white/96 px-5 py-4 text-sm font-black text-[#0b2545] shadow-[0_14px_38px_rgba(2,6,23,0.12)] transition hover:-translate-y-1 hover:bg-amber-300">
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
