-- ============================================================
-- PHASE 3: Google Places Enrichment Schema
-- Harbour View Directory — harbourviewdirectory.online
-- 
-- SAFE TO RUN MULTIPLE TIMES (all statements are idempotent).
-- Does NOT delete, truncate, or replace any existing data.
-- Run this in Supabase SQL Editor BEFORE running the enrichment script.
-- ============================================================

-- ------------------------------------------------------------
-- STEP 1: Add Google Places enrichment columns to vendors
-- All additions use ADD COLUMN IF NOT EXISTS — safe to re-run.
-- Protected fields (name, slug, description, category, etc.)
-- are NOT touched by this migration.
-- ------------------------------------------------------------

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS google_place_id    TEXT UNIQUE;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS latitude           NUMERIC(10, 7);
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS longitude          NUMERIC(10, 7);
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS area               TEXT DEFAULT 'Harbour View';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS parish             TEXT DEFAULT 'Kingston / St. Andrew';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS postal_area        TEXT DEFAULT 'Kingston 17';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS website            TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS google_maps_url    TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS business_status    TEXT; -- OPERATIONAL | CLOSED_TEMPORARILY | CLOSED_PERMANENTLY
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS opening_hours      JSONB;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS price_level        INTEGER; -- 0-4 per Google Places
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS review_count       INTEGER;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS source             TEXT DEFAULT 'manual'; -- 'manual' | 'google_places'
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS data_quality_status TEXT DEFAULT 'unverified'; -- verified | needs_review | unverified
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS confidence_score   INTEGER DEFAULT 0; -- 0-100
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS last_verified_date DATE;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS admin_notes        TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ DEFAULT NOW();

-- ------------------------------------------------------------
-- STEP 2: Indexes for enrichment lookups
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vendors_google_place_id
    ON public.vendors (google_place_id)
    WHERE google_place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vendors_slug
    ON public.vendors (slug)
    WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vendors_area
    ON public.vendors (area);

CREATE INDEX IF NOT EXISTS idx_vendors_coordinates
    ON public.vendors (latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ------------------------------------------------------------
-- STEP 3: auto-update updated_at on vendors
-- Uses the handle_updated_at function already defined in schema.sql.
-- Drop trigger first (IF EXISTS) so re-runs are safe.
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS set_vendors_updated_at ON public.vendors;

CREATE TRIGGER set_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------
-- STEP 4: business_images table
-- Stores Google Places photo references per business.
-- Separate from vendors.images[] — never replaces it.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.business_images (
    id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id         UUID        REFERENCES public.vendors(id) ON DELETE CASCADE,
    business_slug     TEXT        NOT NULL,
    google_place_id   TEXT        NOT NULL,
    source            TEXT        NOT NULL DEFAULT 'google_places',
    photo_reference   TEXT        NOT NULL,
    photo_url         TEXT,       -- generated getPhoto URL, nullable
    width             INTEGER,
    height            INTEGER,
    attribution       TEXT        NOT NULL, -- REQUIRED per Google ToS
    date_collected    DATE        NOT NULL DEFAULT CURRENT_DATE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent exact duplicates for the same business+photo
    UNIQUE (google_place_id, photo_reference)
);

CREATE INDEX IF NOT EXISTS idx_business_images_vendor_id
    ON public.business_images (vendor_id);

CREATE INDEX IF NOT EXISTS idx_business_images_slug
    ON public.business_images (business_slug);

CREATE INDEX IF NOT EXISTS idx_business_images_place_id
    ON public.business_images (google_place_id);

-- RLS: public read, no public write (service role bypasses RLS for enrichment)
ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read business images" ON public.business_images;
CREATE POLICY "Public can read business images"
    ON public.business_images FOR SELECT
    USING (true);

-- ------------------------------------------------------------
-- STEP 5: enrichment_log table
-- Immutable audit trail of every enrichment action.
-- Never delete rows from this table.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.enrichment_log (
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    run_id           UUID        NOT NULL,  -- UUID per script run; groups all actions in one run
    action           TEXT        NOT NULL,  -- insert_new | update_existing | needs_review | reject | skip_duplicate
    vendor_id        UUID        REFERENCES public.vendors(id) ON DELETE SET NULL,
    name             TEXT        NOT NULL,
    slug             TEXT,
    google_place_id  TEXT,
    fields_updated   JSONB,      -- which fields were changed, with old/new values
    images_added     JSONB,      -- photo_references added in this action
    confidence_score INTEGER,
    reason           TEXT,       -- human-readable explanation
    dry_run          BOOLEAN     NOT NULL DEFAULT true,  -- true = no DB change was made
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrichment_log_run_id
    ON public.enrichment_log (run_id);

CREATE INDEX IF NOT EXISTS idx_enrichment_log_action
    ON public.enrichment_log (action);

CREATE INDEX IF NOT EXISTS idx_enrichment_log_vendor_id
    ON public.enrichment_log (vendor_id)
    WHERE vendor_id IS NOT NULL;

-- RLS: admins only (service role bypasses for enrichment)
ALTER TABLE public.enrichment_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read enrichment log" ON public.enrichment_log;
CREATE POLICY "Admins can read enrichment log"
    ON public.enrichment_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR p.is_admin = true)
        )
    );

-- ============================================================
-- VERIFICATION QUERIES — run after migration to confirm
-- ============================================================

-- 1. Confirm new columns exist on vendors
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'vendors'
  AND column_name IN (
    'google_place_id','latitude','longitude','area','parish',
    'postal_area','website','google_maps_url','business_status',
    'opening_hours','price_level','review_count','source',
    'data_quality_status','confidence_score','last_verified_date',
    'admin_notes','updated_at'
  )
ORDER BY column_name;

-- 2. Confirm business_images table exists
SELECT COUNT(*) AS image_records FROM public.business_images;

-- 3. Confirm enrichment_log table exists
SELECT COUNT(*) AS log_records FROM public.enrichment_log;

-- Expected: all columns listed in query 1 appear, counts are 0 (empty tables).
