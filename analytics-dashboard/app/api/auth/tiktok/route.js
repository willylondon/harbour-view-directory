import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const redirect_uri = `${protocol}://${host}/api/auth/tiktok/callback`;

    // Generate a secure random state
    const state = Math.random().toString(36).substring(2);

    const url = new URL('https://www.tiktok.com/v2/auth/authorize/');
    url.searchParams.append('client_key', process.env.TIKTOK_CLIENT_KEY);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', 'user.info.basic,user.info.stats');
    url.searchParams.append('redirect_uri', redirect_uri);
    url.searchParams.append('state', state);
    // Force TikTok to show the auth screen even if already logged in
    url.searchParams.append('disable_auto_auth', '1');
    url.searchParams.append('prompt', 'login consent');

    const cookieStore = await cookies();
    cookieStore.set('tiktok_auth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 10 });

    return NextResponse.redirect(url.toString());
}
