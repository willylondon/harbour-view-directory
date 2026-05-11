import { getDisplayCategory, normalizeCategoryLabel } from './categoryMap.js';
import { getImageUrl } from './supabase.js';

const BRAND_PLACEHOLDER = {
  src: null,
  alt: 'Harbour View Directory listing placeholder',
  photographer: 'Harbour View Directory',
  unsplashUrl: '',
  attributionText: '',
  category: 'Harbour View Directory',
  fallbackGroup: 'placeholder',
  source: 'placeholder',
  gradient: 'linear-gradient(135deg, #07101d 0%, #0b3a5d 52%, #d97706 100%)',
};

function unsplash(photoId, alt, photographer, unsplashUrl, category) {
  return {
    src: `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=80`,
    alt,
    photographer,
    unsplashUrl,
    attributionText: `Photo by ${photographer} on Unsplash`,
    category,
  };
}

const BARBER_IMAGES = [
  unsplash('photo-1675599193990-33d71150902b', 'Empty barbershop station with a barber chair and mirror', 'Frantisek Canik', 'https://unsplash.com/photos/a-barber-shop-with-a-brick-wall-and-wooden-floors-k6RsU8om2UE', 'Barber'),
  unsplash('photo-1773863683180-f96a39a4804a', 'Two red barber chairs in a classic barbershop interior', 'Ugur Celik', 'https://unsplash.com/photos/two-red-barber-chairs-in-a-wood-paneled-room-w6-t2Ml2lh4', 'Barber'),
  unsplash('photo-1621645582931-d1d3e6564943', 'Black barber chair in a moody barbershop interior', 'Joshua Lawrence', 'https://unsplash.com/photos/black-and-silver-barber-chair-dU6eE_j2My8', 'Barber'),
  unsplash('photo-1571866190038-266801f5b14c', 'Barber combs, brush, clippers, and grooming tools on a station', 'Katey McCarney', 'https://unsplash.com/photos/red-and-grey-hair-clipper-begZjfeVkkw', 'Barber'),
  unsplash('photo-1744095407400-aa337918bbb1', 'Modern barbershop interior with empty barber chairs', 'Gul Fatima', 'https://unsplash.com/photos/a-modern-and-stylish-barbershop-interior-is-featured-wcY-Qdk2qZ0', 'Barber'),
  unsplash('photo-1596362601603-b74f6ef166e4', 'Stainless steel barber scissors and comb on a dark surface', 'Sinval Carvalho', 'https://unsplash.com/photos/stainless-steel-scissors-and-hair-comb-WbEibGKHBMY', 'Barber'),
  unsplash('photo-1599351431613-18ef1fdd27e1', 'Hair scissors, razor, and clippers arranged on a wooden table', 'Agustin Fernandez', 'https://unsplash.com/photos/yellow-and-black-truck-scale-model-Znyjl9pbaUs', 'Barber'),
  unsplash('photo-1678356163587-6bb3afb89679', 'Barber brush, scissors, and grooming tools on a work table', 'Federico Tonini', 'https://unsplash.com/photos/a-close-up-of-a-table-with-a-hair-brush-and-a-pair-of-scissors-5WttPbwX73c', 'Barber'),
  unsplash('photo-1775126250996-91cfa684f1a0', 'Barber hair care products on a dark wooden surface', 'Apothecary 87', 'https://unsplash.com/photos/two-apothecary-products-salt-tonic-spray-and-clay-pomade-fJRRI4dfT2U', 'Barber'),
];

const BEAUTY_IMAGES = [
  unsplash('photo-1556227834-09f1de7a7d14', 'Clean skincare product arranged on a white surface', 'Curology', 'https://unsplash.com/photos/curology-container-wK0h-mlvfuc', 'Beauty & Wellness'),
  unsplash('photo-1522337360788-8b13dee7a37e', 'Salon tools arranged on a styling station', 'Aw Creative', 'https://unsplash.com/photos/gyIl4c4I58g', 'Beauty & Wellness'),
  unsplash('photo-1596462502278-27bfdc403348', 'Makeup brushes and beauty products arranged on a table', 'Element5 Digital', 'https://unsplash.com/s/photos/makeup-brushes', 'Beauty & Wellness'),
  unsplash('photo-1604654894610-df63bc536371', 'Nail polish and manicure tools on a clean surface', 'Element5 Digital', 'https://unsplash.com/s/photos/nail-polish', 'Beauty & Wellness'),
  unsplash('photo-1516975080664-ed2fc6a32937', 'Neutral beauty products and makeup setup', 'Raphael Lovaski', 'https://unsplash.com/s/photos/beauty-products', 'Beauty & Wellness'),
];

