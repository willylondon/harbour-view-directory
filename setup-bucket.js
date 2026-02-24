const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
    const bucketName = 'vendor-images';

    console.log(`Checking memory for bucket ${bucketName}...`);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error("Error listing buckets:", listError);
        return;
    }

    const bucketExists = buckets.find(b => b.name === bucketName);

    if (!bucketExists) {
        console.log(`Bucket ${bucketName} does not exist. Creating...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB in bytes
        });

        if (error) {
            console.error("Failed to create bucket:", error);
            return;
        }
        console.log("Bucket created successfully!");
    } else {
        console.log(`Bucket ${bucketName} already exists. Updating settings...`);
        const { data, error } = await supabase.storage.updateBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
        });

        if (error) {
            console.error("Failed to update bucket settings:", error);
        } else {
            console.log("Bucket configured for images up to 5MB!");
        }
    }
}

setupBucket();
