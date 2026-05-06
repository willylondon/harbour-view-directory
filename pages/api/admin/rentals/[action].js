import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { isAdmin } from '../../../../lib/admin';
import { getAuthUser } from '../../../../lib/authHelper';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, id } = req.query;

  // 1. Auth Check (Admin Only)
  const user = await getAuthUser(req);
  if (!user || !(await isAdmin(user.id))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!id) return res.status(400).json({ error: 'Missing rental ID' });

  try {
    let updateData = {};
    const now = new Date();

    switch (action) {
      case 'approve':
        const expiresAt = new Date();
        expiresAt.setDate(now.getDate() + 90);
        updateData = { 
          status: 'approved', 
          approved_at: now.toISOString(),
          expires_at: expiresAt.toISOString()
        };
        break;
      case 'reject':
        updateData = { status: 'rejected' };
        break;
      case 'mark_rented':
        updateData = { status: 'rented' };
        break;
      case 'renew':
        const newExpiry = new Date();
        newExpiry.setDate(now.getDate() + 90);
        updateData = { 
          expires_at: newExpiry.toISOString(),
          status: 'approved'
        };
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const { data, error } = await supabaseAdmin
      .from('rentals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
