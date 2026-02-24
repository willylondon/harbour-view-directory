import { getSupabaseAdmin, getSupabaseUserClient } from '../../../lib/supabaseAdmin';

function isAdminEmail(email) {
    const adminList = process.env.ADMIN_EMAILS || '';
    return adminList
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
        .includes((email || '').toLowerCase());
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const accessToken = req.headers.authorization?.replace('Bearer ', '') || '';
        const userClient = getSupabaseUserClient(accessToken);
        const { data: userData, error: userError } = await userClient.auth.getUser();

        if (userError || !userData?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!isAdminEmail(userData.user.email)) {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        const {
            vendor_id,
            title,
            description,
            event_date,
            location,
            category,
            image_url,
            is_paid,
            paid_tier,
            status,
            expires_at
        } = req.body || {};

        if (!vendor_id || !title || !event_date) {
            return res.status(400).json({ error: 'vendor_id, title, and event_date are required.' });
        }

        const payload = {
            vendor_id,
            title,
            description: description || null,
            event_date,
            location: location || null,
            category: category || null,
            image_url: image_url || null,
            is_paid: Boolean(is_paid),
            paid_tier: paid_tier || 'basic',
            status: status || 'pending',
            expires_at: expires_at || null
        };

        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('events')
            .insert([payload])
            .select('*, vendors(business_name)')
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ event: data });
    } catch (error) {
        console.error('Admin create error:', error);
        return res.status(500).json({ error: 'Unexpected error creating event.' });
    }
}
