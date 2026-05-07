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
    uploadDir: '/tmp',
    keepExtensions: true,
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Formidable parse error:', err);
          reject(err);
        }
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
    const area_landmark = getField('area_landmark');
    const exact_address = getField('exact_address');
    const publish_exact_address = getField('publish_exact_address') === 'yes';
    const available_date = getField('available_date');
    const distance_to_cmu = getField('distance_to_cmu');
    const distance_sort = parseInt(getField('distance_sort')) || 3;
    const house_rules = getField('house_rules');
    const furnished = getField('furnished') === 'true';
    const suitable_for = getField('suitable_for');
    const shared_bathroom = getField('shared_bathroom') === 'true';
    const kitchen_access = getField('kitchen_access') === 'true';
    const water_included = getField('water_included') === 'true';
    const light_included = getField('light_included') === 'true';
    const internet_included = getField('internet_included') === 'true';
    const parking_available = getField('parking_available') === 'true';
    const minimum_stay = getField('minimum_stay');
    const viewing_arrangement = getField('viewing_arrangement');
    const admin_verification_notes = getField('admin_verification_notes');
    const utilities_included = water_included || light_included || internet_included;
    const landlord_name = getField('landlord_name');
    const location = publish_exact_address && exact_address ? exact_address : area_landmark;

    // 3. Validation
    if (!title || !contact_name || !whatsapp || !area_landmark || !price || isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Missing or invalid required fields (title, contact, whatsapp, area/landmark, price)' });
    }

    // 4. Handle Image Uploads
    const uploadedPhotos = [];
    const photoFiles = files.photos ? (Array.isArray(files.photos) ? files.photos : [files.photos]) : [];
    
    if (photoFiles.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 images allowed' });
    }

    for (const file of photoFiles) {
      if (!file || file.size === 0) continue;
      
      const fileExt = file.originalFilename ? file.originalFilename.split('.').pop() : 'jpg';
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

      // Store full public URL so RentalCard can display without extra resolution
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(RENTAL_IMAGES_BUCKET)
        .getPublicUrl(fileName);
      uploadedPhotos.push(publicUrl);
    }

    // 5. Normalization & Slug Generation
    const normalizedWhatsApp = normalizeWhatsApp(whatsapp);
    let slug = generateSlug(title);
    const adminNotes = [
      `Public area / landmark: ${area_landmark || 'Not provided'}`,
      `Exact address publish opt-in: ${publish_exact_address ? 'Yes' : 'No'}`,
      `Exact address (admin only): ${exact_address || 'Not provided'}`,
      `Suitable for: ${suitable_for || 'Not provided'}`,
      `Shared bathroom: ${shared_bathroom ? 'Yes' : 'No'}`,
      `Kitchen access: ${kitchen_access ? 'Yes' : 'No'}`,
      `Water included: ${water_included ? 'Yes' : 'No'}`,
      `Light included: ${light_included ? 'Yes' : 'No'}`,
      `Internet included: ${internet_included ? 'Yes' : 'No'}`,
      `Parking available: ${parking_available ? 'Yes' : 'No'}`,
      `Minimum stay: ${minimum_stay || 'Not provided'}`,
      `Viewing arrangement: ${viewing_arrangement || 'Not provided'}`,
      `Admin verification notes: ${admin_verification_notes || 'None'}`,
    ].join('\n');
    
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
        landlord_name,
        admin_notes: adminNotes,
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