const AUTO_IMAGES = [
  unsplash('photo-1487754180451-c456f719a1fc', 'Mechanic tools and vehicle parts in a garage', 'Kenny Eliason', 'https://unsplash.com/photos/60krlMMeWxU', 'Auto & Transport'),
  unsplash('photo-1770656505709-fd97236989b9', 'Screwdriver and mechanic hands working on an engine', 'PB Swiss Tools', 'https://unsplash.com/photos/mechanic-working-on-car-engine-with-tools-I6pqshymjOw', 'Auto & Transport'),
  unsplash('photo-1770656506117-2372e446b6fa', 'Mechanic screwdriver detail on a car engine part', 'PB Swiss Tools', 'https://unsplash.com/photos/mechanic-uses-screwdriver-to-fix-car-engine-part-06UahhdNsdo', 'Auto & Transport'),
  unsplash('photo-1770656505713-b0fd2f5751e6', 'Mechanic tools and engine components in a workshop', 'PB Swiss Tools', 'https://unsplash.com/photos/mechanic-using-screwdriver-on-engine-part-jz8UiJBbH40', 'Auto & Transport'),
  unsplash('photo-1503376780353-7e6692767b70', 'Car detail on an open road at dusk', 'Campbell', 'https://unsplash.com/s/photos/car-detail', 'Auto & Transport'),
];

const FOOD_IMAGES = [
  unsplash('photo-1504674900247-0877df9cc836', 'Prepared food on a restaurant table', 'Dan Gold', 'https://unsplash.com/photos/4_jhDO54BYg', 'Food & Restaurants'),
  unsplash('photo-1540189549336-e6e99c3679fe', 'Fresh plated meal with vegetables and sides', 'Brooke Lark', 'https://unsplash.com/s/photos/plated-food', 'Food & Restaurants'),
  unsplash('photo-1512621776951-a57141f2eefd', 'Colorful food bowl with fresh ingredients', 'Anna Pelzer', 'https://unsplash.com/s/photos/restaurant-food', 'Food & Restaurants'),
  unsplash('photo-1555939594-58d7cb561ad1', 'Grilled food served on a restaurant plate', 'Eiliv Aceron', 'https://unsplash.com/s/photos/grilled-food', 'Food & Restaurants'),
  unsplash('photo-1546069901-ba9599a7e63c', 'Prepared lunch bowl with fresh ingredients', 'Anh Nguyen', 'https://unsplash.com/s/photos/lunch', 'Food & Restaurants'),
];

const BAKERY_IMAGES = [
  unsplash('photo-1578985545062-69928b1d9587', 'Layer cake on a dessert table', 'American Heritage Chocolate', 'https://unsplash.com/s/photos/cake', 'Bakery / Cakes'),
  unsplash('photo-1464305795204-6f5bbfc7fb81', 'Fresh pastries and baked goods on a tray', 'Diliara Garifullina', 'https://unsplash.com/s/photos/pastries', 'Bakery / Cakes'),
  unsplash('photo-1488477181946-6428a0291777', 'Dessert with cream and fruit on a plate', 'Brooke Lark', 'https://unsplash.com/s/photos/dessert', 'Bakery / Cakes'),
  unsplash('photo-1563729784474-d77dbb933a9e', 'Cupcakes with frosting arranged for display', 'Heather Ford', 'https://unsplash.com/s/photos/cupcakes', 'Bakery / Cakes'),
  unsplash('photo-1551024506-0bccd828d307', 'Small dessert pastries with icing', 'Food Photographer Jennifer Pallian', 'https://unsplash.com/s/photos/pastry', 'Bakery / Cakes'),
];

