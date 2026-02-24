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

-- 6. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    category TEXT,
    image_url TEXT,
    is_paid BOOLEAN DEFAULT false,
    paid_tier TEXT DEFAULT 'basic',
    status TEXT DEFAULT 'pending',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS for Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for Events Table
CREATE POLICY "Events are viewable by everyone." 
ON public.events FOR SELECT USING (
    (status = 'active' AND (expires_at IS NULL OR expires_at > NOW()))
    OR EXISTS (
        SELECT 1 FROM public.vendors v 
        WHERE v.id = vendor_id AND v.user_id = auth.uid()
    )
);

CREATE POLICY "Vendors can insert their own events." 
ON public.events FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.vendors v 
        WHERE v.id = vendor_id AND v.user_id = auth.uid()
    )
);

CREATE POLICY "Vendors can update their own events." 
ON public.events FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.vendors v 
        WHERE v.id = vendor_id AND v.user_id = auth.uid()
    )
);

CREATE POLICY "Vendors can delete their own events." 
ON public.events FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.vendors v 
        WHERE v.id = vendor_id AND v.user_id = auth.uid()
    )
);

-- 9. Storage Policies for Vendor Images
-- Ensure storage.objects has RLS enabled in Supabase.
CREATE POLICY "Public vendor images are viewable by everyone."
ON storage.objects FOR SELECT USING (bucket_id = 'vendor-images');

CREATE POLICY "Authenticated users can upload vendor images."
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'vendor-images' AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own vendor images."
ON storage.objects FOR UPDATE USING (
    bucket_id = 'vendor-images' AND auth.uid() = owner
) WITH CHECK (
    bucket_id = 'vendor-images' AND auth.uid() = owner
);

CREATE POLICY "Users can delete their own vendor images."
ON storage.objects FOR DELETE USING (
    bucket_id = 'vendor-images' AND auth.uid() = owner
);
