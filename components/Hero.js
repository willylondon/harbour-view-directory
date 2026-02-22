import SearchBar from './SearchBar';

export default function Hero({ onSearch }) {
    return (
        <div className="pt-24 pb-12 w-full text-center">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
                    Discover Community Vendors
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Connect with trusted local businesses in Harbour View. Read reviews, share experiences, and build our community together.
                </p>

                <SearchBar onSearch={onSearch} />
            </div>
        </div>
    );
}
