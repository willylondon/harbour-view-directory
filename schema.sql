-- Create public.users table to store user profiles
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In Supabase, you typically want a trigger to auto-create a public.users record
-- when a new user signs up in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create vendors table
CREATE TABLE public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    business_name TEXT NOT NULL,
    owner_name TEXT,
    category TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    images TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    is_top_ad BOOLEAN DEFAULT FALSE,
    tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL, -- Storing name for simplicity, or could reference users(id)
    user_id UUID REFERENCES public.users(id), -- Optional: Link to user if authenticated
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- users policies
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

-- vendors policies
CREATE POLICY "Vendors are viewable by everyone" 
    ON public.vendors FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own vendor listing" 
    ON public.vendors FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendor listing" 
    ON public.vendors FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendor listing" 
    ON public.vendors FOR DELETE 
    USING (auth.uid() = user_id);

-- reviews policies
CREATE POLICY "Reviews are viewable by everyone" 
    ON public.reviews FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can insert reviews" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews" 
    ON public.reviews FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
    ON public.reviews FOR DELETE 
    USING (auth.uid() = user_id);
