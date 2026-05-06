// Migration script to add slugs to existing vendors
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(businessName) {
    return businessName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
        .trim();
}

async function migrateVendors() {
    console.log('Starting vendor slug migration...');
    
    try {
        // Fetch all vendors without slugs
        const { data: vendors, error } = await supabase
            .from('vendors')
            .select('id, business_name, slug')
            .is('slug', null)
            .limit(100);

        if (error) {
            throw error;
        }

        console.log(`Found ${vendors.length} vendors without slugs`);

        // Generate and update slugs
        const updates = vendors.map(vendor => {
            const slug = generateSlug(vendor.business_name);
            return {
                id: vendor.id,
                slug: slug
            };
        });

        // Update vendors in batches
        const batchSize = 10;
        for (let i = 0; i < updates.length; i += batchSize) {
            const batch = updates.slice(i, i + batchSize);
            
            const { error: updateError } = await supabase
                .from('vendors')
                .upsert(batch);

            if (updateError) {
                console.error('Error updating batch:', updateError);
            } else {
                console.log(`Updated batch ${i / batchSize + 1}: ${batch.length} vendors`);
            }
        }

        console.log('Migration completed successfully!');
        
        // Verify migration
        const { data: remaining, error: verifyError } = await supabase
            .from('vendors')
            .select('id, business_name, slug')
            .is('slug', null)
            .limit(10);

        if (verifyError) {
            console.error('Error verifying migration:', verifyError);
        } else if (remaining.length > 0) {
            console.log(`Warning: ${remaining.length} vendors still without slugs`);
        } else {
            console.log('All vendors now have slugs!');
        }

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateVendors();