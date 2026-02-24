import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdmin() {
    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase server environment variables.');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

export function getSupabaseUserClient(accessToken) {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase public environment variables.');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
    });
}
