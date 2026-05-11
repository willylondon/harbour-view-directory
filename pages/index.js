import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ListingCard from '../components/VendorCard';
import { supabase } from '../lib/supabase';
import { getDisplayCategory } from '../lib/categoryMap';
import { createVendorImageResolver } from '../lib/categoryFallbackImages';
import { getVendorDisplayAddress } from '../lib/listingCopy';
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
    { title: 'Lost & Found', icon: '🔎', desc: 'Missing items, pets, and found property.', href: '/report' },
    { title: 'Road / Traffic', icon: '🚧', desc: 'Commute notes, road hazards, and traffic issues.', href: '/report' },
    { title: 'Water / Electricity', icon: '💧', desc: 'Utility interruption notes and local updates.', href: '/report' },
    { title: 'Safety Notices', icon: '🛡️', desc: 'Scam warnings and safety information.', href: '/safety' },
    { title: 'Events', icon: '📅', desc: 'Markets, church events, workshops, and meetups.', href: '/events' },
    { title: 'Rental Alerts', icon: '🏘️', desc: 'New rooms and available housing leads.', href: '/rent-near-cmu' },
];

const VISIBLE_NOTICE_COUNT = 4;

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

function formatWeatherValue(value, suffix = '') {
    return Number.isFinite(value) ? `${Math.round(value)}${suffix}` : null;
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
    const [weather, setWeather] = useState({ status: 'loading', data: null });

    useEffect(() => {
        setJamaicaTime(formatJamaicaTime());
        const timer = setInterval(() => setJamaicaTime(formatJamaicaTime()), 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadWeather() {
            try {
                const response = await fetch('/api/weather', {
                    signal: controller.signal,
                    headers: { accept: 'application/json' },
                });

                if (!response.ok) {
                    throw new Error('Weather request failed');
                }

                const data = await response.json();
                setWeather({ status: 'ready', data });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setWeather({ status: 'error', data: null });
                }
            }
        }

        loadWeather();

        return () => controller.abort();
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
    const featuredPickImages = useMemo(() => {
        const resolveImage = createVendorImageResolver();
        return new Map(featuredPicks.map(vendor => [vendor.id, resolveImage(vendor)]));
    }, [featuredPicks]);
    const foodPicks = businessPreview
        .filter(vendor => getDisplayCategory(vendor).display === 'Food & Restaurants')
        .slice(0, 3);
    const temperature = formatWeatherValue(weather.data?.temperature, '°C');
    const feelsLike = formatWeatherValue(weather.data?.feelsLike, '°C');
    const humidity = formatWeatherValue(weather.data?.humidity, '%');
    const windSpeed = formatWeatherValue(weather.data?.windSpeed, ' km/h');
    const rainChance = formatWeatherValue(weather.data?.rainChance, '%');
    const visibleCommunityNotices = COMMUNITY_NOTICES.slice(0, VISIBLE_NOTICE_COUNT);

    return (
        <div className="min-h-screen bg-[#08111f] text-white">
            <Head>
                <title>Harbour View Directory — Kingston 17 Community Portal</title>
                <meta name="description" content="Harbour View, organized. Find food, taxis, rentals, repairs, shops, services, and community updates across Kingston 17." />
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
                <section className="relative isolate px-5 pb-24 pt-12 md:px-6 md:pb-32 md:pt-24">
                    <picture className="absolute inset-0 overflow-hidden">
                        <source srcSet="/hero.webp" type="image/webp" media="(min-width: 769px)" />
                        <source srcSet="/hero-mobile.webp" type="image/webp" media="(max-width: 768px)" />
                        <img
                            src="/hero.png"
                            alt="Aerial view of Harbour View, Kingston Jamaica at golden hour"
                            className="absolute inset-0 h-full w-full object-cover opacity-35"
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

                    <div className="container-premium relative z-10">
                        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.64fr)] lg:items-center">
                            <div className="max-w-4xl pt-4 md:pt-8">
                                <h1 className="max-w-4xl text-5xl font-black leading-[0.98] text-white md:text-7xl lg:text-8xl">
                                    Harbour View, organized.
                                </h1>
                                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200/90 md:text-xl">
                                    Find food, taxis, rentals, repairs, shops, services, and community updates across Kingston 17.
                                </p>

                                <form onSubmit={handleSearch} className="mt-9 max-w-2xl rounded-[1.35rem] bg-white/[0.13] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.34)] ring-1 ring-white/10 backdrop-blur-2xl">
                                    <div className="flex flex-col gap-2 rounded-[1rem] bg-slate-950/45 p-1.5 shadow-inner shadow-white/5 sm:flex-row sm:items-center">
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

                            <aside className="relative overflow-hidden rounded-[2rem] bg-white/[0.085] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.38)] ring-1 ring-white/10 backdrop-blur-2xl md:p-7 lg:translate-y-10">
                                <div aria-hidden="true" className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-300/15 blur-2xl" />
                                <div aria-hidden="true" className="absolute -bottom-20 left-6 h-40 w-40 rounded-full bg-amber-300/10 blur-2xl" />
                                <div className="relative flex items-start justify-between gap-5">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300">Harbour View Today</p>
                                        <h2 className="mt-3 text-3xl font-black text-white" suppressHydrationWarning>{jamaicaTime}</h2>
                                        <p className="mt-2 text-sm font-semibold text-sky-100/80">Kingston 17 local time</p>
                                    </div>
                                    <span className="rounded-full bg-white/10 px-3 py-2 text-2xl shadow-inner shadow-white/10" aria-hidden="true">🇯🇲</span>
                                </div>
                                <div className="relative mt-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <div className="relative mt-6">
                                    {weather.status === 'ready' && (
                                        <div className="rounded-2xl bg-white/[0.10] p-4 shadow-inner shadow-white/5 ring-1 ring-white/10">
                                            <div className="flex items-end justify-between gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">Weather now</p>
                                                    <p className="mt-1 text-4xl font-black text-white">{temperature}</p>
                                                </div>
                                                <p className="pb-1 text-right text-sm font-black text-amber-200">{weather.data.conditionLabel}</p>
                                            </div>
                                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-200/84">
                                                {feelsLike && <span>Feels {feelsLike}</span>}
                                                {humidity && <span>Humidity {humidity}</span>}
                                                {windSpeed && <span>Wind {windSpeed}</span>}
                                                {rainChance && <span>Rain chance {rainChance}</span>}
                                            </div>
                                        </div>
                                    )}
                                    {weather.status === 'loading' && (
                                        <div className="rounded-2xl bg-white/[0.08] p-4 text-sm font-bold text-slate-200/78 ring-1 ring-white/10">
                                            Checking local weather...
                                        </div>
                                    )}
                                    {weather.status === 'error' && (
                                        <div className="rounded-2xl bg-white/[0.08] p-4 text-sm font-bold text-slate-200/78 ring-1 ring-white/10">
                                            Weather is temporarily unavailable. Local time will keep updating here.
                                        </div>
                                    )}
                                </div>
                                <p className="relative mt-5 max-w-sm text-sm leading-7 text-slate-200/82">
                                    Start with food, rooms near CMU, local services, or a correction that helps the next neighbour.
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

                <section className="relative z-10 -mt-12 px-5 pb-12 md:px-6">
                    <div className="container-premium">
                        <div className="grid grid-cols-2 gap-2 rounded-[1.6rem] bg-white/[0.07] p-2 shadow-[0_24px_90px_rgba(0,0,0,0.32)] ring-1 ring-white/10 backdrop-blur-2xl sm:grid-cols-4 lg:grid-cols-8">
                            {QUICK_ACTIONS.map(action => (
                                <Link key={action.label} href={action.href} className="group min-h-[6.25rem] rounded-[1.15rem] px-3.5 py-4 transition hover:bg-white/[0.11] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                                    <div className="mb-3 text-2xl">{action.icon}</div>
                                    <h3 className="text-sm font-black leading-tight text-white">{action.label}</h3>
                                    <p className="mt-1 hidden text-xs leading-5 text-slate-400/90 md:block">{action.hint}</p>
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
                                <h2 className="relative mt-4 text-3xl font-black leading-tight md:text-5xl">A better rental lane for Kingston 17.</h2>
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
                                    <div className="md:col-span-3 rounded-[1.5rem] bg-white/88 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">No approved rentals yet</p>
                                        <h3 className="mt-2 text-lg font-black text-slate-950">Rental submissions are open.</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">Approved listings will appear here after review. Landlords can submit rooms, studios, apartments, and houses now.</p>
                                        <Link href="/rent-near-cmu/submit" className="mt-4 inline-flex rounded-full bg-[#0b2545] px-4 py-2 text-xs font-black text-white transition hover:bg-sky-800">
                                            Submit rental
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden bg-[#fbfcfd] px-5 py-20 text-slate-950 md:px-6 md:py-24">
                    <div className="container-premium max-w-full">
                        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-amber-600">Featured Local Picks</p>
                                <h2 className="mt-3 max-w-3xl text-3xl font-black md:text-5xl">Places the community should be able to find fast.</h2>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">A tighter edit of useful Harbour View listings, from Seashore Place to Everest Drive and Nautilus Avenue.</p>
                            </div>
                            <Link href="/directory" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(15,23,42,0.16)] transition hover:bg-sky-800">View all businesses →</Link>
                        </div>

                        {businessPreview.length > 0 ? (
                            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
                                {featuredPicks[0] && (
                                    <div className="min-w-0 lg:sticky lg:top-24">
                                        <ListingCard vendor={featuredPicks[0]} resolvedImage={featuredPickImages.get(featuredPicks[0].id)} />
                                    </div>
                                )}
                                <div className="min-w-0 space-y-3">
                                    {featuredPicks.slice(1).map(vendor => {
                                        const cat = getDisplayCategory(vendor);
                                        return (
                                            <Link key={vendor.id} href={`/vendor/${vendor.slug || vendor.id}`} className="group grid min-w-0 gap-3 overflow-hidden rounded-[1.25rem] bg-slate-50/80 px-5 py-4 transition hover:bg-white hover:shadow-[0_18px_50px_rgba(15,23,42,0.10)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">{cat.display}</p>
                                                    <h3 className="mt-1 break-words text-lg font-black leading-tight text-slate-950">{vendor.business_name}</h3>
                                                    <p className="mt-1 line-clamp-2 break-words text-sm text-slate-500">{getVendorDisplayAddress(vendor)}</p>
                                                </div>
                                                <span className="text-xs font-black uppercase tracking-[0.18em] text-amber-600 transition group-hover:text-slate-950">View</span>
                                            </Link>
                                        );
                                    })}
                                    <div className="rounded-[1.25rem] bg-[#07101d] px-5 py-5 text-white">
                                        <p className="text-sm font-semibold leading-7 text-slate-200/88">Community picks are still being shaped during soft launch. The best corrections come from people who pass these places every week.</p>
                                    </div>
                                </div>
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
                                <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Lunch, errands, repairs, and a way home.</h2>
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

                <section className="bg-[#fbfcfd] px-5 py-20 text-slate-950 md:px-6 md:py-24">
                    <div className="container-premium">
                        <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-start">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-amber-600">Hungry in Harbour View</p>
                                <h2 className="mt-3 text-3xl font-black md:text-5xl">Find lunch before the question gets dramatic.</h2>
                                <p className="mt-4 text-sm leading-7 text-slate-500">Fast paths for cook shops, patties, Chinese food, jerk, bakeries, and the everyday places people actually search for.</p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {FOOD_SHORTCUTS.map(item => (
                                        <Link key={item} href={`/directory?q=${encodeURIComponent(item)}`} className="rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-800 transition hover:bg-amber-200">
                                            {item}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-[2rem] bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                                {foodPicks.length > 0 ? (
                                    <div className="grid gap-3 md:grid-cols-3">
                                        {foodPicks.map(vendor => (
                                            <Link key={vendor.id} href={`/vendor/${vendor.slug || vendor.id}`} className="rounded-[1.5rem] bg-[#fff7ed] p-5 transition hover:-translate-y-1 hover:bg-amber-50">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Food pick</p>
                                                <h3 className="mt-2 min-h-12 text-lg font-black leading-tight text-slate-950">{vendor.business_name}</h3>
                                                <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-slate-600">{getVendorDisplayAddress(vendor)}</p>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-[1.5rem] bg-[#fff7ed] p-8">
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">Food listings</p>
                                        <h3 className="mt-3 text-2xl font-black text-slate-950">The food map is ready for better local picks.</h3>
                                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Search by food type now, and help add the cook shops, bakeries, and lunch spots missing from the directory.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[linear-gradient(180deg,#eef4f8_0%,#f8fafc_100%)] px-5 py-20 text-slate-950 md:px-6 md:py-24">
                    <div className="container-premium">
                        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-sky-700">Community Notices</p>
                                <h2 className="mt-3 text-3xl font-black md:text-5xl">Useful updates, reviewed before they travel.</h2>
                                <p className="mt-3 text-sm leading-7 text-slate-500">Submit useful local updates for review. Approved notices can be published without turning the homepage into a notice dump.</p>
                                <div className="mt-6 rounded-[1.5rem] bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                                    <p className="text-sm font-bold text-slate-950">Community notice board is open for submissions.</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">Approved notices will be published without turning the homepage into a notice dump.</p>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {visibleCommunityNotices.map(notice => (
                                    <Link key={notice.title} href={notice.href} className="group rounded-[1.35rem] bg-white/88 px-5 py-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:bg-white">
                                        <div className="flex items-start gap-4">
                                            <span className="text-2xl" aria-hidden="true">{notice.icon}</span>
                                            <div>
                                                <h3 className="font-black">{notice.title}</h3>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">{notice.desc}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                <Link href="/report" className="rounded-[1.35rem] border border-dashed border-slate-300 bg-white/55 px-5 py-4 text-sm font-bold text-slate-600 transition hover:border-brand hover:text-brand">
                                    Submit another community update
                                </Link>
                            </div>
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
                                    <h2 className="mt-3 text-3xl font-black md:text-5xl">Community-built. Locally reviewed.</h2>
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
