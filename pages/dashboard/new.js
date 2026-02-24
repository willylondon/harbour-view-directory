import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import ImageUploader from '../../components/ImageUploader';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
    "Home Maintenance & Repair",
    "Food & Beverage",
    "Professional Services",
    "Retail Services",
    "Accommodation & Transport",
    "Other Community Services"
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function NewVendorPage() {
    const router = useRouter();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formState, setFormState] = useState({
        business_name: '',
        category: '',
        description: '',
        phone: '',
        whatsapp: '',
        address: ''
    });

    const [files, setFiles] = useState([]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                router.push('/login');
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [router]);


    const tooLargeFiles = useMemo(() => files.filter((file) => file.size > MAX_FILE_SIZE), [files]);

    async function handleSave(event) {
        event.preventDefault();
        setError('');

        if (!session) {
            setError('You must be logged in to create a listing.');
            return;
        }

        if (tooLargeFiles.length > 0) {
            setError('One or more files exceed the 5MB limit.');
            return;
        }

        setSaving(true);

        try {
            // 1. Create the Vendor record first to get the ID for image association
            const { data: newVendor, error: insertError } = await supabase
                .from('vendors')
                .insert({
                    user_id: session.user.id,
                    ...formState,
                    images: [] // Initialize with empty array, will update after upload
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // 2. Upload Images using the new Vendor ID
            let uploadedUrls = [];

            if (files.length > 0) {
                const response = await fetch('/api/vendor-images/sign', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        vendorId: newVendor.id,
                        files: files.map((file) => ({
                            name: file.name,
                            type: file.type,
                            size: file.size
                        }))
                    })
                });

                const payload = await response.json();
                if (!response.ok) {
                    throw new Error(payload.error || 'Unable to prepare uploads.');
                }

                for (let index = 0; index < files.length; index += 1) {
                    const uploadMeta = payload.uploads[index];
                    if (!uploadMeta?.signedUrl) {
                        throw new Error('Signed URL missing for upload.');
                    }

                    const uploadResponse = await fetch(uploadMeta.signedUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': files[index].type
                        },
                        body: files[index]
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('Upload failed.');
                    }

                    if (uploadMeta.publicUrl) {
                        uploadedUrls.push(uploadMeta.publicUrl);
                    }
                }

                // 3. Update the Vendor record with the uploaded image URLs
                const { error: updateError } = await supabase
                    .from('vendors')
                    .update({ images: uploadedUrls })
                    .eq('id', newVendor.id);

                if (updateError) throw updateError;
            }

            // 4. Redirect to the newly created vendor's page (or dashboard)
            router.push('/dashboard');

        } catch (error) {
            console.error('Error creating vendor:', error.message);
            setError(error.message || 'Unable to create listing.');
        } finally {
            setSaving(false);
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary">
                <Navbar />
                <div className="pt-32 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>New Listing | Harbour View Directory</title>
            </Head>
            <Navbar />

            <main className="pt-28 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Create New Listing</h1>
                            <p className="text-gray-600">Fill in your business details to add a new directory listing.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="text-gray-600 font-semibold px-4 py-2 rounded border border-gray-200 hover:bg-gray-50"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                            <h2 className="text-lg font-bold text-gray-900">Listing Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Business Name</label>
                                    <input
                                        type="text"
                                        value={formState.business_name}
                                        onChange={(event) => setFormState({ ...formState, business_name: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                        required
                                        placeholder="Enter your business name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formState.category}
                                        onChange={(event) => setFormState({ ...formState, category: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none bg-white"
                                        required
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="4"
                                    value={formState.description}
                                    onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                    placeholder="Describe your business or service..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={formState.phone}
                                        onChange={(event) => setFormState({ ...formState, phone: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                        placeholder="Business phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                                    <input
                                        type="text"
                                        value={formState.whatsapp}
                                        onChange={(event) => setFormState({ ...formState, whatsapp: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                        placeholder="e.g. 18765550100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={formState.address}
                                    onChange={(event) => setFormState({ ...formState, address: event.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                    placeholder="Physical address (optional)"
                                />
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Gallery Images</h2>
                                    <p className="text-sm text-gray-500">Upload multiple images for your listing gallery.</p>
                                </div>
                                <span className="text-xs font-semibold text-gray-500">Max 5MB per file</span>
                            </div>

                            <ImageUploader
                                existingImages={[]} // No existing images for new listing
                                onRemoveExisting={() => { }}
                                files={files}
                                setFiles={setFiles}
                                error={error}
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 font-semibold">{error}</p>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-brand-blue text-white font-bold px-6 py-3 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                            >
                                {saving ? 'Creating...' : 'Create Listing'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}


export async function getServerSideProps() {
    return {
        props: {}
    };
}
