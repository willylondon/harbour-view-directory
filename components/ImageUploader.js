import { useCallback, useMemo, useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function ImageUploader({
    existingImages = [],
    onRemoveExisting,
    files,
    setFiles,
    error
}) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = useCallback(
        (incoming) => {
            const fileArray = Array.from(incoming || []);
            const validated = fileArray.filter((file) => file.size <= MAX_FILE_SIZE);
            setFiles((prev) => [...prev, ...validated]);
        },
        [setFiles]
    );

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
        },
        [handleFiles]
    );

    const previews = useMemo(() => files.map((file) => ({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file)
    })), [files]);

    return (
        <div className="space-y-4">
            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition ${isDragging ? 'border-brand-blue bg-blue-50' : 'border-gray-300 bg-white'}`}
            >
                <input
                    id="vendor-image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleFiles(event.target.files)}
                />
                <label htmlFor="vendor-image-upload" className="cursor-pointer inline-flex flex-col items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                        Drag and drop images here or click to browse
                    </span>
                    <span className="text-xs text-gray-500">Max 5MB per image. PNG, JPG, GIF, WEBP.</span>
                </label>
            </div>

            {error && (
                <p className="text-sm text-red-600 font-semibold">{error}</p>
            )}

            {existingImages.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Current Gallery</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {existingImages.map((url) => (
                            <div key={url} className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={url} alt="Vendor" className="h-24 w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => onRemoveExisting(url)}
                                    className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs font-bold px-2 py-1 rounded shadow"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {previews.length > 0 && (
                <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">New Uploads</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {previews.map((preview, index) => (
                            <div key={`${preview.name}-${index}`} className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                <img src={preview.url} alt={preview.name} className="h-24 w-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                                    {preview.name} · {formatBytes(preview.size)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                                    className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs font-bold px-2 py-1 rounded shadow"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