const LAUNDRY_IMAGES = [
  unsplash('photo-1545173168-9f1947eebb7f', 'Folded towels and clean laundry', 'Dan Gold', 'https://unsplash.com/photos/aJN-jjFLyCU', 'Laundry & Cleaning'),
  unsplash('photo-1699797467199-6bdf301649e8', 'Folded sweaters and laundry stacked on a bed', 'Nellie Adamyan', 'https://unsplash.com/photos/a-pile-of-folded-towels-sitting-on-top-of-a-bed-wH_avVRSuJM', 'Laundry & Cleaning'),
  unsplash('photo-1642690743989-9c8ae0adcf93', 'Row of washing machines in a laundromat', 'Jon Tyson', 'https://unsplash.com/photos/a-row-of-washers-sitting-in-a-room-with-a-checkered-floor-1r9Fcz-f-sM', 'Laundry & Cleaning'),
  unsplash('photo-1743428463619-d43f2abb3da8', 'Laundromat interior with rows of washers', 'Shawn Clark', 'https://unsplash.com/photos/a-laundromat-with-rows-of-washing-machines-ua3dLAbAvqU', 'Laundry & Cleaning'),
  unsplash('photo-1517677208171-0bc6725a3e60', 'Clean folded laundry on a soft surface', 'Sarah Brown', 'https://unsplash.com/s/photos/folded-laundry', 'Laundry & Cleaning'),
];

const HEALTH_IMAGES = [
  unsplash('photo-1587854692152-cbe660dbde88', 'Pharmacy shelves with medicine and healthcare products', 'Christina Victoria Craft', 'https://unsplash.com/photos/ZHys6xN7sUE', 'Health & Medical'),
  unsplash('photo-1696861286643-341a8d7a79e9', 'Shelf of medicine bottles in a pharmacy', 'David Trinks', 'https://unsplash.com/photos/a-pharmacy-shelf-filled-with-lots-of-medicine-bottles-mLaIFEtUZFs', 'Health & Medical'),
  unsplash('photo-1696861308115-54a5e5a134b0', 'Medication bottles arranged on pharmacy shelving', 'David Trinks', 'https://unsplash.com/photos/a-shelf-filled-with-lots-of-different-types-of-medicine-FLntgQJNjD0', 'Health & Medical'),
  unsplash('photo-1584308666744-24d5c474f2ae', 'Medicine capsules and healthcare supplies', 'Volodymyr Hryshchenko', 'https://unsplash.com/s/photos/medicine', 'Health & Medical'),
  unsplash('photo-1576091160399-112ba8d25d1d', 'Medical equipment and clean healthcare workspace', 'National Cancer Institute', 'https://unsplash.com/s/photos/medical-equipment', 'Health & Medical'),
];

const FINANCE_IMAGES = [
  unsplash('photo-1554224155-6726b3ff858f', 'Payment card and financial paperwork on a desk', 'Kelly Sikkema', 'https://unsplash.com/photos/3-Tc_5LROrM', 'Finance & Banking'),
  unsplash('photo-1563013544-824ae1b704d3', 'Credit card and payment terminal detail', 'CardMapr.nl', 'https://unsplash.com/s/photos/credit-card', 'Finance & Banking'),
  unsplash('photo-1556742049-0cfed4f6a45d', 'Card payment terminal on a counter', 'Clay Banks', 'https://unsplash.com/s/photos/card-payment', 'Finance & Banking'),
  unsplash('photo-1579621970563-ebec7560ff3e', 'Calculator and financial planning papers', 'Adeolu Eletu', 'https://unsplash.com/s/photos/finance', 'Finance & Banking'),
  unsplash('photo-1526304640581-d334cdbbf45e', 'Cash and payment detail on a desk', 'Sharon McCutcheon', 'https://unsplash.com/s/photos/money', 'Finance & Banking'),
];

const EDUCATION_IMAGES = [
  unsplash('photo-1769794371055-54436b54577e', 'Open book, notebooks, pens, and study materials on a desk', 'Yen Vu', 'https://unsplash.com/photos/desk-with-open-book-laptop-and-study-materials-HNjWq8WPyoY', 'Education'),
  unsplash('photo-1699412767185-67a33d119983', 'Book and folders on an empty classroom desk', 'Andy Luo', 'https://unsplash.com/photos/a-book-is-sitting-on-a-desk-in-a-classroom-IdvNWT26-KE', 'Education'),
  unsplash('photo-1753442360794-92c33c57c412', 'Empty classroom with chalkboard and school supplies', 'Andri Aeschlimann', 'https://unsplash.com/photos/a-classroom-with-supplies-desk-and-a-chalkboard-GdRFpVQqjHA', 'Education'),
  unsplash('photo-1516321318423-f06f85e504b3', 'Books, notebook, and pen on a study desk', 'Glenn Carstens-Peters', 'https://unsplash.com/photos/npxXWgQ33ZQ', 'Education'),
  unsplash('photo-1497633762265-9d179a990aa6', 'Books and school supplies on a desk', 'Kimberly Farmer', 'https://unsplash.com/s/photos/school-supplies', 'Education'),
];

