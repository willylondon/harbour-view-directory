import { supabase } from '../../lib/supabase';

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
    try {
        // Static pages
        const staticPages = [
            {
                loc: `${SITE_URL}/`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'daily',
                priority: '1.0'
            },
            {
                loc: `${SITE_URL}/events`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: '0.8'
            },
            {
                loc: `${SITE_URL}/pricing`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.7'
            },
            {
                loc: `${SITE_URL}/post-ad`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.7'
            },
            {
                loc: `${SITE_URL}/terms`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'yearly',
                priority: '0.3'
            },
            {
                loc: `${SITE_URL}/privacy`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'yearly',
                priority: '0.3'
            },
            {
                loc: `${SITE_URL}/contact`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.5'
            }
        ];

        // Fetch approved vendors
        const { data: vendors, error } = await supabase
            .from('vendors')
            .select('id, slug, business_name, updated_at, created_at')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching vendors for sitemap:', error);
            throw error;
        }

        // Vendor pages
        const vendorPages = (vendors || []).map(vendor => ({
            loc: `${SITE_URL}/vendor/${vendor.slug || vendor.id}`,
            lastmod: vendor.updated_at ? new Date(vendor.updated_at).toISOString().split('T')[0] : new Date(vendor.created_at).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.9'
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

        // Category pages (based on your categories)
        const categories = ['food-dining', 'professional-services', 'automotive', 'beauty-wellness', 'home-services', 'retail-shops'];
        const categoryPages = categories.map(category => ({
            loc: `${SITE_URL}/category/${category}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7'
        }));

        // Combine all URLs
        const allUrls = [...staticPages, ...vendorPages, ...eventPages, ...categoryPages];

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