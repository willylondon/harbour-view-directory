import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const accountsStr = cookieStore.get('tiktok_accounts')?.value;

    // Legacy single token fallback just in case
    const legacyToken = cookieStore.get('tiktok_access_token')?.value;

    if (!accountsStr && !legacyToken) {
        return NextResponse.json({ connected: false, data: [] });
    }

    let accounts = [];
    if (accountsStr) {
        try { accounts = JSON.parse(accountsStr); } catch (e) { }
    } else if (legacyToken) {
        accounts = [{ accessToken: legacyToken }];
    }

    if (accounts.length === 0) {
        return NextResponse.json({ connected: false, data: [] });
    }

    const allData = [];
    const errors = [];

    for (const acc of accounts) {
        try {
            const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count', {
                headers: {
                    'Authorization': `Bearer ${acc.accessToken}`
                }
            });

            const userData = await userRes.json();

            if (userData.data?.user) {
                // Ensure each account has a unique identifier
                allData.push(userData.data.user);
            } else if (userData.error && userData.error.code !== 'ok') {
                errors.push(userData.error);
            } else if (userData.error && userData.error.message) {
                errors.push(userData.error);
            }
        } catch (err) {
            console.error("TikTok fetch error:", err);
            errors.push(err.message);
        }
    }

    return NextResponse.json({
        connected: allData.length > 0,
        data: allData,
        errors: errors.length > 0 ? errors : undefined
    });
}
