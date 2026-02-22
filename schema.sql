-- Run this in the Supabase SQL Editor!

-- 1. Create Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    owner_name TEXT,
    category TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    images TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_top_ad BOOLEAN DEFAULT false,
    tier TEXT DEFAULT 'free',
    rating NUMERIC(3, 1) DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Vendors Table
-- Anyone can read active vendors
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.vendors FOR SELECT USING (true);

-- Authenticated users can insert their own vendor profile
CREATE POLICY "Users can insert their own vendor." 
ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own vendor profile
CREATE POLICY "Users can update own vendor." 
ON public.vendors FOR UPDATE USING (auth.uid() = user_id);

-- Authenticated users can delete their own vendor profile
CREATE POLICY "Users can delete own vendor." 
ON public.vendors FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS Policies for Reviews Table
-- Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone." 
ON public.reviews FOR SELECT USING (true);

-- Anyone can insert a review (or restrict to authenticated users if you prefer)
-- For now we allow insert for anon as well since we don't force login to review yet
CREATE POLICY "Anyone can insert a review." 
ON public.reviews FOR INSERT WITH CHECK (true);
