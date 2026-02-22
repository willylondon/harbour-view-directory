const CATEGORIES = [
    "All Categories",
    "Food & Dining",
    "Home Services",
    "Automotive",
    "Beauty & Spa",
    "Health & Medical",
    "Retail",
    "Professional Services",
    "Education"
];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 hide-scrollbar">
            <div className="flex gap-3 px-6 max-w-7xl mx-auto">
                {CATEGORIES.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm
              ${selectedCategory === category || (!selectedCategory && category === "All Categories")
                                ? "bg-brand-blue text-white ring-2 ring-brand-yellow/50 shadow-md"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                            }
            `}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
