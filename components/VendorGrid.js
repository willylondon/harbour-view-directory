import VendorCard from './VendorCard';

export default function VendorGrid({ vendors, selectedCategory, searchQuery }) {
    // Filter logic
    const filteredVendors = vendors.filter((vendor) => {
        // 1. Category filter
        const matchesCategory =
            !selectedCategory ||
            selectedCategory === "All Categories" ||
            vendor.category === selectedCategory;

        // 2. Search query filter
        const matchesSearch =
            !searchQuery ||
            vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.category.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    // Sort logic (Top Ad, then Featured, then Newest)
    const sortedVendors = [...filteredVendors].sort((a, b) => {
        if (a.is_top_ad && !b.is_top_ad) return -1;
        if (!a.is_top_ad && b.is_top_ad) return 1;
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-8">
            <div className="mb-6 flex justify-between items-end">
                <h3 className="text-xl font-bold text-gray-900">
                    {selectedCategory || "All Vendors"}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                    Showing {sortedVendors.length} results
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {sortedVendors.length > 0 ? (
                    sortedVendors.map((vendor) => (
                        <VendorCard key={vendor.id} vendor={vendor} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h4>
                        <p className="text-gray-500">
                            Try adjusting your search or selecting a different category.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
