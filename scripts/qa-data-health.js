import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: vendors, error } = await supabase.from('vendors').select('*');
    if (error) {
        console.error("Error fetching vendors:", error);
        return;
    }

    console.log(`Analyzing ${vendors.length} vendors for data health...`);
    
    let missingPhone = 0;
    let missingDescription = 0;
    let missingImage = 0;
    let missingAddress = 0;
    let unapproved = 0;

    vendors.forEach(vendor => {
        if (!vendor.phone && !vendor.whatsapp) missingPhone++;
        if (!vendor.description) missingDescription++;
        if (!vendor.images || vendor.images.length === 0) missingImage++;
        if (!vendor.address) missingAddress++;
        if (!vendor.is_approved) unapproved++;
    });

    console.log('\n--- Data Health Report ---');
    console.log(`Total Records: ${vendors.length}`);
    console.log(`Unapproved/Hidden: ${unapproved} (${Math.round(unapproved/vendors.length*100)}%)`);
    console.log(`Missing Contact (Phone/WA): ${missingPhone} (${Math.round(missingPhone/vendors.length*100)}%)`);
    console.log(`Missing Description: ${missingDescription} (${Math.round(missingDescription/vendors.length*100)}%)`);
    console.log(`Missing Images: ${missingImage} (${Math.round(missingImage/vendors.length*100)}%)`);
    console.log(`Missing Address: ${missingAddress} (${Math.round(missingAddress/vendors.length*100)}%)`);

    console.log('\n💡 Tip: Vendors missing contact info will show "Contact not verified yet" on the site.');
    console.log('💡 Tip: Vendors missing description will have one generated automatically based on category.');
}

main();
