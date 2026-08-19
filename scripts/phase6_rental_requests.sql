-- Migration: Rental Requests (Waitlist & Vacancy Inquiry for Renters/Boarders)
CREATE TABLE IF NOT EXISTS public.rental_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    occupant_type TEXT NOT NULL DEFAULT 'Student', -- 'Student', 'Worker', 'Couple', 'Family', 'Other'
    cmu_affiliation BOOLEAN DEFAULT false,
    requested_type TEXT NOT NULL DEFAULT 'Room', -- 'Room', 'Studio', 'Apartment', 'Shared', 'House', 'Any'
    max_budget NUMERIC(10, 2) NOT NULL,
    move_in_date DATE,
    duration TEXT DEFAULT 'Long Term (6+ months)',
    need_furnished BOOLEAN DEFAULT true,
    need_utilities_included BOOLEAN DEFAULT true,
    need_parking BOOLEAN DEFAULT false,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'matched', 'closed'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_rental_requests_status_created ON public.rental_requests (status, created_at DESC);

-- Enable RLS
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;

-- Allow public insert (with honeypot & backend rate-limiting)
DROP POLICY IF EXISTS "Public can submit rental requests" ON public.rental_requests;
CREATE POLICY "Public can submit rental requests" 
ON public.rental_requests 
FOR INSERT 
WITH CHECK (true);

-- Admins can view and manage all requests
DROP POLICY IF EXISTS "Admins can view rental requests" ON public.rental_requests;
CREATE POLICY "Admins can view rental requests" 
ON public.rental_requests 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
