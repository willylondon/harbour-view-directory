import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/?error=tiktok_auth_failed', request.url));
    }

    const cookieStore = await cookies();

    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const redirect_uri = `${protocol}://${host}/api/auth/tiktok/callback`;

    try {
        const body = new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri
        });

        const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
            body: body.toString()
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error('TikTok Token Error:', tokenData);
            return NextResponse.redirect(new URL('/?error=tiktok_token_failed', request.url));
        }

        const accessToken = tokenData.access_token;
        const openId = tokenData.open_id; // Unique identifier for this user

        // Fetch existing accounts from cookie array
        const existingAccountsStr = cookieStore.get('tiktok_accounts')?.value;
        let accounts = [];
        if (existingAccountsStr) {
            try { accounts = JSON.parse(existingAccountsStr); } catch (e) { }
        }

        // Remove this account if it already exists so we can update it
        accounts = accounts.filter(acc => acc.openId !== openId);

        // Add the new valid access token
        accounts.push({
            openId: openId,
            accessToken: accessToken,
        });

        // Store back in cookies
        cookieStore.set('tiktok_accounts', JSON.stringify(accounts), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 86400 * 30 // Keep for 30 days
        });

        return NextResponse.redirect(new URL('/', request.url));
    } catch (err) {
        console.error('TikTok Callback error', err);
        return NextResponse.redirect(new URL('/?error=tiktok_callback_error', request.url));
    }
}
