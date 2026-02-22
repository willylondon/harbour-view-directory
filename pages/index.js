import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import VendorCard from '../components/VendorCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
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
                .order('is_top_ad', { ascending: false })
                .order('is_featured', { ascending: false });

            if (error) {
                throw error;
            }

            if (data) {
                setVendors(data);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error.message);
            // Fallback dummy data for preview purposes
            if (vendors.length === 0) {
                setVendors([
                    {
                        id: '1',
                        business_name: 'Willy London Graphics',
                        category: 'Professional Services',
                        description: 'Local graphic design and printing services.',
                        is_top_ad: true,
                        rating: 4.8,
                        reviewCount: 12
                    },
                    {
                        id: '2',
                        business_name: 'Harbour View Patty Shop',
                        category: 'Food & Dining',
                        description: 'The best patties in Kingston East.',
                        is_featured: true,
                        rating: 4.9,
                        reviewCount: 85
                    }
                ]);
            }
        } finally {
            setLoading(false);
        }
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
                <title>Harbour View Digital Directory</title>
                <meta name="description" content="Community vendor directory for Harbour View" />
            </Head>

            <Navbar />

            <main className="pt-24 pb-16">
                {/* Hero Section */}
                <div className="max-w-4xl mx-auto px-6 text-center py-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
                        Discover Community Vendors
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Connect with trusted local businesses in Harbour View. Read reviews, share experiences, and build our community together.
                    </p>
                    <SearchBar onSearch={setSearchQuery} />
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
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                        </div>
                    ) : filteredVendors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredVendors.map((vendor) => (
                                <VendorCard key={vendor.id} vendor={vendor} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">No vendors found matching your criteria.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); }}
                                className="mt-4 text-brand-blue font-bold hover:underline"
                            >
                                Clear Filters
                            </button>
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
