# Rent Near CMU — Design Spec
**Date:** 2026-05-06
**Status:** Approved
**Live site:** https://harbourviewdirectory.online

---

## Overview

A separate rental listings vertical on Harbour View Directory. Landlords submit rooms and apartments via a public form. Admin reviews and approves before anything goes live. Tenants contact landlords directly via WhatsApp. No accounts required at launch.

This vertical uses Option C: **separate `rentals` table, maximum reuse of existing UI/data patterns**. It becomes the template for future modules (Notices, Deals, Safety).

---

## Architecture

- **Framework:** Next.js 16 Pages Router (same as rest of site)
- **Data:** New `public.rentals` table in existing Supabase project
- **Storage:** New `rental-images` bucket in existing Supabase Storage
- **Auth:** None required for submission. Admin actions use existing session check.
- **Patterns reused:** `getServerSideProps`, `supabase` client, `getImageUrl`, `EmptyState`, `card-premium` CSS, WhatsApp button, `onError` image fallback

**Required environment variables (add to Vercel if not already set):**
- `NEXT_PUBLIC_SUPABASE_URL` — already set
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — already set
- `SUPABASE_SERVICE_ROLE_KEY` — needed by `/api/rentals/submit` and `/api/admin/rentals/[action]` for server-side writes. Add in Vercel → Project Settings → Environment Variables.

---

## Database Schema

```sql
CREATE TABLE public.rentals (
    id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    title               TEXT        NOT NULL,
    description         TEXT        NOT NULL,
    contact_name        TEXT        NOT NULL,           -- shown publicly
    whatsapp            TEXT        NOT NULL,           -- normalized: +18761234567
    type                TEXT        NOT NULL,           -- see enum below
    price               NUMERIC     NOT NULL  CHECK (price > 0),
    deposit             NUMERIC,
    location            TEXT        NOT NULL,           -- general area only
    available_date      DATE,
    utilities_included  BOOLEAN     DEFAULT false,
    furnished           BOOLEAN     DEFAULT false,
    distance_to_cmu     TEXT,                          -- walking/<5 min/5–10 min/10–20 min/20+ min
    distance_sort       INT         CHECK (distance_sort BETWEEN 1 AND 5),
    photos              TEXT[],                        -- Supabase Storage public URLs
    house_rules         TEXT,
    status              TEXT        DEFAULT 'pending'
                                    CHECK (status IN ('pending','approved','rejected','rented')),
    slug                TEXT        UNIQUE,
    approved_at         TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    -- Private — never selected in frontend queries
    landlord_name       TEXT,
    admin_notes         TEXT
);

-- Indexes
CREATE INDEX rentals_public_idx ON public.rentals(status, expires_at, distance_sort, created_at);
CREATE INDEX rentals_slug_idx   ON public.rentals(slug);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER rentals_updated_at
BEFORE UPDATE ON public.rentals
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

**Rental types:** `room`, `studio`, `shared room`, `1 bedroom`, `2 bedroom`, `whole house`, `other`

**Distance labels → sort values:**

| Label | distance_sort |
|---|---|
| walking | 1 |
| <5 min | 2 |
| 5–10 min | 3 |
| 10–20 min | 4 |
| 20+ min | 5 |

**RLS:**
```sql
-- Public can read approved, non-expired listings
CREATE POLICY "Public can view approved rentals"
ON public.rentals FOR SELECT
USING (
    status = 'approved'
    AND (expires_at IS NULL OR expires_at > NOW())
);

-- No direct public INSERT — all submissions go through /api/rentals/submit
-- Admin mutations go through /api/admin/rentals/[action] (service role, server-side only)
```

---

## Pages & Routing

```
/rent-near-cmu                   Listing page — SSR, filter bar, rental cards
/rent-near-cmu/[slug]            Detail page — SSR, full listing, WhatsApp CTA
/rent-near-cmu/submit            Public submission form
/rent-near-cmu/submit?success=1  Success state (query param, same page)

/api/rentals/submit              POST — public submission endpoint
/api/admin/rentals/[action]      POST — admin mutations (approve/reject/renew/rented)

