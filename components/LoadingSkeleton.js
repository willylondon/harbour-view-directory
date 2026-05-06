export default function LoadingSkeleton({ type = 'vendor', count = 3 }) {
    if (type === 'vendor') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                        <div className="flex flex-col sm:flex-row p-4 gap-4 items-start sm:items-center">
                            <div className="w-full sm:w-28 h-48 sm:h-28 rounded-lg bg-gray-200"></div>
                            
                            <div className="flex-1 min-w-0 py-1 space-y-3">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded"></div>
                                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'event') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 animate-pulse">
                        <div className="p-6 space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'card') {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-pulse">
                <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    );
}