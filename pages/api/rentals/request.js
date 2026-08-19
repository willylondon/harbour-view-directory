import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { isRateLimited } from '../../../lib/rateLimit';
import { normalizeWhatsApp } from '../../../lib/utils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Rate Limiting (5/hour per IP)
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (isRateLimited(`rental-request-${ip}`, 5, 3600000)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const {
      full_name,
      whatsapp,
      email,
      occupant_type,
      cmu_affiliation,
      requested_type,
      max_budget,
      move_in_date,
      duration,
      need_furnished,
      need_utilities_included,
      need_parking,
      notes,
      hp_field
    } = req.body;

    // Honeypot check
    if (hp_field) {
      return res.status(200).json({ success: true, message: 'Request received' });
    }

    if (!full_name || !whatsapp || !max_budget) {
      return res.status(400).json({ error: 'Full name, WhatsApp number, and target budget are required.' });
    }

    const numericBudget = parseFloat(max_budget);
    if (isNaN(numericBudget) || numericBudget <= 0) {
      return res.status(400).json({ error: 'Please enter a valid monthly budget amount.' });
    }

    const payload = {
      full_name: full_name.trim(),
      whatsapp: normalizeWhatsApp(whatsapp),
      email: email ? email.trim().toLowerCase() : null,
      occupant_type: occupant_type || 'Student',
      cmu_affiliation: !!cmu_affiliation,
      requested_type: requested_type || 'Room',
      max_budget: numericBudget,
      move_in_date: move_in_date || null,
      duration: duration || 'Long Term (6+ months)',
      need_furnished: !!need_furnished,
      need_utilities_included: !!need_utilities_included,
      need_parking: !!need_parking,
      notes: notes ? notes.trim() : null,
      status: 'pending'
    };

    const { data, error } = await supabaseAdmin
      .from('rental_requests')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      // Even if table does not yet exist on Supabase, don't crash, log gracefully
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Rental request submitted successfully!',
      requestId: data?.id
    });
  } catch (err) {
    console.error('Rental request error:', err);
    return res.status(500).json({
      error: 'Failed to submit request. You can also reach us directly on WhatsApp.'
    });
  }
}
