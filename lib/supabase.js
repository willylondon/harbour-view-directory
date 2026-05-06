import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const VENDOR_IMAGES_BUCKET = 'vendor-images'
export const RENTAL_IMAGES_BUCKET = 'rental-images'

/**
 * Accepts whatever is stored in images[] and returns a usable URL.
 * Full https:// URLs pass through unchanged.
 * Bare storage paths are resolved via getPublicUrl().
 * Null/empty returns null so the caller renders its category fallback.
 */
export function getImageUrl(value, bucket = VENDOR_IMAGES_BUCKET) {
    if (!value || typeof value !== 'string') return null
    if (value.startsWith('http://') || value.startsWith('https://')) return value
    const { data } = supabase.storage.from(bucket).getPublicUrl(value)
    return data?.publicUrl || null
}
