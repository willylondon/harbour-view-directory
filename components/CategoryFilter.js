const CATEGORIES = [
    { label: 'All',                   value: ''                       },
    { label: 'Food & Beverage',       value: 'Food & Beverage'        },
    { label: 'Retail',                value: 'Retail'                 },
    { label: 'Transport',             value: 'Transport'              },
    { label: 'Professional Services', value: 'Professional Services'  },
    { label: 'Home Services',         value: 'Home Services'          },
    { label: 'Beauty & Wellness',     value: 'Beauty & Wellness'      },
    { label: 'Emergency',             value: 'Emergency'              },
    { label: 'Community',             value: 'Community'              },
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
