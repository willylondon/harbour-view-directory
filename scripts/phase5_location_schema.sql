-- Phase 5: Location Validation & Quarantine

-- 1. Add columns to vendors with safe defaults for existing records
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS locality_status VARCHAR DEFAULT 'needs_manual_review',
ADD COLUMN IF NOT EXISTS location_confidence INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS location_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_review_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS public_visibility BOOLEAN DEFAULT true;

-- 2. Add columns to rentals with safe defaults for existing records
ALTER TABLE rentals
ADD COLUMN IF NOT EXISTS locality_status VARCHAR DEFAULT 'needs_manual_review',
ADD COLUMN IF NOT EXISTS location_confidence INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS location_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_review_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS public_visibility BOOLEAN DEFAULT true;

-- 3. Add CHECK constraints
ALTER TABLE vendors
ADD CONSTRAINT vendors_locality_status_check
CHECK (
  locality_status IN (
    'harbour_view_verified',
    'harbour_view_likely',
    'nearby_allowed',
    'out_of_area_rejected',
    'needs_manual_review'
  )
);

ALTER TABLE rentals
ADD CONSTRAINT rentals_locality_status_check
CHECK (
  locality_status IN (
    'harbour_view_verified',
    'harbour_view_likely',
    'nearby_allowed',
    'out_of_area_rejected',
    'needs_manual_review'
  )
);

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_vendors_public_locality
ON vendors (public_visibility, locality_status);

CREATE INDEX IF NOT EXISTS idx_vendors_category
ON vendors (category);

CREATE INDEX IF NOT EXISTS idx_rentals_public_locality
ON rentals (public_visibility, locality_status);
