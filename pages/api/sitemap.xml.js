import { supabase } from '../../lib/supabase';
import { applyPublicRentalFilters, applyPublicVendorFilters, filterPublicRentals, filterPublicVendors } from '../../lib/publicDirectory';
import { getAllBlogPosts } from '../../lib/blogPosts';
import { CATEGORY_LANDING_PAGES } from '../../lib/categoryLandingPages';

const SITE_URL = 'https://harbourviewdirectory.online';

function generateSitemapXml(urls) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(url => `
    <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>
    `).join('')}
</urlset>`;
}

export default async function handler(req, res) {
    const today = new Date().toISOString().split('T')[0];
    try {
        // Static pages
        const staticPages = [
            { loc: `${SITE_URL}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
            { loc: `${SITE_URL}/directory`, lastmod: today, changefreq: 'daily', priority: '0.95' },
            { loc: `${SITE_URL}/blog`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
            { loc: `${SITE_URL}/rent-near-cmu`, lastmod: today, changefreq: 'weekly', priority: '0.85' },
            { loc: `${SITE_URL}/deals`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
            { loc: `${SITE_URL}/safety`, lastmod: today, changefreq: 'daily', priority: '0.8' },
            { loc: `${SITE_URL}/events`, lastmod: today, changefreq: 'weekly', priority: '0.75' },
            { loc: `${SITE_URL}/pricing`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
            { loc: `${SITE_URL}/post-ad`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
            { loc: `${SITE_URL}/contact`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
            { loc: `${SITE_URL}/faq`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
            { loc: `${SITE_URL}/verification`, lastmod: today, changefreq: 'monthly', priority: '0.4' },
            { loc: `${SITE_URL}/listing-guidelines`, lastmod: today, changefreq: 'monthly', priority: '0.4' },
            { loc: `${SITE_URL}/terms`, lastmod: today, changefreq: 'yearly', priority: '0.3' },
            { loc: `${SITE_URL}/privacy`, lastmod: today, changefreq: 'yearly', priority: '0.3' },
        ];

        // Fetch approved vendors
        const { data: vendors, error } = await applyPublicVendorFilters(
            supabase
                .from('vendors')
                .select('id, slug, business_name, updated_at, created_at, locality_status, public_visibility, data_quality_status')
        )
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching vendors for sitemap:', error);
            throw error;
        }

        // Vendor pages
        const vendorPages = filterPublicVendors(vendors || []).map(vendor => ({
            loc: `${SITE_URL}/vendor/${vendor.slug || vendor.id}`,
            lastmod: vendor.updated_at ? new Date(vendor.updated_at).toISOString().split('T')[0] : new Date(vendor.created_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.9'
        }));

        const { data: rentals } = await applyPublicRentalFilters(
            supabase
                .from('rentals')
                .select('id, slug, updated_at, locality_status, public_visibility, status')
        )
            .order('updated_at', { ascending: false });

        const rentalPages = filterPublicRentals(rentals || []).map(rental => ({
            loc: `${SITE_URL}/rent-near-cmu/${rental.slug || rental.id}`,
            lastmod: new Date(rental.updated_at || Date.now()).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7'
        }));

        // Fetch upcoming events
        const { data: events } = await supabase
            .from('events')
            .select('id, title, start_date, created_at')
            .eq('is_approved', true)
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true });

        // Event pages
        const eventPages = (events || []).map(event => ({
            loc: `${SITE_URL}/event/${event.id}`,
            lastmod: new Date(event.created_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.8'
        }));

        const blogPages = getAllBlogPosts().map(post => ({
            loc: `${SITE_URL}/blog/${post.slug}`,
            lastmod: post.updatedAt,
            changefreq: 'monthly',
            priority: '0.75'
        }));

        const categoryPages = CATEGORY_LANDING_PAGES.map(page => ({
            loc: `${SITE_URL}/category/${page.slug}`,
            lastmod: today,
            changefreq: 'weekly',
            priority: '0.78'
        }));

        // Combine all URLs (drop stale category/* pages)
        const allUrls = [...staticPages, ...vendorPages, ...rentalPages, ...eventPages, ...blogPages, ...categoryPages];

        // Generate XML
        const sitemapXml = generateSitemapXml(allUrls);

        // Set response headers
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
        
        // Send the XML
        res.status(200).send(sitemapXml);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).json({ error: 'Failed to generate sitemap' });
    }
}
