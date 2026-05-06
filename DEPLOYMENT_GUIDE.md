# Harbour View Directory - Deployment Guide

## ✅ Code Successfully Deployed to GitHub

The code has been successfully pushed to: **https://github.com/willylondon/harbour-view-directory**

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Select the `harbour-view-directory` repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
6. Click "Deploy"

### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select the repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables (same as above)
7. Click "Deploy site"

### Option 3: Self-Hosted
1. Clone the repository:
   ```bash
   git clone https://github.com/willylondon/harbour-view-directory.git
   cd harbour-view-directory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Build and run:
   ```bash
   npm run build
   npm start
   ```

## 📋 Pre-Deployment Checklist

### 1. Database Setup
- Run the SQL in `schema.sql` in your Supabase SQL editor
- Run the migration script: `node migrate-slugs.js`

### 2. Environment Variables
Required variables (add to your hosting platform):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. SEO Configuration
- Update `SITE_URL` in `pages/api/sitemap.xml.js` (line 6)
- Submit sitemap to Google Search Console: `https://yourdomain.com/api/sitemap.xml`

## 🔧 Post-Deployment Tasks

### 1. Verify Site Functionality
- [ ] Homepage loads without "0 results"
- [ ] Vendor pages accessible via `/vendor/business-name`
- [ ] Events page shows proper empty state
- [ ] Search functionality works
- [ ] Contact form submits correctly

### 2. SEO Verification
- [ ] Sitemap accessible at `/api/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Meta tags present on all pages
- [ ] JSON-LD structured data present on vendor pages

### 3. Business Setup
- [ ] Update contact information in `pages/contact.js`
- [ ] Update WhatsApp number in `pages/pricing.js`
- [ ] Add real business listings to database
- [ ] Set up payment collection workflow

## 🐛 Troubleshooting

### Build Issues
If you encounter build issues:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for syntax errors:**
   ```bash
   npx next lint
   ```

### Database Issues
1. **Slug migration not working:**
   - Ensure Supabase connection is configured
   - Check that vendors table has `slug` column
   - Run `node migrate-slugs.js` with proper environment variables

2. **Vendor pages not loading:**
   - Verify Supabase RLS policies allow public read access
   - Check that `is_approved` column exists and is set to true for approved vendors

## 📞 Support

For deployment assistance:
- Check the `AUDIT_SUMMARY.md` for detailed implementation notes
- Review the `README.md` for project structure
- Contact: willylondon@github.com

## 🎯 Next Steps After Deployment

1. **Content Population:**
   - Add 10-20 real business listings
   - Create community events
   - Add testimonials/reviews

2. **Marketing:**
   - Submit to local business directories
   - Share on social media
   - Email local businesses about free listings

3. **Monitoring:**
   - Set up Google Analytics
   - Monitor search console for indexing
   - Track user engagement metrics

---

**Deployment Status:** ✅ Code deployed to GitHub, ready for hosting platform deployment

**Last Updated:** May 5, 2026