const ROOMS_IMAGES = [
  unsplash('photo-1505693416388-ac5ce068fe85', 'Clean furnished room interior', 'Francesca Tosolini', 'https://unsplash.com/photos/tHkJAMcO3QE', 'Rooms & Rentals'),
  unsplash('photo-1560448204-e02f11c3d0e2', 'Bright bedroom with simple furniture', 'Sidekix Media', 'https://unsplash.com/s/photos/bedroom-interior', 'Rooms & Rentals'),
  unsplash('photo-1522708323590-d24dbb6b0267', 'Small apartment room with bed and desk', 'Francesca Tosolini', 'https://unsplash.com/s/photos/studio-apartment', 'Rooms & Rentals'),
  unsplash('photo-1560448075-bb485b067938', 'Clean studio apartment living space', 'Sidekix Media', 'https://unsplash.com/s/photos/apartment-interior', 'Rooms & Rentals'),
  unsplash('photo-1513694203232-719a280e022f', 'Compact furnished living room interior', 'Patrick Perkins', 'https://unsplash.com/s/photos/rental-room', 'Rooms & Rentals'),
];

const HOME_SERVICE_IMAGES = [
  unsplash('photo-1504148455328-c376907d081c', 'Home repair tools on a work surface', 'Barn Images', 'https://unsplash.com/photos/t5YUoHW6zRo', 'Home Services'),
  unsplash('photo-1581141849291-1125c7b692b5', 'Repair tools arranged on a wooden surface', 'Tekton', 'https://unsplash.com/s/photos/repair-tools', 'Home Services'),
  unsplash('photo-1513467535987-fd81bc7d62f8', 'Hand tools organized for home maintenance', 'Bidvine', 'https://unsplash.com/s/photos/home-repair-tools', 'Home Services'),
  unsplash('photo-1604014237800-1c9102c219da', 'Interior repair and home improvement workspace', 'Roselyn Tirado', 'https://unsplash.com/s/photos/home-maintenance', 'Home Services'),
  unsplash('photo-1581578731548-c64695cc6952', 'Cleaning tools and home service supplies', 'CDC', 'https://unsplash.com/s/photos/cleaning-supplies', 'Home Services'),
];

const RETAIL_IMAGES = [
  unsplash('photo-1441986300917-64674bd600d8', 'Small retail shop shelves with products on display', 'Clark Street Mercantile', 'https://unsplash.com/photos/qnKhZJPKFD8', 'Retail & Shopping'),
  unsplash('photo-1607083206968-13611e3d76db', 'Retail shelves with packaged goods and shopping basket', 'Marques Thomas', 'https://unsplash.com/photos/AoK0Qe46JBg', 'Retail & Shopping'),
  unsplash('photo-1481437156560-3205f6a55735', 'Shop counter with everyday retail goods', 'Mick Haupt', 'https://unsplash.com/s/photos/shop-counter', 'Retail & Shopping'),
  unsplash('photo-1472851294608-062f824d29cc', 'Retail storefront with product shelves and display', 'Mike Petrucci', 'https://unsplash.com/photos/c9FQyqIECds', 'Retail & Shopping'),
  unsplash('photo-1528698827591-e19ccd7bc23d', 'Store shelves with neatly arranged products', 'Artificial Photography', 'https://unsplash.com/s/photos/retail-store', 'Retail & Shopping'),
];

