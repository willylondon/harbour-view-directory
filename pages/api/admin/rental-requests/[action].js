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

  if (!id) return res.status(400).json({ error: 'Missing request ID' });

  try {
    let updateData = {};
    const { admin_notes } = req.body || {};

    switch (action) {
      case 'mark_contacted':
        updateData = { status: 'contacted' };
        break;
      case 'mark_matched':
        updateData = { status: 'matched' };
        break;
      case 'close':
        updateData = { status: 'closed' };
        break;
      case 'reopen':
        updateData = { status: 'pending' };
        break;
      case 'save_notes':
        updateData = { admin_notes: admin_notes || '' };
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const { data, error } = await supabaseAdmin
      .from('rental_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Admin Rental Requests API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
