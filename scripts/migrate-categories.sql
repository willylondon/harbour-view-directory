-- Run in Supabase SQL Editor to update vendor categories to the new taxonomy
-- =========================================================================
-- Review the SELECTs first, then uncomment the UPDATEs to apply.

-- ── PREVIEW: what will change ──────────────────────────────────────────────

SELECT category, COUNT(*) AS count
FROM public.vendors
GROUP BY category
ORDER BY count DESC;

-- ── UPDATES ────────────────────────────────────────────────────────────────

-- Food & Dining  →  Food & Beverage
-- UPDATE public.vendors SET category = 'Food & Beverage' WHERE category = 'Food & Dining';

-- Automotive  →  Transport
-- UPDATE public.vendors SET category = 'Transport' WHERE category = 'Automotive';

-- Retail Shops  →  Retail
-- UPDATE public.vendors SET category = 'Retail' WHERE category = 'Retail Shops';

-- Retail Services  →  Retail
-- UPDATE public.vendors SET category = 'Retail' WHERE category = 'Retail Services';

-- Home Maintenance & Repair  →  Home Services
-- UPDATE public.vendors SET category = 'Home Services' WHERE category = 'Home Maintenance & Repair';

-- Accommodation & Transport  →  Transport
-- UPDATE public.vendors SET category = 'Transport' WHERE category = 'Accommodation & Transport';

-- Health & Medical  →  Emergency
-- UPDATE public.vendors SET category = 'Emergency' WHERE category = 'Health & Medical';

-- Education  →  Community
-- UPDATE public.vendors SET category = 'Community' WHERE category = 'Education';

-- Other Community Services  →  Community
-- UPDATE public.vendors SET category = 'Community' WHERE category = 'Other Community Services';

-- ── VERIFY AFTER RUNNING ───────────────────────────────────────────────────

-- SELECT category, COUNT(*) AS count
-- FROM public.vendors
-- GROUP BY category
-- ORDER BY count DESC;
