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

const CATEGORY_MAP = {
    'Food & Beverage': ['restaurant', 'cafe', 'bar', 'grocery', 'bakery', 'food', 'cook', 'kitchen', 'eatery', 'pizza', 'burger'],
    'Beauty & Wellness': ['salon', 'spa', 'barber', 'hair', 'nail', 'massage', 'wellness', 'makeup', 'beauty'],
    'Home Services': ['plumber', 'electrician', 'contractor', 'clean', 'hvac', 'roof', 'painter', 'landscape', 'yard', 'pest', 'build'],
    'Auto & Transport': ['mechanic', 'auto', 'car', 'tire', 'garage', 'tow', 'taxi', 'transport', 'vehicle'],
    'Education': ['school', 'tutor', 'teacher', 'academy', 'class', 'learn', 'education', 'cmu', 'college'],
    'Tech & Electronics': ['phone', 'computer', 'tech', 'repair', 'software', 'it', 'electronics', 'device', 'appliance repair'],
    'Finance & Banking': ['bank', 'atm', 'credit', 'loan', 'finance', 'insurance', 'money', 'remittance'],
    'Health & Medical': ['clinic', 'doctor', 'pharmacy', 'dental', 'health', 'medical', 'hospital', 'optician', 'therapy'],
    'Retail & Shopping': ['shop', 'store', 'retail', 'boutique', 'market', 'mart', 'supermarket'],
    'Community & Church': ['church', 'community', 'charity', 'ngo', 'ministry', 'police', 'post office', 'library', 'park'],
    'Laundry & Cleaning': ['laundry', 'laundromat', 'dry clean', 'wash', 'ironing', 'cleaners'],
    'Professional Services': ['lawyer', 'legal', 'jp', 'justice', 'accountant', 'consultant', 'agent', 'real estate', 'notary', 'print', 'photo']
};

async function main() {
    const { data: vendors, error } = await supabase.from('vendors').select('id, business_name, category');
    if (error) {
        console.error("Error fetching vendors:", error);
        return;
    }

    console.log(`Analyzing ${vendors.length} vendors for suspicious categories...`);
    let suspiciousCount = 0;

    vendors.forEach(vendor => {
        const nameLower = vendor.business_name.toLowerCase();
        const currentCategory = vendor.category || 'Uncategorized';
        
        let predictedCategory = null;
        for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
            if (keywords.some(kw => nameLower.includes(kw))) {
                predictedCategory = cat;
                break;
            }
        }

        if (predictedCategory && predictedCategory !== currentCategory) {
            console.log(`\n⚠️ Suspicious Match: ${vendor.business_name}`);
            console.log(`   Current: ${currentCategory}`);
            console.log(`   Suggested: ${predictedCategory}`);
            suspiciousCount++;
        }
    });

    console.log(`\nFound ${suspiciousCount} potentially miscategorized businesses.`);
}

main();