/admin?tab=rentals               Rentals tab inside existing admin page
/admin/rentals/[id]/preview      Admin-only preview — uses service role to fetch any status listing (bypasses RLS)
```

**Navbar order (updated):**
Directory → Rent Near CMU → Events → Deals *(placeholder)* → Safety *(placeholder)* → List Business

---

## Submission Form (`/rent-near-cmu/submit`)

### Fields (display order)

**About the rental**
| Field | Type | Required |
|---|---|---|
| Title | text | ✓ |
| Type | select | ✓ |
| Description | textarea | ✓ |
| Location | text | ✓ |
| Distance to CMU | select | ✓ |

**Pricing**
| Field | Type | Required |
|---|---|---|
| Price (JMD/month) | number | ✓ |
| Deposit (JMD) | number | — |
| Utilities included | checkbox | — |
| Furnished | checkbox | — |
| Available date | date | — |

**House rules**
| Field | Type | Required |
|---|---|---|
| House rules | textarea | — |

**Contact**
| Field | Type | Required | Public? |
|---|---|---|---|
| Contact name | text | ✓ | ✓ |
| WhatsApp number | tel | ✓ | ✓ |
| Landlord name | text | — | ✗ (admin only) |

**Photos**
| Field | Type | Required |
|---|---|---|
| Photos | file (multi) | — |
| Max 5 images, JPEG/PNG/WEBP, 5MB each | | |

**Confirmation**
- Checkbox (required): *"I confirm this listing information is accurate and I have permission to post it."*
- Honeypot: hidden `<input name="website" />` — silently discarded if filled

### Validation

**Client-side (before API call):**
- Required fields show inline errors
- Price must be positive number
- At least confirmation checkbox must be ticked

**Server-side (`/api/rentals/submit`):**
- Honeypot check — return 200, discard silently
- IP rate limit: max 3 submissions/hour (in-memory, keyed by `x-forwarded-for`) — **temporary; resets on cold start. Move to Redis/KV store post-launch if abuse occurs.**
- Required field validation — return 400 with `{ errors: { field: message } }`
- WhatsApp normalization: strip spaces/dashes/parentheses; Jamaica numbers are `+1-876-XXX-XXXX` in E.164 → stored as `+18761234567`. Accept bare `876XXXXXXX` → prepend `+1`. Accept `+18761234567` as-is. Store as `+[country code][number]` (11 digits for Jamaica).
- Photo validation: max 5 files, max 5MB each, image MIME types only
- Upload photos to `rental-images` Supabase Storage bucket, collect public URLs
- Generate slug: `${type}-${crypto.randomUUID().slice(0,8)}` lowercased/hyphenated — no extra dependency
- Set `distance_sort` from `distance_to_cmu` label
- Insert with `status = 'pending'` only
- Return `{ success: true }` → frontend appends `?success=1` and shows success state

### Success state
Same page, query param `?success=1`. Shows:
> "Your listing has been submitted. We'll review it within 24 hours and contact you on WhatsApp if we need anything."

---

## Filters (`/rent-near-cmu`)

All filters are URL params. Applied in `getServerSideProps`, not client-side.

| Param | UI control | Supabase clause |
|---|---|---|
| `type` | dropdown | `.eq('type', type)` |
| `distance` | dropdown | `.eq('distance_to_cmu', label)` |
| `maxPrice` | number input | `.lte('price', maxPrice)` |
| `furnished` | toggle | `.eq('furnished', true)` |
| `utilities` | toggle | `.eq('utilities_included', true)` |
| `available` | toggle | `.or('available_date.lte.' + today + ',available_date.is.null')` |
| `availableFrom` | date picker | `.lte('available_date', selectedDate)` |

**Filter bar:**
```
[Type ▾]  [Distance ▾]  [Max Price ▾]  [Furnished]  [Utilities]  [Available Now]  [Available From]  [Clear]
```

Active filters shown as count badge: `Filters (3)`

Filter changes update URL via `router.push` without full reload, triggering fresh SSR fetch.

**Sort order (fixed at launch):**
1. `distance_sort ASC`
2. `created_at DESC`

*(Price sort low→high deferred to post-launch)*

**Zero results:**
- With filters active → EmptyState + "Clear Filters" CTA
- With no filters → EmptyState + "Submit a rental" CTA

---

## Admin Flow (`/admin?tab=rentals`)

### Tabs
`Pending` | `Approved` | `Rejected` | `Rented` | `Expired` | `All`

Default tab: **Pending**

### Row display
```
title · type · price/month · location · distance_to_cmu
contact_name · whatsapp (clickable link) · landlord_name (admin-only column)
submitted: created_at · photos: count
```

### Row actions
| Action | API call | Effect |
|---|---|---|
| Approve | `POST /api/admin/rentals/approve` | `status='approved'`, `approved_at=now()`, `expires_at=now()+90 days` |
| Reject | `POST /api/admin/rentals/reject` | `status='rejected'` |
| Preview | Link to `/admin/rentals/[id]/preview` (opens in new tab) | Server-side route using service role — bypasses RLS so pending/rejected listings are visible to admin |
| Renew 90 Days | `POST /api/admin/rentals/renew` | `expires_at=now()+90 days` |
| Mark Rented | `POST /api/admin/rentals/rented` | `status='rented'` |

### Security
- All admin API routes verify session server-side via Supabase `auth.getUser()`
- Service role key used only in server-side API routes — never sent to browser
- `admin_notes` and `landlord_name` returned only when admin session is confirmed
- Public listing queries explicitly name columns — no `SELECT *`

---

## Component Reuse Map

| Component | Used in |
|---|---|
| `card-premium` CSS class | Rental listing card |
| `EmptyState` | No results states |
| `getImageUrl` | Rental photo display |
| `onError` fallback | Rental card + detail page |
| WhatsApp button style | Rental detail page |
| `getServerSideProps` pattern | `/rent-near-cmu`, `/rent-near-cmu/[slug]` |
| `supabase` client | All data fetching |
| Admin approval pattern | Rentals tab in `/admin` |

---

## What Is NOT Built at Launch

- Landlord accounts / login
- Edit/renew own listing
- Saved searches
- Enquiry tracking
- Email notifications
- Price sort (deferred)
- Map view

---

## Future Modules (use this spec as template)

`notices` · `deals` · `safety_reports` — same table pattern, same API route pattern, same admin tab pattern.
