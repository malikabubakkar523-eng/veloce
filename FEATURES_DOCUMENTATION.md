# VELOCE — Luxury & High-Performance Footwear E-Commerce
## Complete Features & System Documentation (Mukammal Feature Directory)

---

### 🌟 1. STOREFRONT & USER EXPERIENCE (Customer Facing)

#### A. Header, Navigation & Theming
- **Sticky Luxury Header**: Dark/Light mode compatible with dynamic glassmorphic blur when scrolling.
- **Top Announcement Ticker**: Real-time promotional announcement bar with promo codes (e.g. `VELOCE20`) and free shipping threshold alerts.
- **Global Theme Switcher**: 1-click Dark Mode / Light Mode toggle with instant theme persistence.
- **Live Search Modal**: Instant popup search with real-time filtering across shoe names, descriptions, categories, and SKUs.
- **Header Notification Center**: Notification dropdown for latest promotional drops and order updates.
- **Mobile Bottom Navigation Bar**: Fixed bottom touch-bar optimized for mobile devices (Home, Shop, Gallery, Wishlist, Orders, Profile) with real-time wishlist badge counter.

#### B. Homepage Highlights & Showcase Sections
1. **Dynamic Hero Banner Slider**:
   - Supports both high-definition video loops and high-res editorial imagery.
   - Admin database-driven: sliders update dynamically without code changes.
   - Mobile touch-swipe gestures, autoplay timer with pause-on-hover, and smooth slide navigation dots.
   - Ambient luxury glow and floating carbon spec chips (Full Carbon Plate, Supercritical Nitrogen Foam).
2. **Shop by Category Rail**:
   - Horizontally scrollable row on mobile with real-time category product counts.
   - Categories include: Sneakers, Running, Lifestyle, Boots, Formal, Sports.
3. **Dedicated Cinematic Video Showcase**:
   - High-motion footwear running video with mute/unmute audio controls and direct CTA links.
4. **AI-Powered Personalization Engine ("Recommended For You")**:
   - Learns customer style preferences (categories, color palettes, technical silhouettes, and price tiers) automatically from favorited/wishlisted shoes.
   - Dynamic real-time recommendation updates when shoes are added/removed from favorites.
   - "New Shoes You Might Like" automated curation for fresh releases matching customer aesthetics.
   - Intelligent Match Percentage badge (e.g. `⚡ 96% Match`) with explainable rationale bullets.
   - Automated alerts for price drops on favorited shoes and new style-matched drops.
5. **The Carbon Propulsion Lab (Editorial Showcase)**:
   - High-tech aerodynamic shoe visual blended seamlessly into background.
   - Technical biomechanics highlights (Sub-2 hour marathon racers, 88.4% energy return).
5. **Tuscan Atelier Heritage Showcase**:
   - Handcrafted Italian leather boot showcase with Goodyear storm-welted soles and French calfskin details.
6. **Dynamic Flash Deals Section**:
   - Real-time live countdown timer (Days, Hours, Minutes, Seconds).
   - Live promotion badge and promotional coupon code.
   - Instant discounted shoes showcase with calculated sale prices.
7. **Featured Shoes & Just Released Drops**:
   - Curated product showcase grids with responsive 2-column mobile layout.
8. **Style & Performance Lookbook Gallery**:
   - **Category-Wise Horizontal Scrolling Rows on Mobile**:
     - 🏃 **Men's Atelier & High-Performance** (Tokyo underground, Berlin marathon, Tuscan leathers)
     - ✨ **Women's Runway & Studio Luxe** (Paris Fashion Week, Milan boulevard, Brooklyn tempo)
     - 👶 **Kids & Youth Athletes** (Junior flex trainers, Neo-bounce speed laces, Mini trail explorers)
   - Interactive high-res zoom lightbox preview.
   - Direct silhouette shoe linking ("Shop Silhouette" button).
   - Instant look "Heart / Like" toggle and "Copy Look Link" social share.
9. **Brand Value Proposition Grid**:
   - 3-pillar guarantees: Carbon Propulsion, Artisanal Tuscan Leathers, and 12-Point Authenticity Verification.
10. **VIP Newsletter Subscription**:
    - Email subscription box for exclusive drops and 20% discount vouchers.

---

### 🛍️ 2. SHOPPING, CATALOG & PRODUCT EXPERIENCE

#### A. Shop Catalog & Filtering (`/shop`)
- **Top Campaign Banner**: Customizable campaign header banner managed from admin.
- **Multi-Faceted Sidebar & Mobile Drawer Filters**:
  - Filter by Categories (Sneakers, Running, Boots, etc.)
  - Filter by Brands
  - Filter by EU Shoe Sizes (36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47)
  - Filter by Custom Price Range (Min & Max inputs)
- **Sorting Options**:
  - Featured & Popular
  - Newest Drops
  - Price: Low to High
  - Price: High to Low
  - Highest Rated
- **Reset Filters**: 1-click filter reset.

#### B. Product Cards & Quick Interactions
- **Card Badges**: Automatic discount percentage badge (`-20%`, `-35%`), `NEW` drop badge, and `SOLD OUT` badge.
- **Image Hover Swap**: Secondary angle showcase on mouse hover.
- **Wishlist Toggle**: Heart button with instant state update in store and toast notification.
- **Quick View Modal**: Instant popup without leaving page showing shoe specifications, sizes, stock, and add-to-bag.
- **Quick Add**: 1-click add to cart for in-stock default size.

