import Head from "next/head";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryFilter from "@/components/CategoryFilter";
import VendorGrid from "@/components/VendorGrid";
import Footer from "@/components/Footer";

// Mock Data for Phase 3 UI Testing
const MOCK_VENDORS = [
    {
        id: '1',
        business_name: 'Willy London Graphics',
        category: 'Professional Services',
        description: 'Local graphic design and printing services for Harbour View residents. Quality prints at affordable prices.',
        is_top_ad: true,
        is_featured: false,
        rating: 4.8,
        reviewCount: 12,
        images: [] // Uses placeholder
    },
    {
        id: '2',
        business_name: 'Harbour View Patty Shop',
        category: 'Food & Dining',
        description: 'The best patties in Kingston East. Freshly baked every morning.',
        is_top_ad: false,
        is_featured: true,
        rating: 4.9,
        reviewCount: 85,
        images: []
    },
    {
        id: '3',
        business_name: 'Dave Auto Repairs',
        category: 'Automotive',
        description: 'Expert mechanic for all Japanese and European cars. Open 7 days a week.',
        is_top_ad: false,
        is_featured: false,
        rating: 4.5,
        reviewCount: 24,
        images: []
    },
    {
        id: '4',
        business_name: 'Sandra Hair & Beauty',
        category: 'Beauty & Spa',
        description: 'Full service salon. Braiding, relaxing, and nail care.',
        is_top_ad: false,
        is_featured: false,
        rating: 0,
        reviewCount: 0,
        images: []
    }
];

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    return (
        <>
            <Head>
                <title>Harbour View Digital Directory</title>
                <meta name="description" content="Community vendor directory with reviews for Harbour View residents" />
            </Head>

            <div className="min-h-screen flex flex-col pt-16">
                <Navbar />

                <main className="flex-grow">
                    <Hero onSearch={setSearchQuery} />

                    <div className="sticky top-16 z-40 bg-gray-50/90 backdrop-blur-md border-y border-gray-200 shadow-sm">
                        <CategoryFilter
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </div>

                    <div className="bg-gray-50 min-h-screen pb-20">
                        <VendorGrid
                            vendors={MOCK_VENDORS}
                            searchQuery={searchQuery}
                            selectedCategory={selectedCategory}
                        />
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
