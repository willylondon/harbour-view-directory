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
        const { eventId, status, is_paid, paid_tier, expires_at } = req.body || {};

        if (!eventId) {
            return res.status(400).json({ error: 'eventId is required.' });
        }

        const userClient = getSupabaseUserClient(accessToken);
        const { data: userData, error: userError } = await userClient.auth.getUser();

        if (userError || !userData?.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!isAdminEmail(userData.user.email)) {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        const updates = {
            ...(status ? { status } : {}),
            ...(typeof is_paid === 'boolean' ? { is_paid } : {}),
            ...(paid_tier ? { paid_tier } : {}),
            ...(expires_at ? { expires_at } : {})
        };

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No updates provided.' });
        }

        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('events')
            .update(updates)
            .eq('id', eventId)
            .select('*')
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ event: data });
    } catch (error) {
        console.error('Admin update error:', error);
        return res.status(500).json({ error: 'Unexpected error updating event.' });
    }
}
