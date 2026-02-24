require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
    const { data, count, error } = await supabase
        .from('vendors')
        .select('business_name', { count: 'exact' });

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log(`Total vendors in database: ${count}`);

    const counts = {};
    data.forEach(v => {
        counts[v.business_name] = (counts[v.business_name] || 0) + 1;
    });

    const duplicates = Object.entries(counts).filter(([name, count]) => count > 1);
    console.log(`Number of duplicated business names: ${duplicates.length}`);

    if (duplicates.length > 0) {
        console.log('Sample duplicates:');
        duplicates.slice(0, 5).forEach(([name, count]) => {
            console.log(` - ${name}: ${count} copies`);
        });
    }
}

checkDuplicates();
