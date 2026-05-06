import { useState, useEffect, useRef } from 'react';

export default function SearchBar({ onSearch, initialValue = '' }) {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const inputRef = useRef(null);

    // Debounce search to improve performance
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onSearch) {
                onSearch(searchTerm);
            }
        }
        if (e.key === 'Escape') {
            setSearchTerm('');
            if (onSearch) {
                onSearch('');
            }
            inputRef.current?.blur();
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        if (onSearch) {
            onSearch('');
        }
        inputRef.current?.focus();
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 relative" role="search">
            <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-white overflow-hidden border border-gray-200 transition-shadow focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-blue-200">
                <div className="grid place-items-center h-full w-14 text-gray-400" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    className="peer h-full w-full outline-none text-gray-700 pr-2 text-lg placeholder-gray-400"
                    type="text"
                    id="search"
                    placeholder="Search for businesses, services, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search Harbour View businesses and services"
                    autoComplete="off"
                />
                {searchTerm && (
                    <button
                        onClick={handleClear}
                        className="absolute right-28 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Clear search"
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                <button 
                    className="h-full px-8 bg-brand-yellow text-gray-900 font-bold hover:bg-yellow-400 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    onClick={() => onSearch && onSearch(searchTerm)}
                    type="button"
                    aria-label="Search"
                >
                    Search
                </button>
            </div>
            <div className="mt-3 text-sm text-gray-500 text-center">
                <p>Try searching for: "restaurants", "plumbers", "hair salon", "auto repair"</p>
            </div>
        </div>
    );
}
