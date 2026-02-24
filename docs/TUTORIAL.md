# Harbour View Directory - User Guide

## Access
- Main site: https://harbourviewdirectory.online
- Events: https://harbourviewdirectory.online/events
- Pricing: https://harbourviewdirectory.online/pricing
- Vendor dashboard: https://harbourviewdirectory.online/dashboard
- Admin events: https://harbourviewdirectory.online/admin/events

## Login / Logout
1. Go to /login and sign in.
2. The navbar shows Logout when you are signed in.
3. Click Logout to end the session.

## Vendor - Manage Listings
1. Go to /dashboard.
2. Click Edit on your listing.
3. Update details and contact info.
4. Upload images (max 5MB each).
5. Click Save Changes.

## Vendor - Upload Images
- Drag and drop images or click to browse.
- Allowed types: PNG, JPG, GIF, WEBP.
- Images appear in your gallery after Save Changes.

## Vendor - Create Events
1. Go to /dashboard/events.
2. Fill out the event form.
3. Choose a paid tier.
4. Submit the event.
5. Approved events appear on /events.

## Admin - Event Approvals
Admins can manage events at /admin/events.
- Approve: sets status to active.
- Reject: sets status to rejected.
- Mark Paid: sets is_paid to true.
- Expire: sets status to expired.
- Edit: open fields and save changes.

## Payments (WhatsApp)
- Payment link: 876-861-7153

## Troubleshooting
- Buttons not responding: log out and back in, then hard refresh.
- Images not showing: confirm each file is under 5MB and re-save.
- Events not visible: confirm status is active and date is in the future.
- Admin not visible: confirm your email is in admin list and re-login.

## Supabase Checklist (Admin Only)
- Storage bucket: vendor-images, public, 5MB limit, image MIME types.
- Tables: vendors, events, reviews.
- RLS: enabled on all tables.