#### C. Product Details Page (`/product/[slug]`)
- **High-Resolution Gallery**: Main view with thumbnail switchers.
- **Interactive Size Selector**: Real-time stock status per size (e.g., In Stock vs Out of Stock).
- **Price Calculation**: Strikethrough original price with bold sale price.
- **Product Details & Technical Specs Accordions**: Materials, midsole foam, cushioning tech, and outsole grip.
- **Customer Ratings & Reviews System**: Average star rating calculation, review counts, verified reviews list, and review submission form.
- **Related Footwear Recommendations**: Category-matched carousel of complementary shoes.

---

### 🛒 3. CART, CHECKOUT & WISHLIST

#### A. Cart Drawer & Full Cart Page (`/cart`)
- **Slide-over Cart Drawer**: Accessible from any page without navigation.
- **Free Shipping Progress Meter**: Dynamic bar showing amount left to unlock free shipping (e.g. Free shipping over Rs. 5,000).
- **Cart Item Management**: Increase/decrease quantity, delete item, size inspection.
- **Order Summary**: Subtotal, estimated shipping, tax calculations, and final total.
- **Promo Code Voucher**: Dynamic discount code voucher application with real-time deduction.

#### B. Checkout System (`/checkout`)
- **Multi-Step Seamless Checkout**:
  - Shipping address form (Full name, phone, address, city, postal code).
  - Saved addresses selector for logged-in users.
  - Payment Method Options:
    - 💵 Cash on Delivery (COD)
    - 💳 Credit / Debit Card (Stripe integration ready)
    - 📱 Mobile Wallets (EasyPaisa / JazzCash)
- **Order Review**: Itemized order summary with thumbnail previews.
- **Order Placement**: Generates unique Order Number (e.g. `VEL-928410`), saves order into database, deducts inventory stock, and redirects to Order Success page with confetti animation.

#### C. Wishlist (`/wishlist`)
- Persistent local storage & account-synced wishlist.
- 1-click "Move to Bag" or "Remove from Wishlist".

---

### 👤 4. CUSTOMER ACCOUNT & AUTHENTICATION

#### A. Authentication (`/login`, `/register`)
- **JWT & NextAuth Secure Authentication**: Encrypted bcrypt password hashing.
- **User Roles**: Role-based access separation (`CUSTOMER` vs `ADMIN`).

#### B. Customer Portal (`/account`)
- **Orders History (`/account/orders`)**: Complete archive of past and active orders.
- **Live Order Tracking**: Visual progress pipeline (`PENDING` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`).
- **Profile Settings (`/account/profile`)**: Name, email, phone number, and avatar management.
- **Saved Shipping Addresses**: Manage multiple delivery addresses with default selection.
- **Security & Activity Logs**: Device, browser, and IP tracking for account safety.

---

### 🛡️ 5. ADMIN CONTROL PANEL (`/admin`)

#### A. Executive Dashboard Overview (`/admin`)
- **Real-Time Key Metrics**:
  - Total Gross Revenue
  - Total Orders Count
  - Total Registered Customers
  - Low Stock Warning Counter
- **Recent Orders Table**: Quick order status overview with 1-click status update.
- **Top Selling Footwear**: Best-performing shoes and inventory levels.

#### B. Footwear Catalog Management (`/admin/products`)
- **Product Listing**: Search, filter by category, stock level status indicator (`ACTIVE`, `DRAFT`, `ARCHIVED`).
- **Add / Edit Shoe Modal**:
  - Title, Slug, SKU, Brand, Category, Base Price, Sale Price.
  - Image URLs manager with primary image selection.
  - Multi-Size Stock Matrix (EU 36 through 47 stock quantities).
  - Featured & New Drop toggles.

#### C. Order Processing & Logistics (`/admin/orders`, `/admin/orders/[id]`)
- **Order Management**: Filter by order status (`PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- **Order Detail Page**:
  - Customer contact and full destination shipping address.
  - Itemized shoe pairs, sizes, prices, and totals.
  - **Status & Tracking Updater**: Update order status, payment status, tracking number, and admin logistics notes.
  - Sends automated customer email notification on status change.

#### D. Customer CRM (`/admin/customers`, `/admin/customers/[id]`)
- **Customer Directory**: View all registered users, total orders count, and lifetime financial spend.
- **Customer Profile View**: Individual order history, registered address, login security logs, and email history.
- **Direct Email Dispatch Modal**: Send bespoke marketing or customer support emails directly from admin.

#### E. Content & Marketing CMS Managers
1. **Hero Banner CMS (`/admin/content/hero`)**: Manage video/image hero slides, badges, headlines, and links.
2. **Deals & Countdown CMS (`/admin/content/deals`)**: Schedule flash deals, discounts, and end-dates.
3. **Lookbook Gallery CMS (`/admin/content/gallery`)**: Curate editorial looks, assign shoe models, set categories (Men/Women/Kids/Editorial), and reorder looks.
4. **Shop Campaign Banner CMS (`/admin/content/shop-banner`)**: Update top banner for shop page.

---

### ⚡ 6. DATABASE, PERFORMANCE & TECH STACK

- **Framework**: Next.js 14 (App Router, Server Components, Server Actions).
- **Database**: PostgreSQL (Hosted on Neon Serverless Cloud).
- **ORM**: Prisma Client v5.22 with automated migrations and safety seeds.
- **Styling**: Tailwind CSS + Custom Design System tokens + Framer Motion animations.
- **Live Sync**: Server-Sent Events (SSE) live updates across tabs when admin modifies catalog.
- **Email Dispatch**: Resend API integration with HTML email templates.
- **Icons**: Lucide React Icons.
- **Mobile First**: 100% responsive on all mobile screen sizes (320px to 4K displays).
