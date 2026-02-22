// A quick script to inspect the staging site's HTML for data
const fs = require('fs');

async function scrape() {
    const url = 'https://harbourview.n8nwillylondon.work/';
    const res = await fetch(url);
    const html = await res.text();

    // Try to find Next.js data
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
        fs.writeFileSync('next_data.json', nextDataMatch[1]);
        console.log('Found __NEXT_DATA__! Saved to next_data.json');
        return;
    }

    // Try to find Next 13+ App router data (RSC payload) or raw state
    console.log('No __NEXT_DATA__ found. Saving raw HTML to investigate.');
    fs.writeFileSync('raw.html', html);
}

scrape();
