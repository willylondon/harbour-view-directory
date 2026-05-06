import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import VendorCard from '../components/VendorCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { supabase } from '../lib/supabase';

export default function Home() {
    const [vendors, setVendors] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        filterVendors();
    }, [vendors, selectedCategory, searchQuery]);

    async function fetchVendors() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('is_approved', true)  // Only show approved vendors
                .order('is_top_ad', { ascending: false })
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(50);  // Limit results for performance

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                setVendors(data);
            } else {
                // Show sample vendors for empty state
                setVendors(getSampleVendors());
            }
        } catch (error) {
            console.error('Error fetching vendors:', error.message);
            // Show sample vendors on error
            setVendors(getSampleVendors());
        } finally {
            setLoading(false);
        }
    }

    function getSampleVendors() {
        return [
            {
                id: '1',
                business_name: 'Willy London Graphics',
                category: 'Professional Services',
                description: 'Local graphic design and printing services for Harbour View residents.',
                is_top_ad: true,
                is_featured: true,
                rating: 4.8,
                reviewCount: 12,
                address: 'Shop 4, Harbour View Shopping Centre',
                phone: '876-555-0100',
                whatsapp: 'https://wa.me/18765550100'
            },
            {
                id: '2',
                business_name: 'Harbour View Patty Shop',
                category: 'Food & Dining',
                description: 'The best patties in Kingston East. Family-owned since 1995.',
                is_featured: true,
                rating: 4.9,
                reviewCount: 85,
                address: '123 Harbour View Main Road',
                phone: '876-555-0200',
                whatsapp: 'https://wa.me/18765550200'
            },
            {
                id: '3',
                business_name: 'Island Auto Repairs',
                category: 'Automotive',
                description: 'Expert auto repair and maintenance services. Free estimates.',
                is_top_ad: true,
                rating: 4.7,
                reviewCount: 34,
                address: '45 Auto Lane, Harbour View',
                phone: '876-555-0300',
                whatsapp: 'https://wa.me/18765550300'
            },
            {
                id: '4',
                business_name: 'Blue Waters Salon',
                category: 'Beauty & Wellness',
                description: 'Professional hair, nails, and beauty services.',
                rating: 4.6,
                reviewCount: 28,
                address: '78 Beauty Plaza, Harbour View',
                phone: '876-555-0400',
                whatsapp: 'https://wa.me/18765550400'
            }
        ];
    }

    function filterVendors() {
        let result = vendors;

        if (selectedCategory && selectedCategory !== 'All Categories') {
            result = result.filter(v => v.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(v =>
                (v.business_name && v.business_name.toLowerCase().includes(query)) ||
                (v.description && v.description.toLowerCase().includes(query)) ||
                (v.category && v.category.toLowerCase().includes(query))
            );
        }

        setFilteredVendors(result);
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Harbour View Directory | Find Local Businesses & Services in Harbour View Kingston Jamaica</title>
                <meta name="description" content="Discover trusted Harbour View businesses, services, and events. The official community directory for Harbour View Kingston Jamaica. Search restaurants, shops, professionals and more." />
                <meta name="keywords" content="Harbour View directory, Harbour View businesses, Harbour View services, Kingston Jamaica, local businesses, community directory" />
                <meta property="og:title" content="Harbour View Directory | Find Local Businesses & Services" />
                <meta property="og:description" content="Discover trusted Harbour View businesses, services, and events in Kingston Jamaica." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://harbourviewdirectory.online" />
                <meta property="og:image" content="https://harbourviewdirectory.online/og-image.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Harbour View Directory | Find Local Businesses & Services" />
                <meta name="twitter:description" content="Discover trusted Harbour View businesses, services, and events in Kingston Jamaica." />
                <link rel="canonical" href="https://harbourviewdirectory.online" />
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <div className="max-w-6xl mx-auto px-6 text-center py-16">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Harbour View Community Directory
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                        Find trusted local businesses, services, and events in Harbour View Kingston Jamaica. Support our community by discovering and reviewing local vendors.
                    </p>
                    <SearchBar onSearch={setSearchQuery} initialValue={searchQuery} />
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <a href="/post-ad" className="bg-brand-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">
                            List Your Business
                        </a>
                        <a href="#categories" className="bg-white text-brand-blue border-2 border-brand-blue px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                            Browse Categories
                        </a>
                        <a href="/events" className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition">
                            View Local Events
                        </a>
                    </div>
                </div>

                {/* Categories Showcase */}
                <div id="categories" className="bg-white py-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Popular Categories in Harbour View</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {['Food & Dining', 'Professional Services', 'Automotive', 'Beauty & Wellness', 'Home Services', 'Retail Shops'].map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${selectedCategory === category ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-200 hover:border-brand-blue'}`}
                                >
                                    <div className="text-2xl mb-2">
                                        {category === 'Food & Dining' && '🍽️'}
                                        {category === 'Professional Services' && '💼'}
                                        {category === 'Automotive' && '🚗'}
                                        {category === 'Beauty & Wellness' && '💅'}
                                        {category === 'Home Services' && '🏠'}
                                        {category === 'Retail Shops' && '🛍️'}
                                    </div>
                                    <span className="font-medium">{category}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="border-y border-gray-100 bg-white sticky top-16 z-40">
                    <CategoryFilter
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </div>

                {/* Vendor Grid */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedCategory}</h2>
                        <p className="text-gray-500 text-sm font-medium">Showing {filteredVendors.length} results</p>
                    </div>

                    {loading ? (
                        <LoadingSkeleton type="vendor" count={6} />
                    ) : filteredVendors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredVendors.map((vendor) => (
                                <VendorCard key={vendor.id} vendor={vendor} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-dashed border-blue-200">
                            <div className="max-w-md mx-auto">
                                <div className="text-6xl mb-6">🏪</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">No vendors found</h3>
                                <p className="text-gray-600 mb-6">
                                    {searchQuery || selectedCategory !== 'All Categories' 
                                        ? `No vendors match "${searchQuery}" in ${selectedCategory}. Try a different search or category.`
                                        : 'Be the first to list your business in Harbour View!'}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); }}
                                        className="bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                                    >
                                        Show All Vendors
                                    </button>
                                    <a href="/post-ad" className="bg-white text-brand-blue border-2 border-brand-blue px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition">
                                        List Your Business
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-white border-t border-gray-100 py-12 text-center text-gray-500">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} Harbour View Digital Directory. Built for our community.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-brand-blue transition">Terms</a>
                        <a href="#" className="hover:text-brand-blue transition">Privacy</a>
                        <a href="#" className="hover:text-brand-blue transition">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
