import { parse } from 'cookie';
import { supabase } from './supabase';

/**
 * Gets the current authenticated user from the request cookies.
 * @param {import('next').NextApiRequest} req 
 * @returns {Promise<import('@supabase/supabase-js').User | null>}
 */
export async function getAuthUser(req) {
  try {
    const cookies = parse(req.headers.cookie || '');
    // Supabase stores the session in a cookie named sb-<project-id>-auth-token
    // But in newer versions or specific configs it might be different.
    // However, we can also check the Authorization header.
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Try to find the supabase auth cookie
      const supabaseCookie = Object.keys(cookies).find(k => k.endsWith('-auth-token'));
      if (supabaseCookie) {
        const cookieData = JSON.parse(cookies[supabaseCookie]);
        token = cookieData[0]; // Usually the first element is the access_token
      }
    }

    if (!token) return null;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    
    return user;
  } catch (error) {
    console.error('getAuthUser error:', error);
    return null;
  }
}