export const CATEGORY_FALLBACK_IMAGES = {
  'Beauty & Wellness': BEAUTY_IMAGES,
  'Auto & Transport': AUTO_IMAGES,
  'Food & Restaurants': FOOD_IMAGES,
  'Laundry & Cleaning': LAUNDRY_IMAGES,
  'Health & Medical': HEALTH_IMAGES,
  'Finance & Banking': FINANCE_IMAGES,
  'Books / Stationery': EDUCATION_IMAGES,
  'Retail & Shopping': RETAIL_IMAGES,
  'Pets / Animals': [
    unsplash('photo-1548767797-d8c844163c4c', 'Pet supplies and animal care items', 'Mikhail Vasilyev', 'https://unsplash.com/photos/NodtnCsLdTE', 'Pets / Animals'),
    unsplash('photo-1601758125946-6ec2ef64daf8', 'Pet accessories arranged indoors', 'Chewy', 'https://unsplash.com/s/photos/pet-supplies', 'Pets / Animals'),
    unsplash('photo-1583337130417-3346a1be7dee', 'Animal care supplies and grooming tools', 'Jamie Street', 'https://unsplash.com/s/photos/pet-grooming', 'Pets / Animals'),
    unsplash('photo-1591946614720-90a587da4a36', 'Pet toys and accessories on a clean surface', 'Ayla Verschueren', 'https://unsplash.com/s/photos/pet-accessories', 'Pets / Animals'),
  ],
  'Marine / Fishing Supplies': [
    unsplash('photo-1517077304055-6e89abbf09b0', 'Fishing gear and rope near the water', 'James Wheeler', 'https://unsplash.com/photos/7N01Hh0An4k', 'Marine / Fishing Supplies'),
    unsplash('photo-1534043464124-3be32fe000c9', 'Fishing rods and gear by the shoreline', 'Clark Young', 'https://unsplash.com/s/photos/fishing-gear', 'Marine / Fishing Supplies'),
    unsplash('photo-1507525428034-b723cf961d3e', 'Coastal water and marine atmosphere', 'Sean Oulashin', 'https://unsplash.com/s/photos/coast', 'Marine / Fishing Supplies'),
  ],
  'Rooms & Rentals': ROOMS_IMAGES,
  'Home Services': HOME_SERVICE_IMAGES,
  'Grocery & Convenience': [
    unsplash('photo-1542838132-92c53300491e', 'Fresh grocery shelves in a local shop', 'nrd', 'https://unsplash.com/photos/D6Tu_L3chLE', 'Grocery & Convenience'),
    unsplash('photo-1578916171728-46686eac8d58', 'Grocery aisle stocked with everyday goods', 'Franki Chamaki', 'https://unsplash.com/s/photos/grocery-store', 'Grocery & Convenience'),
    unsplash('photo-1583258292688-d0213dc5a3a8', 'Convenience store shelves with packaged goods', 'Atoms', 'https://unsplash.com/s/photos/convenience-store', 'Grocery & Convenience'),
    unsplash('photo-1543168256-418811576931', 'Fresh produce arranged for sale', 'Jacopo Maia', 'https://unsplash.com/s/photos/produce-market', 'Grocery & Convenience'),
  ],
  'Tech & Electronics': [
    unsplash('photo-1516321497487-e288fb19713f', 'Laptop, phone, and electronics on a work desk', 'Christin Hume', 'https://unsplash.com/photos/Hcfwew744z4', 'Tech & Electronics'),
    unsplash('photo-1518770660439-4636190af475', 'Circuit board and electronics detail', 'Harrison Broadbent', 'https://unsplash.com/s/photos/electronics-repair', 'Tech & Electronics'),
    unsplash('photo-1519389950473-47ba0277781c', 'Computer hardware and tech workspace', 'Marvin Meyer', 'https://unsplash.com/s/photos/tech-workbench', 'Tech & Electronics'),
    unsplash('photo-1517336714731-489689fd1ca8', 'Laptop and phone on a clean desk', 'Domenico Loia', 'https://unsplash.com/s/photos/laptop-phone', 'Tech & Electronics'),
  ],
  'Community & Church': [
    unsplash('photo-1560698831-07984c110e4d', 'Empty church interior with pews and architectural details', 'Kristy Kravchenko', 'https://unsplash.com/photos/inside-church-view-with-no-people-QaBnHydWIB0', 'Community & Church'),
    unsplash('photo-1560184897-ae75f418493e', 'Empty church pews and aisle', 'Jaeyoung Geoffrey Kang', 'https://unsplash.com/photos/interior-of-empty-church-HVi8hlnYfkw', 'Community & Church'),
    unsplash('photo-1507692049790-de58290a4334', 'Community hall seating and warm interior detail', 'Debby Hudson', 'https://unsplash.com/s/photos/church-interior', 'Community & Church'),
  ],
  Education: EDUCATION_IMAGES,
  'Online Retail': [
    unsplash('photo-1580674285054-bed31e145f59', 'Stacked cardboard packages ready for delivery', 'Claudio Schwarz', 'https://unsplash.com/photos/brown-cardboard-boxes-on-black-plastic-crate-q8kR_ie6WnI', 'Online Retail'),
    unsplash('photo-1607082349566-187342175e2f', 'Parcel boxes prepared for online orders', 'Mediamodifier', 'https://unsplash.com/s/photos/package-box', 'Online Retail'),
    unsplash('photo-1605902711622-cfb43c4437d1', 'E-commerce package and shipping materials', 'Pickawood', 'https://unsplash.com/s/photos/ecommerce-package', 'Online Retail'),
    unsplash('photo-1586880244386-8b3e34c8382c', 'Cardboard boxes and packing supplies', 'Sticker Mule', 'https://unsplash.com/s/photos/shipping-box', 'Online Retail'),
  ],
  'Events / Bookings': [
    unsplash('photo-1558811916-51c8d56d29c6', 'Close-up of a microphone in a dark event setting', 'Marc Schulte', 'https://unsplash.com/photos/a-close-up-of-a-microphone-in-the-dark-XsM-d70RN1A', 'Events / Bookings'),
    unsplash('photo-1708024528965-3c7813cbb777', 'Microphone on a stand in a recording setup', 'Bedirhan Gul', 'https://unsplash.com/photos/a-close-up-of-a-microphone-with-a-black-background-OgrT7FLderI', 'Events / Bookings'),
    unsplash('photo-1516280440614-37939bbacd81', 'Stage lights and event atmosphere', 'Anthony Delanoix', 'https://unsplash.com/s/photos/event-stage', 'Events / Bookings'),
    unsplash('photo-1492684223066-81342ee5ff30', 'Event lights and microphone setup', 'Anthony Delanoix', 'https://unsplash.com/photos/hzgs56Ze49s', 'Events / Bookings'),
  ],
  'General Services': [
    unsplash('photo-1497366754035-f200968a6e72', 'Clean service desk with work tools', 'Crew', 'https://unsplash.com/photos/vbxyFxlgpjM', 'General Services'),
    unsplash('photo-1497366811353-6870744d04b2', 'Neutral office workspace with desks', 'Tim van der Kuip', 'https://unsplash.com/s/photos/service-desk', 'General Services'),
    unsplash('photo-1454165804606-c3d57bc86b40', 'Notebook and business planning workspace', 'Helloquence', 'https://unsplash.com/s/photos/business-service', 'General Services'),
  ],
  'Professional / Legal / JP': [
    unsplash('photo-1450101499163-c8848c66ca85', 'Documents and pen on a professional office desk', 'Scott Graham', 'https://unsplash.com/photos/5fNmWej4tAA', 'Professional / Legal / JP'),
    unsplash('photo-1554224154-26032ffc0d07', 'Business documents and financial papers on a desk', 'Kelly Sikkema', 'https://unsplash.com/s/photos/documents', 'Professional / Legal / JP'),
    unsplash('photo-1589829545856-d10d557cf95f', 'Legal books and office desk detail', 'Tingey Injury Law Firm', 'https://unsplash.com/s/photos/legal-documents', 'Professional / Legal / JP'),
  ],
};

