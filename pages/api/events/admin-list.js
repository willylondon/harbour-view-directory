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
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
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

        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('events')
            .select('*, vendors(business_name)')
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ events: data || [] });
    } catch (error) {
        console.error('Admin list error:', error);
        return res.status(500).json({ error: 'Unexpected error listing events.' });
    }
}
