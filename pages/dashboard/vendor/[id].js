import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from '../../../components/Navbar';
import ImageUploader from '../../../components/ImageUploader';
import { supabase } from '../../../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function VendorEditPage() {
    const router = useRouter();
    const { id } = router.query;

    const [session, setSession] = useState(null);
    const [vendor, setVendor] = useState(null);
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

    const [existingImages, setExistingImages] = useState([]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) {
                router.push('/login');
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [router]);

    useEffect(() => {
        if (id && session?.user) {
            fetchVendor();
        }
    }, [id, session]);

    async function fetchVendor() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data.user_id !== session.user.id) {
                router.push('/dashboard');
                return;
            }

            setVendor(data);
            setExistingImages(data.images || []);
            setFormState({
                business_name: data.business_name || '',
                category: data.category || '',
                description: data.description || '',
                phone: data.phone || '',
                whatsapp: data.whatsapp || '',
                address: data.address || ''
            });
        } catch (error) {
            console.error('Error loading vendor:', error.message);
            setError('Unable to load vendor listing.');
        } finally {
            setLoading(false);
        }
    }

    const tooLargeFiles = useMemo(() => files.filter((file) => file.size > MAX_FILE_SIZE), [files]);

    async function handleSave(event) {
        event.preventDefault();
        setError('');

        if (!session) {
            setError('You must be logged in to update this listing.');
            return;
        }

        if (tooLargeFiles.length > 0) {
            setError('One or more files exceed the 5MB limit.');
            return;
        }

        setSaving(true);

        try {
            let uploadedUrls = [];

            if (files.length > 0) {
                const response = await fetch('/api/vendor-images/sign', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        vendorId: id,
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
            }

            const updatedImages = [...existingImages, ...uploadedUrls];

            const { error: updateError } = await supabase
                .from('vendors')
                .update({
                    ...formState,
                    images: updatedImages
                })
                .eq('id', id);

            if (updateError) throw updateError;

            setFiles([]);
            setExistingImages(updatedImages);
            setVendor((prev) => ({ ...prev, ...formState, images: updatedImages }));
        } catch (error) {
            console.error('Error updating vendor:', error.message);
            setError(error.message || 'Unable to save changes.');
        } finally {
            setSaving(false);
        }
    }

    function handleRemoveExisting(url) {
        setExistingImages((prev) => prev.filter((item) => item !== url));
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

    if (!vendor) return null;

    return (
        <div className="min-h-screen bg-bg-primary">
            <Head>
                <title>Edit Listing | Harbour View Directory</title>
            </Head>
            <Navbar />

            <main className="pt-28 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Edit Listing</h1>
                            <p className="text-gray-600">Update your listing details and upload new images.</p>
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
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={formState.category}
                                        onChange={(event) => setFormState({ ...formState, category: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="4"
                                    value={formState.description}
                                    onChange={(event) => setFormState({ ...formState, description: event.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
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
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp Link</label>
                                    <input
                                        type="text"
                                        value={formState.whatsapp}
                                        onChange={(event) => setFormState({ ...formState, whatsapp: event.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none"
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
                                />
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Gallery Images</h2>
                                    <p className="text-sm text-gray-500">Upload multiple images for your listing gallery.</p>
                                </div>
                                <span className="text-xs font-semibold text-gray-500">Max 5MB</span>
                            </div>

                            <ImageUploader
                                existingImages={existingImages}
                                onRemoveExisting={handleRemoveExisting}
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
                                {saving ? 'Saving...' : 'Save Changes'}
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
