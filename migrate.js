require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// We need the service role key to bypass RLS and create users via Admin API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in .env.local');
    console.log('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file from your Supabase dashboard (Project Settings -> API -> service_role secret).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function migrate() {
    console.log('Starting migration from Staging API...');

    try {
        // 1. Fetch Vendors from Staging API
        console.log('Fetching vendors from https://harbourview.n8nwillylondon.work/api/vendors ...');
        const res = await fetch('https://harbourview.n8nwillylondon.work/api/vendors');
        const stagingVendors = await res.json();
        console.log(`Found ${stagingVendors.length} vendors on staging.`);

        // 2. Ensure we have an "Admin" user to own these listings
        const adminEmail = 'admin@harbourview.com';
        let adminUserId;

        console.log(`Checking for admin user: ${adminEmail}`);
        const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) throw usersError;

        const existingAdmin = usersData.users.find(u => u.email === adminEmail);

        if (existingAdmin) {
            console.log('Admin user found.');
            adminUserId = existingAdmin.id;
        } else {
            console.log('Creating Admin user to own the migrated vendors...');
            const { data: newUserData, error: newUserError } = await supabase.auth.admin.createUser({
                email: adminEmail,
                password: 'SecurePassword123!',
                email_confirm: true
            });
            if (newUserError) throw newUserError;
            adminUserId = newUserData.user.id;
            console.log('Admin user created successfully.');
            // Wait a moment for trigger to create public.users record
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 3. Format vendors for Supabase insert
        const formattedVendors = stagingVendors.map(v => ({
            user_id: adminUserId,
            business_name: v.businessName,
            owner_name: '', // Staging doesn't differentiate owner from business clearly in basic view
            category: v.mainCategory || 'Other Community Services',
            description: v.detailedServices || v.description,
            phone: v.contactPhone,
            whatsapp: v.contactWhatsApp,
            address: v.areaOfOperation,
            images: v.imageLink ? [v.imageLink] : [],
            is_featured: false,
            is_top_ad: false,
            tier: 'free'
        }));

        // 4. Cleanup and Batch Insert
        console.log('Clearing existing vendors for a fresh migration...');
        const { error: deleteError } = await supabase
            .from('vendors')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) throw deleteError;

        console.log(`Inserting ${formattedVendors.length} vendors into Supabase...`);
        const { data: insertData, error: insertError } = await supabase
            .from('vendors')
            .insert(formattedVendors);

        if (insertError) throw insertError;

        console.log('Migration Complete! All vendors successfully imported.');

    } catch (error) {
        console.error('\nMigration failed with error:', error);
    }
}

migrate();
