import { useState } from 'react';

export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        onSearch && onSearch(value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submittedValue = e.currentTarget.elements.search?.value ?? query;
        onSearch && onSearch(submittedValue);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-8 relative">
            <form
                className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-white overflow-hidden border border-gray-200 transition-shadow"
                onSubmit={handleSubmit}
            >
                <div className="grid place-items-center h-full w-14 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    className="peer h-full w-full outline-none text-gray-700 pr-2 text-base md:text-lg"
                    type="text"
                    id="search"
                    name="search"
                    placeholder="Search for mechanics, bakers, plumbers..."
                    value={query}
                    onChange={handleChange}
                    inputMode="search"
                    enterKeyHint="search"
                    autoCapitalize="none"
                    autoCorrect="off"
                />
                <button type="submit" className="h-full px-4 md:px-8 bg-brand-yellow text-gray-900 font-bold hover:bg-yellow-400 transition-colors shadow-sm">
                    Search
                </button>
            </form>
        </div>
    );
}
