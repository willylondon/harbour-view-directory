# Harbour View Directory — Project State

**Last updated:** May 5, 2026  
**Live URL:** https://harbourviewdirectory.online  
**GitHub:** https://github.com/willylondon/harbour-view-directory  
**Vercel:** https://vercel.com/willardwells-7888s-projects/harbour-view-directory  
**Supabase:** Connected (URL + anon key in Vercel env vars)

---

## Architecture

- **Framework:** Next.js 16.1.6 (Pages Router), React 19.2.3
- **Styling:** Tailwind CSS v4 with custom `@theme` tokens in `styles/globals.css`
- **Backend:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel (auto-deploys on push to `main` branch)
- **Payments:** WhatsApp-based workflow (no Stripe/PayPal)

### Design System (`styles/globals.css`)

| Token | Value |
|---|---|
| `--color-brand` | `#0EA5E9` (sky blue) |
| `--color-brand-deep` | `#0369A1` |
| `--color-brand-warm` | `#F59E0B` (amber/gold) |
| `--color-brand-soft` | `#E0F2FE` |
| `--color-surface` | `#FFFFFF` |
| `--color-bg` | `#F8FAFC` (off-white) |
| `--color-bg-alt` | `#F1F5F9` |
| `--color-text` | `#0F172A` (near-black) |
| `--color-text-soft` | `#475569` |
| `--color-text-muted` | `#94A3B8` |
| `--radius-card` | `1.25rem` (20px) |
| `--radius-btn` | `0.75rem` (12px) |

Key utility classes: `card-premium`, `card-premium-static`, `container-premium`, `section-spacing`, `shadow-elevated`

---

## Database Schema (Supabase)

### Tables
- **`public.vendors`** — business listings (id, user_id, business_name, category, description, phone, whatsapp, address, images[], is_featured, is_top_ad, tier, rating, reviewCount, is_approved, slug, meta_title, meta_description, created_at)
- **`public.reviews`** — user reviews (id, vendor_id, user_name, rating, comment, created_at)
- **`public.events`** — community events (id, title, description, location, start_date, end_date, category, organizer, contact_info, images[], is_featured, is_approved, created_at)
- **`public.profiles`** — user roles (id REFERENCES auth.users, email, role, is_admin, created_at, updated_at)

### RLS Policies
- Vendors: anyone can read approved, authenticated users CRUD their own
- Reviews: anyone can read, anyone can insert
- Profiles: users read own, admins read all

### Admin User
- **willardwells@gmail.com** is admin (via `public.profiles` role='admin' + `auth.users` app_metadata)

---

## File Map — What Each File Does

### Core
- `lib/supabase.js` — Supabase client (reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from env)
- `lib/admin.js` — `requireAdmin()` helper for SSR (⚠️ may need cookie-based Supabase client for server-side)
- `styles/globals.css` — Tailwind config + design tokens + utility classes
- `schema.sql` — Full database DDL (run in Supabase SQL Editor)

### Components
- `components/Navbar.js` — Sticky nav with Supabase auth state. Shows Login/Dashboard/Admin/Logout based on session + `app_metadata`. Has mobile hamburger.
- `components/Footer.js` — 4-column footer (Explore, Support, Legal, About)
- `components/VendorCard.js` — Reusable `ListingCard` with category emoji placeholders, badges, WhatsApp CTA, hover lift
- `components/PasswordInput.js` — Eye-icon toggle password field
- `components/SearchBar.js` — Controlled search input with clear button
- `components/EmptyState.js` — Reusable empty state (icon, title, description, primary/secondary CTA)
- `components/ErrorBoundary.js` — React error boundary wrapper
- `components/LoadingSkeleton.js` — Loading skeleton for vendor/event cards
- `components/Hero.js`, `components/CategoryFilter.js`, `components/VendorGrid.js` — May be unused after redesign

### Pages
- `pages/index.js` — **Homepage.** SSR via `getServerSideProps`. Gradient hero, floating search with category chips, vendor grid, featured section, community CTA.
- `pages/events.js` — **Events.** SSR via `getServerSideProps`. Hero, filter chips, featured event card, event grid, empty state.
- `pages/pricing.js` — **Pricing.** Static. 3 cards (Free/Featured/Premium), WhatsApp workflow steps, FAQ accordion.
- `pages/post-ad.js` — **List Business.** Static. Tabbed: List Business / Promote Event / Go Premium. Each tab has CTA buttons (Register, Login, WhatsApp).
- `pages/login.js` — **Login.** Static + client auth. Branded split layout (gradient left, form right). Uses PasswordInput. Redirects to /dashboard.
- `pages/register.js` — **Register.** Static + client auth. Same split layout. Uses PasswordInput. Shows success message on signup.
- `pages/dashboard.js` — **Dashboard.** Client auth. Shows user's vendor listings. Admin badge + Admin Panel link for admin users. Uses Footer.
- `pages/admin.js` — **Admin Panel.** Client auth guard. Checks `app_metadata` then `profiles` table. Redirects non-admin to /dashboard.
- `pages/vendor/[slug].js` — **Vendor detail.** SSR. JSON-LD LocalBusiness, reviews form, category emoji placeholder, Footer component.
- `pages/contact.js` — Contact page
- `pages/terms.js` — Terms of Service
- `pages/privacy.js` — Privacy Policy
- `pages/api/sitemap.xml.js` — Dynamic sitemap generator

