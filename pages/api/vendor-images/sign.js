import { getSupabaseAdmin, getSupabaseUserClient } from '../../../lib/supabaseAdmin';

const BUCKET_NAME = 'vendor-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function sanitizeFileName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$|\.+$/g, '')
        .slice(0, 80);
}

function buildPath(vendorId, fileName) {
    const timestamp = Date.now();
    const safeName = sanitizeFileName(fileName || 'image');
    return `${vendorId}/${timestamp}-${safeName}`;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '') || '';
        const { vendorId, files } = req.body || {};

        if (!vendorId || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: 'vendorId and files are required.' });
        }

        const userClient = getSupabaseUserClient(accessToken);
        const { data: userData, error: userError } = await userClient.auth.getUser();
        if (userError || !userData?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const supabaseAdmin = getSupabaseAdmin();
        if (typeof supabaseAdmin.storage.from(BUCKET_NAME).createSignedUploadUrl !== 'function') {
            return res.status(500).json({ error: 'Signed uploads are not supported by the current Supabase client.' });
        }
        const { data: vendor, error: vendorError } = await supabaseAdmin
            .from('vendors')
            .select('id, user_id')
            .eq('id', vendorId)
            .single();

        if (vendorError || !vendor) {
            return res.status(404).json({ error: 'Vendor not found.' });
        }

        if (vendor.user_id !== userData.user.id) {
            return res.status(403).json({ error: 'You do not own this vendor.' });
        }

        const uploads = [];

        for (const file of files) {
            if (file?.size && file.size > MAX_FILE_SIZE) {
                return res.status(400).json({ error: `File ${file.name} exceeds 5MB limit.` });
            }

            const path = buildPath(vendorId, file?.name || 'image');
            const { data: signedData, error: signedError } = await supabaseAdmin
                .storage
                .from(BUCKET_NAME)
                .createSignedUploadUrl(path);

            if (signedError) {
                return res.status(400).json({ error: signedError.message });
            }

            const { data: publicData } = supabaseAdmin
                .storage
                .from(BUCKET_NAME)
                .getPublicUrl(path);

            uploads.push({
                path,
                signedUrl: signedData?.signedUrl,
                token: signedData?.token,
                publicUrl: publicData?.publicUrl
            });
        }

        return res.status(200).json({ uploads });
    } catch (error) {
        console.error('Signed upload error:', error);
        return res.status(500).json({ error: 'Unexpected error creating signed upload.' });
    }
}
