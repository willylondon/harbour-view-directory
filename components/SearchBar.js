export default function SearchBar({ onSearch }) {
    return (
        <div className="w-full max-w-2xl mx-auto mt-8 relative">
            <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-white overflow-hidden border border-gray-200 transition-shadow">
                <div className="grid place-items-center h-full w-14 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    className="peer h-full w-full outline-none text-gray-700 pr-2 text-lg"
                    type="text"
                    id="search"
                    placeholder="Search for mechanics, bakers, plumbers..."
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                />
                <button className="h-full px-8 bg-brand-yellow text-gray-900 font-bold hover:bg-yellow-400 transition-colors shadow-sm">
                    Search
                </button>
            </div>
        </div>
    );
}
