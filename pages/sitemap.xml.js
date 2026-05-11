import { supabase } from '../lib/supabase';
import { CATEGORY_TAXONOMY } from '../lib/categoryMap';
import { applyPublicRentalFilters, applyPublicVendorFilters, filterPublicRentals, filterPublicVendors } from '../lib/publicDirectory';

const BASE_URL = 'https://harbourviewdirectory.online';

function generateSiteMap(vendors, rentals) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Manual Routes -->
    <url><loc>${BASE_URL}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>${BASE_URL}/directory</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
    <url><loc>${BASE_URL}/post-ad</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
    <url><loc>${BASE_URL}/rent-near-cmu</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
    <url><loc>${BASE_URL}/rent-near-cmu/submit</loc><changefreq>monthly</changefreq><priority>0.65</priority></url>
    <url><loc>${BASE_URL}/pricing</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
    <url><loc>${BASE_URL}/safety</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>${BASE_URL}/events</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>
    <url><loc>${BASE_URL}/report</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
    <url><loc>${BASE_URL}/contact</loc><changefreq>monthly</changefreq><priority>0.55</priority></url>
    <url><loc>${BASE_URL}/faq</loc><changefreq>monthly</changefreq><priority>0.55</priority></url>
    <url><loc>${BASE_URL}/verification</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
    <url><loc>${BASE_URL}/listing-guidelines</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
    <url><loc>${BASE_URL}/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
    <url><loc>${BASE_URL}/terms</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
    ${CATEGORY_TAXONOMY.map(category => `
    <url>
        <loc>${BASE_URL}/directory?category=${encodeURIComponent(category)}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.65</priority>
    </url>`).join('')}
    
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
    const { data: vendors } = await applyPublicVendorFilters(
        supabase
            .from('vendors')
            .select('id, slug, updated_at, locality_status, public_visibility, data_quality_status')
    );

    const { data: rentals } = await applyPublicRentalFilters(
        supabase
            .from('rentals')
            .select('id, slug, updated_at, locality_status, public_visibility, status')
    );

    const sitemap = generateSiteMap(filterPublicVendors(vendors || []), filterPublicRentals(rentals || []));

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
