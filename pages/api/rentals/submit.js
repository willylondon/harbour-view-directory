import formidable from 'formidable';
import fs from 'fs';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { isRateLimited } from '../../../lib/rateLimit';
import { generateSlug, normalizeWhatsApp } from '../../../lib/utils';
import { RENTAL_IMAGES_BUCKET } from '../../../lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Rate Limiting (3/hour)
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (isRateLimited(`rentals-submit-${ip}`, 3, 3600000)) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  }

  const form = formidable({
    maxFileSize: 5 * 1024 * 1024,
    multiples: true,
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // 2. Honeypot Protection
    const hp_field = Array.isArray(fields.hp_field) ? fields.hp_field[0] : fields.hp_field;
    if (hp_field) {
      return res.status(200).json({ success: true, message: 'Submission received' });
    }

    const getField = (name) => (Array.isArray(fields[name]) ? fields[name][0] : fields[name]);
    
    const title = getField('title');
    const description = getField('description');
    const contact_name = getField('contact_name');
    const whatsapp = getField('whatsapp');
    const type = getField('type');
    const price = parseFloat(getField('price'));
    const deposit = parseFloat(getField('deposit')) || 0;
    const location = getField('location');
    const available_date = getField('available_date');
    const distance_to_cmu = getField('distance_to_cmu');
    const distance_sort = parseInt(getField('distance_sort')) || 3;
    const house_rules = getField('house_rules');
    const furnished = getField('furnished') === 'true';
    const utilities_included = getField('utilities_included') === 'true';
    const landlord_name = getField('landlord_name');

    // 3. Validation
    if (!title || !contact_name || !whatsapp || !price || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Missing or invalid required fields (title, contact, whatsapp, price)' });
    }

    // 4. Handle Image Uploads
    const uploadedPhotos = [];
    const photoFiles = files.photos ? (Array.isArray(files.photos) ? files.photos : [files.photos]) : [];
    
    if (photoFiles.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 images allowed' });
    }

    for (const file of photoFiles) {
      const fileExt = file.originalFilename.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const fileBuffer = fs.readFileSync(file.filepath);

      const { error: uploadError } = await supabaseAdmin.storage
        .from(RENTAL_IMAGES_BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }
      uploadedPhotos.push(fileName);
    }

    // 5. Normalization & Slug Generation
    const normalizedWhatsApp = normalizeWhatsApp(whatsapp);
    let slug = generateSlug(title);
    
    const { data: existing } = await supabaseAdmin
      .from('rentals')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // 6. Database Insert
    const { data: rental, error: insertError } = await supabaseAdmin
      .from('rentals')
      .insert({
        title,
        description,
        contact_name,
        whatsapp: normalizedWhatsApp,
        type,
        price,
        deposit,
        location,
        available_date: available_date || null,
        distance_to_cmu,
        distance_sort,
        photos: uploadedPhotos,
        house_rules,
        furnished,
        utilities_included,
        slug,
        status: 'pending',
        landlord_name
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save rental listing' });
    }

    return res.status(200).json({ success: true, slug: rental.slug });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
