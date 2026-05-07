const CATEGORIES = [
    { label: 'All',                   value: ''                       },
    { label: 'Food & Restaurants',    value: 'Food & Restaurants'     },
    { label: 'Retail & Shopping',     value: 'Retail & Shopping'      },
    { label: 'Auto & Transport',      value: 'Auto & Transport'       },
    { label: 'Professional / Legal / JP', value: 'Professional / Legal / JP' },
    { label: 'Home Services',         value: 'Home Services'          },
    { label: 'Beauty & Wellness',     value: 'Beauty & Wellness'      },
    { label: 'Health & Medical',      value: 'Health & Medical'       },
    { label: 'Community & Church',    value: 'Community & Church'     },
];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 hide-scrollbar">
            <div className="flex gap-3 px-6 max-w-7xl mx-auto">
                {CATEGORIES.map(({ label, value }) => {
                    const isActive = selectedCategory === value || (!selectedCategory && value === '');
                    return (
                        <button
                            key={value}
                            onClick={() => onSelectCategory(value)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm
                                ${isActive
                                    ? 'bg-brand text-white shadow-md'
                                    : 'bg-white text-text-soft hover:bg-bg-alt border border-border hover:border-brand/30'
                                }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