export const SUBCATEGORY_FALLBACK_IMAGES = {
  barber: {
    category: 'Beauty & Wellness',
    allowAnyCategory: true,
    keywords: ['barber', 'barbers', 'barbershop', 'barber shop', 'barbernico', 'fade', 'haircut', 'line up', 'trimming', 'trim', 'cutz', 'cuts', 'grooming salon'],
    pool: BARBER_IMAGES,
  },
  beautySalon: {
    category: 'Beauty & Wellness',
    keywords: ['salon', 'braids', 'lashes', 'lash', 'nails', 'makeup', 'spa', 'massage', 'wax', 'skincare', 'beauty therapist'],
    pool: BEAUTY_IMAGES,
  },
  mechanic: {
    category: 'Auto & Transport',
    allowAnyCategory: true,
    keywords: ['mechanic', 'auto', 'tyre', 'tire', 'battery', 'parts', 'car technician', 'car wash', 'vehicle', 'diagnostics'],
    pool: AUTO_IMAGES,
  },
  bakery: {
    category: 'Food & Restaurants',
    allowAnyCategory: true,
    keywords: ['cake', 'cakes', 'bakery', 'baker', 'pastry', 'pastries', 'dessert', 'cupcake', 'cupcakes'],
    pool: BAKERY_IMAGES,
  },
  laundry: {
    category: 'Laundry & Cleaning',
    keywords: ['laundry', 'laundromat', 'dry cleaner', 'dry cleaning', 'wash and fold', 'ironing', 'pressing'],
    pool: LAUNDRY_IMAGES,
  },
  health: {
    category: 'Health & Medical',
    keywords: ['pharmacy', 'clinic', 'medical', 'health', 'medicine', 'dentist', 'nurse', 'hospital', 'lab'],
    pool: HEALTH_IMAGES,
  },
  finance: {
    category: 'Finance & Banking',
    keywords: ['atm', 'bank', 'moneygram', 'western union', 'bill express', 'credit union', 'cambio', 'payment'],
    pool: FINANCE_IMAGES,
  },
  education: {
    category: 'Education',
    allowAnyCategory: true,
    keywords: ['teacher', 'tutor', 'tutoring', 'school', 'books', 'stationery', 'school supplies', 'lessons', 'education', 'pep', 'csec', 'cape'],
    pool: EDUCATION_IMAGES,
  },
  pets: {
    category: 'Pets / Animals',
    allowAnyCategory: true,
    keywords: ['pet', 'pets', 'exotic pets', 'grooming', 'animal', 'animals', 'veterinary', 'mobile zoo'],
    pool: CATEGORY_FALLBACK_IMAGES['Pets / Animals'],
  },
  rooms: {
    category: 'Rooms & Rentals',
    keywords: ['room', 'rooms', 'rental', 'rentals', 'studio', 'apartment', 'house', 'cmu'],
    pool: ROOMS_IMAGES,
  },
  homeServices: {
    category: 'Home Services',
    allowAnyCategory: true,
    keywords: ['plumber', 'electrician', 'painter', 'gardener', 'locksmith', 'repair', 'upholsterer', 'roofing', 'solar', 'pest control'],
    pool: HOME_SERVICE_IMAGES,
  },
};

