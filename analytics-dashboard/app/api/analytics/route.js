import { BetaAnalyticsDataClient } from '@google-analytics/data';

const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const credentials = rawJson ? JSON.parse(rawJson) : null;

const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

const mockDataTemplate = [
    {
        id: "harbour-view",
        name: "Harbour View Directory",
        url: "harbourviewdirectory.online",
        propertyId: process.env.GA_PROPERTY_ID_HARBOUR_VIEW,
        color: "#3b82f6",
        customMetrics: { vendors: 142, reviews: 890 },
        traffic: { visitors: 12450, pageViews: 45200 },
        dailyTraffic: [
            { date: "Mon", visitors: 1100, pageViews: 4000 },
            { date: "Tue", visitors: 1300, pageViews: 4200 },
            { date: "Wed", visitors: 1250, pageViews: 4100 },
            { date: "Thu", visitors: 1500, pageViews: 4800 },
            { date: "Fri", visitors: 1800, pageViews: 5200 },
            { date: "Sat", visitors: 2200, pageViews: 7100 },
            { date: "Sun", visitors: 2000, pageViews: 6500 },
        ],
        sources: [
            { name: "Direct", value: 400 },
            { name: "Organic Search", value: 300 },
            { name: "Social", value: 300 },
        ],
    },
    {
        id: "lifestyle-hikers",
        name: "Lifestyle Hikers",
        url: "lifestyle-hikers.github.io",
        propertyId: process.env.GA_PROPERTY_ID_LIFESTYLE_HIKERS,
        color: "#10b981",
        customMetrics: { signups: 450, events: 12 },
        traffic: { visitors: 3200, pageViews: 8400 },
        dailyTraffic: [
            { date: "Mon", visitors: 300, pageViews: 800 },
            { date: "Tue", visitors: 320, pageViews: 850 },
            { date: "Wed", visitors: 280, pageViews: 750 },
            { date: "Thu", visitors: 350, pageViews: 900 },
            { date: "Fri", visitors: 400, pageViews: 1050 },
            { date: "Sat", visitors: 800, pageViews: 2100 },
            { date: "Sun", visitors: 750, pageViews: 1950 },
        ],
        sources: [
            { name: "Direct", value: 250 },
            { name: "Organic Search", value: 450 },
            { name: "Social", value: 300 },
        ],
    },
    {
        id: "creative-technician",
        name: "Creative Technician",
        url: "github.com/willylondon/creative-technician",
        propertyId: process.env.GA_PROPERTY_ID_CREATIVE_TECHNICIAN,
        color: "#8b5cf6",
        customMetrics: { projects: 8, performanceScore: 94 },
        traffic: { visitors: 1540, pageViews: 3200 },
        dailyTraffic: [
            { date: "Mon", visitors: 180, pageViews: 400 },
            { date: "Tue", visitors: 210, pageViews: 450 },
            { date: "Wed", visitors: 250, pageViews: 500 },
            { date: "Thu", visitors: 230, pageViews: 480 },
            { date: "Fri", visitors: 200, pageViews: 420 },
            { date: "Sat", visitors: 150, pageViews: 350 },
            { date: "Sun", visitors: 160, pageViews: 380 },
        ],
        sources: [
            { name: "Direct", value: 600 },
            { name: "Referral", value: 300 },
            { name: "Social", value: 100 },
        ],
    },
];

async function getGAData(propertyId) {
    if (!propertyId || !credentials.client_email) return null;

    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
            metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        });

        if (!response.rows || response.rows.length === 0) {
            return {
                traffic: { visitors: 0, pageViews: 0 },
                dailyTraffic: [],
                sources: []
            };
        }

        let totalVisitors = 0;
        let totalPageViews = 0;
        const dailyMap = {};
        const sourcesMap = {};

        response.rows.forEach(row => {
            const dateStr = row.dimensionValues[0].value;
            const source = row.dimensionValues[1].value;
            const users = parseInt(row.metricValues[0].value, 10);
            const views = parseInt(row.metricValues[1].value, 10);

            totalVisitors += users;
            totalPageViews += views;

            if (!dailyMap[dateStr]) {
                dailyMap[dateStr] = { visitors: 0, pageViews: 0 };
            }
            dailyMap[dateStr].visitors += users;
            dailyMap[dateStr].pageViews += views;

            if (!sourcesMap[source]) {
                sourcesMap[source] = 0;
            }
            sourcesMap[source] += users;
        });

        const dailyTraffic = Object.entries(dailyMap).map(([date, metrics]) => {
            const formattedDate = `${date.substring(4, 6)}/${date.substring(6, 8)}`;
            return { date: formattedDate, ...metrics };
        }).sort((a, b) => a.date.localeCompare(b.date));

        const sources = Object.entries(sourcesMap).map(([name, value]) => ({ name, value }));

        return {
            traffic: { visitors: totalVisitors, pageViews: totalPageViews },
            dailyTraffic,
            sources
        };

    } catch (err) {
        console.error("GA API Error for property", propertyId, err.message);
        return null;
    }
}

export async function GET() {
    const finalData = [];

    for (const site of mockDataTemplate) {
        let siteData = { ...site }; // Default to mock data

        if (site.propertyId) {
            const cleanPropertyId = site.propertyId.trim();
            const gaData = await getGAData(cleanPropertyId);
            console.log(`GA Data for ${site.name} (${cleanPropertyId}):`, gaData);
            // Only overwrite mock data if we successfully pulled real data that isn't empty
            if (gaData) {
                siteData.traffic = gaData.traffic;
                siteData.dailyTraffic = gaData.dailyTraffic;
                siteData.sources = gaData.sources;
                siteData._isLiveData = true;
            }
        }

        finalData.push(siteData);
    }

    return Response.json({ success: true, data: finalData });
}
