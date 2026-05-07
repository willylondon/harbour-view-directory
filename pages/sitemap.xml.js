import { supabase } from '../lib/supabase';

const BASE_URL = 'https://harbourviewdirectory.online';

function generateSiteMap(vendors, rentals) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Manual Routes -->
    <url><loc>${BASE_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>${BASE_URL}/directory</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>${BASE_URL}/post-ad</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
    <url><loc>${BASE_URL}/rent-near-cmu</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
    
    <!-- Dynamic Vendor Routes -->
    ${vendors
        .map(({ slug, id, updated_at }) => `
    <url>
        <loc>${BASE_URL}/vendor/${slug || id}</loc>
        <lastmod>${new Date(updated_at || Date.now()).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
    
    <!-- Dynamic Rental Routes -->
    ${rentals
        .map(({ slug, id, updated_at }) => `
    <url>
        <loc>${BASE_URL}/rent-near-cmu/${slug || id}</loc>
        <lastmod>${new Date(updated_at || Date.now()).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`).join('')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
    // We only want approved records in the sitemap
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, slug, updated_at')
        .eq('is_approved', true);

    const { data: rentals } = await supabase
        .from('rentals')
        .select('id, slug, updated_at')
        .eq('status', 'approved');

    const sitemap = generateSiteMap(vendors || [], rentals || []);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
}

export default function SiteMap() {
    // getServerSideProps will do the heavy lifting
}
