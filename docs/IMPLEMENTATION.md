# Harbour View Directory Enhancements

## Summary of Changes
- Added vendor image upload flow with signed uploads and gallery preview.
- Added events feature with paid tiers, vendor creation, and admin approvals.
- Added public `/events` page and homepage events preview.
- Added admin tooling for approving, marking paid, and expiring events.

## Supabase Best Practices for Directory Sites

### 1) Database Schema
- Separate core entities and keep relationships explicit:
  - `vendors` (business profiles linked to `auth.users`)
  - `reviews` (linked to `vendors`)
  - `events` (linked to `vendors`)
- Use foreign keys for integrity and cascade deletes for cleanup.
- Use RLS on all tables and write policies to match real ownership rules.
- Keep read paths simple and indexed on filtering columns (example: `event_date`, `status`).
- Store vendor images as an array of URLs on `vendors.images` for simple gallery reads.

### 2) Storage
- Use a dedicated bucket for vendor gallery images: `vendor-images`.
- Make the bucket public for read, but lock upload/update/delete by owner.
- Set file size limits (5MB per image) and allow only image MIME types.
- Keep paths organized (example: `{vendorId}/{timestamp}-{filename}`) for cleanup.

### 3) Authentication
- Use Supabase Auth for login/signup.
- Protect vendor dashboards by checking for a valid session.
- Enforce access in RLS policies, not just in the UI.
- Keep service role usage server-only for admin tasks and signed uploads.

### 4) Real-time
- Use Supabase Realtime to subscribe to `events` or `vendors` updates when you want live lists:
  - Example: subscribe to `events` changes for the `/events` page.
  - Use it sparingly to avoid chatty clients; pagination and batching still matter.

## Events Feature (Paid Advertising)

### Database Table
The `events` table has the requested fields plus a `category` and `expires_at` field for filtering and expiration:
- `id`, `vendor_id`, `title`, `description`, `event_date`, `location`, `image_url`
- `is_paid`, `paid_tier`, `status`, `expires_at`, `created_at`, `category`

### Paid Tiers
- Basic: JMD 2,000 (events listing)
- Premium: JMD 5,000 (events top placement)
- Featured: JMD 10,000 (homepage hero + top placement)

### Admin Controls
Admin controls are available at `/admin/events` and let you:
- Approve / reject events
- Mark payments received
- Expire events

Admins are defined by email in `ADMIN_EMAILS` (server) and `NEXT_PUBLIC_ADMIN_EMAILS` (client).

## Vendor Image Upload Flow
1. Vendor logs in and opens Dashboard.
2. Select a listing to edit.
3. Upload multiple images with preview.
4. Signed uploads are created via `/api/vendor-images/sign`.
5. Uploaded image URLs are saved to `vendors.images`.

Note: Signed uploads require a Supabase JS client that supports `createSignedUploadUrl` (current project dependency is `@supabase/supabase-js` v2.x).

## Environment Variables
Add these to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=admin@example.com,other@example.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,other@example.com
NEXT_PUBLIC_PAYMENTS_WHATSAPP=https://wa.me/18765550100
```

## Database Setup
1. Run the SQL in `schema.sql` in the Supabase SQL Editor.
2. Run the bucket setup script:
```
node setup-bucket.js
```

## Testing Instructions
1. Start the dev server:
```
npm run dev
```
2. Vendor image uploads:
   - Login
   - Go to `/dashboard`
   - Click `Edit` on a listing
   - Upload multiple images (under 5MB each)
   - Save and confirm gallery appears on `/vendor/[id]`
3. Events:
   - Go to `/dashboard/events`
   - Create a new event, pick a tier
   - Verify it appears in admin list (`/admin/events`) after approval
   - Confirm approved events show on `/events` and homepage
4. Admin actions:
   - Mark paid and expire events in `/admin/events`
   - Confirm status updates on `/events`

## Performance and SEO Notes
- Use lazy loading via `next/image` for event and vendor images.
- Keep pagination at 20 listings per page for vendor directory if you grow.
- Add a sitemap and metadata tags for events and vendor pages.
- Enforce rate limiting for uploads at the edge or via API gateway.

## Security and UX Notes
- Validate inputs both client-side and server-side (uploads, events, vendor updates).
- Keep RLS policies authoritative and avoid exposing service role keys.
- Use clear CTAs for paid tiers and show status badges in the dashboard.
- Keep forms mobile-friendly with clear error messaging.

## Monetization Notes
- Keep a public pricing page that explains tiers and placement.
- Allow manual WhatsApp payment now and prepare Stripe as a future option.
- Provide vendors a dashboard view of ad status (pending/approved/expired).