### Config
- `vercel.json` — Framework: nextjs, region: iad1, function duration for sitemap
- `package.json` — Next.js 16.1.6, React 19.2.3, Supabase JS v2, Tailwind v4
- `.env.example` — Template for env vars
- `public/robots.txt` — Allows all, points to sitemap

---

## What Works

- ✅ Homepage shows real vendors via SSR (no more "0 results")
- ✅ Vendor pages with slug URLs (`/vendor/business-name`)
- ✅ JSON-LD structured data on vendor pages
- ✅ Sitemap at `/api/sitemap.xml`
- ✅ Robots.txt at `/robots.txt`
- ✅ Password show/hide toggle on login/register
- ✅ Navbar shows Dashboard/Admin/Logout based on auth state
- ✅ Admin badge + Admin Panel visible for willardwells@gmail.com
- ✅ /admin page protected (non-admins redirected)
- ✅ Pricing page with WhatsApp workflow
- ✅ Premium visual design system
- ✅ Mobile-responsive with hamburger nav
- ✅ Empty states instead of raw "0 results"
- ✅ Category emoji placeholders instead of "No Image Available"
- ✅ Events page with SSR

---

## Known Issues / Watch Out For

1. **`lib/admin.js` SSR helper (`requireAdmin`)** — Uses client-side Supabase client which can't read cookies server-side. The `pages/admin.js` page now uses client-side auth instead. If you need SSR admin protection elsewhere, create a server-side Supabase client with cookie parsing.
2. **npm cache issues on Windows** — `npx` sometimes fails with EPERM on cache cleanup. Use `cmd /c "npm run build"` instead of PowerShell.
3. **PowerShell bracket escaping** — `[id].js` filenames break `Remove-Item`. Use `cmd /c "del ..."` instead.
4. **Two lockfiles** — There's a `package-lock.json` in the user's home directory that Next.js detects. Ignore the warning.
5. **Branch strategy** — Work is on `master`, deployed to `main` via `git push origin master:main`.

---

## Next Steps / Remaining Work

### High Priority
1. **Add real vendor images** — Vendors currently show category emoji placeholders. Upload images to Supabase Storage and store URLs in `vendors.images[]`.
2. **Add real events** — Events table is empty. Add community events to make the Events page feel alive.
3. **Add real reviews** — Review counts are 0. Seed some reviews or encourage real ones.
4. **Build `/admin` functionality** — Currently a placeholder with 4 empty cards. Needs:
   - Pending approvals list (query `vendors` where `is_approved = false`)
   - Approve/reject buttons
   - Vendor management table
   - Event management table
5. **Fix "View Details →" in ListingCard** — The redirect arrow shows as text, not a clickable element. It works because the whole card is a Link, but could be improved.
6. **Add forgot password flow** — Login page has no "Forgot password?" link.

### Medium Priority
7. **Category landing pages** — Pages like `/category/food-dining` for SEO
8. **Vendor dashboard functionality** — "New Listing" and "Edit" buttons are placeholders
9. **Google Analytics** — Add GA4 tracking
10. **Google Search Console** — Submit sitemap
11. **Image optimization** — Use `next/image` with proper sizing instead of raw `<img>` tags

### Low Priority
12. **Confirm password field on register**
13. **Password reset page**
14. **Email verification flow polish**
15. **Performance optimization** — Lazy load below-fold content

---

## Deployment Commands

```bash
# Build
npm run build

# Deploy
npx vercel deploy --prod --yes

# Or via git push (Vercel auto-deploys main branch)
git add -A
git commit -m "your message"
git push origin master:main
```

---

## Useful Supabase SQL Queries

```sql
-- Check vendors
SELECT id, business_name, category, slug, is_approved FROM public.vendors;

-- Check admin user
SELECT * FROM public.profiles WHERE role = 'admin' OR is_admin = true;

-- Check events
SELECT * FROM public.events WHERE is_approved = true;
```

---

## Conversation History Summary

The user wanted a premium redesign of harbourviewdirectory.online. Over multiple sessions:

1. **Initial audit** — Fixed 10 critical issues (homepage 0 results, events, vendor SSR, slug URLs, metadata, JSON-LD, sitemap, post-ad, legal pages, pricing)
2. **Database migration** — Added `is_approved`, `slug`, `meta_title`, `meta_description` columns via ALTER TABLE. Generated slugs with duplicate handling.
3. **Vercel deployment** — Fixed vercel.json conflict (builds + functions), pushed master→main, resolved branch mismatch
4. **Premium redesign** — New visual system (sky blue + amber, off-white bg, 20px radius cards), hero sections, ListingCard component, tabbed post-ad page, split-layout auth pages
5. **"0 results" fix** — Converted homepage and events from client-side useEffect to getServerSideProps SSR
6. **Auth/admin system** — PasswordInput component, auth-aware Navbar, profiles table, admin detection via app_metadata + profiles table, protected /admin page
