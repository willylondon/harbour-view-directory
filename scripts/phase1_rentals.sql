-- Phase 1: Rentals Database Schema

-- 1. Create status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.rental_status AS ENUM ('pending', 'approved', 'rejected', 'rented');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Table
CREATE TABLE IF NOT EXISTS public.rentals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    contact_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    type TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0),
    deposit NUMERIC,
    location TEXT NOT NULL,
    available_date DATE,
    utilities_included BOOLEAN DEFAULT false,
    furnished BOOLEAN DEFAULT false,
    distance_to_cmu TEXT,
    distance_sort INTEGER NOT NULL CHECK (distance_sort >= 1 AND distance_sort <= 5),
    photos TEXT[] DEFAULT '{}',
    house_rules TEXT,
    status public.rental_status DEFAULT 'pending',
    slug TEXT UNIQUE NOT NULL,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    landlord_name TEXT, -- private field
    admin_notes TEXT -- private field
);

-- 3. Add Indexes
-- Composite index for the main public query
CREATE INDEX IF NOT EXISTS idx_rentals_public_query 
ON public.rentals (status, expires_at, distance_sort, created_at)
WHERE status = 'approved';

-- Slug index for lookups
CREATE INDEX IF NOT EXISTS idx_rentals_slug ON public.rentals (slug);

-- 4. Enable RLS
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- SELECT: Allow public to see only approved and non-expired listings
DROP POLICY IF EXISTS "Public can view approved rentals" ON public.rentals;
CREATE POLICY "Public can view approved rentals"
ON public.rentals
FOR SELECT
USING (
    status = 'approved' 
    AND (expires_at IS NULL OR expires_at > NOW())
);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.rentals;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.rentals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