export const CATEGORY_IMAGE_QUERY_MAP = {
  barber: 'barber clippers barber chair fade tools barbershop interior',
  beautySalon: 'salon tools nail tools beauty setup no people',
  mechanic: 'mechanic tools engine tire garage parts',
  bakery: 'cakes pastries dessert display bakery',
  laundry: 'washing machines folded laundry laundromat',
  health: 'pharmacy shelves medicine health store',
  finance: 'ATM cash calculator bill payment counter',
  education: 'books pens notebooks school supplies',
  pets: 'pet supplies animal accessories grooming',
  rooms: 'room studio apartment interior',
  homeServices: 'repair tools home maintenance supplies',
  'Marine / Fishing Supplies': 'fishing gear rods marine supplies boats',
  'Food & Restaurants': 'plated food restaurant table local food',
  'Grocery & Convenience': 'grocery shelf convenience store produce',
  'Retail & Shopping': 'retail shelves shop supplies local store counter',
  'Tech & Electronics': 'phone laptop electronics repair tools',
  'Online Retail': 'packaging ecommerce product shelf',
  'Professional / Legal / JP': 'documents pen office desk',
};

function normalizeText(value) {
  return ` ${(value || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function includesKeyword(haystack, keyword) {
  return haystack.includes(normalizeText(keyword));
}

function stableHash(value) {
  const input = (value || 'harbour-view-directory').toString();
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function stableImageKey(vendor = {}) {
  return vendor?.slug || vendor?.id || normalizeText(vendor?.business_name || vendor?.title || '');
}

function saltedImageKey(vendor) {
  const key = stableImageKey(vendor);
  return `${key}:fallback-image`;
}

function getVendorHaystack(vendor = {}, category = '') {
  return normalizeText([
    vendor?.business_name,
    vendor?.title,
    vendor?.description,
    vendor?.category,
    category,
  ].filter(Boolean).join(' '));
}

function getFallbackCategory(vendor = {}, category) {
  const explicitCategory = normalizeCategoryLabel(category);
  if (explicitCategory) return explicitCategory;

  const rawCategory = normalizeCategoryLabel(vendor?.category);
  const inferredCategory = getDisplayCategory(vendor).display;
  if (CATEGORY_FALLBACK_IMAGES[inferredCategory]) return inferredCategory;

  if (rawCategory && !CATEGORY_FALLBACK_IMAGES[rawCategory]) {
    return rawCategory;
  }

  return rawCategory || inferredCategory;
}

export function resolveUploadedImage(vendor) {
  const candidates = [
    vendor?.images?.[0],
    vendor?.image_url,
    vendor?.image,
    vendor?.photo,
    vendor?.photos?.[0],
  ];

  for (const candidate of candidates) {
    const src = getImageUrl(candidate);
    if (src) {
      return {
        src,
        alt: vendor?.business_name || vendor?.title || 'Harbour View business',
        photographer: '',
        unsplashUrl: '',
        attributionText: '',
        category: getDisplayCategory(vendor).display,
        fallbackGroup: 'uploaded',
        source: 'uploaded',
      };
    }
  }

  return null;
}

export function getFallbackPool(vendor = {}, category) {
  const displayCategory = getFallbackCategory(vendor, category);
  const haystack = getVendorHaystack(vendor, displayCategory);

  for (const [group, config] of Object.entries(SUBCATEGORY_FALLBACK_IMAGES)) {
    const categoryMatches = !config.category || config.category === displayCategory || config.allowAnyCategory;
    if (categoryMatches && config.keywords.some((keyword) => includesKeyword(haystack, keyword))) {
      return {
        group,
        category: config.category || displayCategory,
        pool: config.pool,
      };
    }
  }

  return {
    group: displayCategory,
    category: displayCategory,
    pool: CATEGORY_FALLBACK_IMAGES[displayCategory] || [],
  };
}

function pickFromPool(pool, vendor) {
  if (!pool?.length) return null;
  return pool[stableHash(saltedImageKey(vendor)) % pool.length];
}

function pickFromPoolWithRegistry(pool, vendor, usedImages) {
  if (!pool?.length) return null;
  const start = stableHash(saltedImageKey(vendor)) % pool.length;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = pool[(start + offset) % pool.length];
    if (!usedImages?.has(candidate.src)) {
      usedImages?.add(candidate.src);
      return candidate;
    }
  }

  return null;
}

export function getCategoryFallbackImage(category, vendor = {}) {
  const fallbackInfo = getFallbackPool(vendor, category);
  const selected = pickFromPool(fallbackInfo.pool, vendor);

  if (!selected) return BRAND_PLACEHOLDER;

  return {
    ...selected,
    fallbackGroup: fallbackInfo.group,
    source: fallbackInfo.group === fallbackInfo.category ? 'category-fallback' : 'subcategory-fallback',
  };
}

export function getVendorImage(vendor) {
  return resolveUploadedImage(vendor) || getCategoryFallbackImage(undefined, vendor);
}

export function createVendorImageResolver() {
  const usedImages = new Set();

  return function resolveVendorImage(vendor = {}) {
    const uploaded = resolveUploadedImage(vendor);
    if (uploaded) return uploaded;

    const fallbackInfo = getFallbackPool(vendor);
    const selected = pickFromPoolWithRegistry(fallbackInfo.pool, vendor, usedImages);

    if (!selected) return BRAND_PLACEHOLDER;

    return {
      ...selected,
      fallbackGroup: fallbackInfo.group,
      source: fallbackInfo.group === fallbackInfo.category ? 'category-fallback' : 'subcategory-fallback',
    };
  };
}

export function getFallbackAuditInfo(vendor = {}, category) {
  const uploaded = resolveUploadedImage(vendor);
  if (uploaded) {
    return {
      listing: vendor?.business_name || vendor?.title || '',
      category: getDisplayCategory(vendor).display,
      matchedFallbackGroup: 'uploaded',
      selectedFallbackImage: uploaded.src,
      source: uploaded.source,
    };
  }

  const selected = getCategoryFallbackImage(category, vendor);
  return {
    listing: vendor?.business_name || vendor?.title || '',
    category: getFallbackCategory(vendor, category),
    matchedFallbackGroup: selected.fallbackGroup,
    selectedFallbackImage: selected.src,
    source: selected.source,
  };
}

export function auditFallbackSelections(vendors = []) {
  if (process.env.NODE_ENV === 'production') return [];
  return vendors.map((vendor) => getFallbackAuditInfo(vendor));
}

export function getBrandedPlaceholder() {
  return BRAND_PLACEHOLDER;
}
