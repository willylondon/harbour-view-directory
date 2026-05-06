# Harbour View Directory

A community business directory for Harbour View, Kingston Jamaica. Connect local businesses with residents through listings, reviews, and events.

## 🚀 Features

- **Business Listings** - Free, Featured, and Premium listing options
- **SEO Optimized** - Server-side rendering, sitemap, robots.txt, JSON-LD
- **Slug-based URLs** - SEO-friendly URLs like `/vendor/business-name`
- **Events Directory** - Local community events and activities
- **Review System** - Community reviews and ratings
- **WhatsApp Payments** - Easy payment workflow for premium listings
- **Responsive Design** - Mobile-first, accessible design
- **Legal Pages** - Terms, Privacy, Contact pages

## 📁 Project Structure

```
├── pages/
│   ├── index.js              # Homepage with vendor directory
│   ├── events.js             # Community events page
│   ├── vendor/[slug].js      # Slug-based vendor pages
│   ├── post-ad.js            # Business listing landing page
│   ├── pricing.js            # Pricing plans & WhatsApp workflow
│   ├── terms.js              # Terms of Service
│   ├── privacy.js            # Privacy Policy
│   ├── contact.js            # Contact page with form
│   └── api/sitemap.xml.js    # Dynamic sitemap generator
├── components/
│   ├── Navbar.js             # Navigation header
│   ├── VendorCard.js         # Vendor listing card
│   ├── SearchBar.js          # Enhanced search with debouncing
│   ├── LoadingSkeleton.js    # Loading state skeletons
│   └── ErrorBoundary.js      # Error handling wrapper
├── public/
│   └── robots.txt            # Robots.txt configuration
└── lib/
    └── supabase.js           # Supabase client configuration
```

## 🛠️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd harbour-view-directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database setup**
   Run the SQL in `schema.sql` in your Supabase SQL editor

5. **Run migration** (optional)
   ```bash
   node migrate-slugs.js
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 📊 SEO Features

- **Server-side rendering** for vendor pages
- **Dynamic sitemap** at `/api/sitemap.xml`
- **JSON-LD structured data** for LocalBusiness schema
- **Meta tags** for Open Graph and Twitter cards
- **Canonical URLs** on all pages
- **Robots.txt** with proper directives

## 💰 Pricing Plans

### Free Listing
- Basic business listing
- Contact information
- Community reviews
- 48-hour approval

### Featured (JMD $2,500/month)
- Featured badge
- Top of category listings
- Priority approval
- WhatsApp contact button

### Premium (JMD $5,000/month)
- Top Ad placement
- Homepage visibility
- Unlimited images
- Advanced analytics
- Priority support

## 🔧 Technical Details

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Deployment**: Vercel recommended
- **Payments**: WhatsApp payment workflow

## 📈 SEO Targets

### Homepage
- "Harbour View directory"
- "Harbour View businesses"
- "Harbour View services"
- "Kingston Jamaica local directory"

### Category Pages
- "[category] in Harbour View Kingston Jamaica"

### Vendor Pages
- "[vendor name] + [service] + Harbour View"

## 🚀 Deployment

1. **Vercel** (Recommended)
   ```bash
   vercel
   ```

2. **Set environment variables** in deployment platform

3. **Submit sitemap** to Google Search Console
   ```
   https://yourdomain.com/api/sitemap.xml
   ```

## 📝 License

Proprietary - All rights reserved.

## 📞 Support

For support, contact:
- Email: support@harbourviewdirectory.online
- WhatsApp: +1 (876) 555-1234
- Address: Harbour View Community Centre, Kingston, Jamaica

---

*Built for the Harbour View community*
