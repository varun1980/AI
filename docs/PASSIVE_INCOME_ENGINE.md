# Passive Income Automation Engine

A complete 24/7 revenue automation system built on top of the Sanches Coaching platform. Generates money while you sleep through three proven income streams — all running fully automatically.

## Income Streams

### 1. Digital Products (Fully Automated)
Sell downloadable training resources 24/7 with zero manual work:
- Training plans, video courses, nutrition guides, eBooks, bundles
- Stripe checkout handles all payments automatically
- AWS S3 signed URLs deliver files to buyers instantly after payment
- Email with download link sent automatically
- Revenue tracked in real-time

**Products seeded by default:**
- Complete Youth Football Development Programme — £29.99
- The Football Parent's Handbook — £14.99
- Speed & Agility Masterclass — £39.99
- Football Nutrition Guide & Meal Plans — £19.99
- Academy Tryout Preparation Bundle — £59.99

### 2. Affiliate Marketing (Fully Automated)
Earn commissions from every sale of recommended products:
- Football gear, nutrition, training equipment, online courses
- Click tracking with lead attribution
- Conversion recording and commission calculation
- Transparent disclosure to users

**Affiliate products seeded by default:**
| Product | Commission | Network |
|---------|-----------|---------|
| Nike Training Ball | 4% | Amazon Associates |
| Adidas Copa Boots | 4% | Amazon Associates |
| Resistance Bands Set | 6% | Amazon Associates |
| SoccerMentor Platform | 30% | Direct affiliate |
| Lucozade Sport Bundle | 4% | Amazon Associates |
| Adidas Youth Kit | 4% | Amazon Associates |

### 3. Email Funnel → Coaching Bookings (Fully Automated)
The highest-value stream: convert leads into £60-£200/hour coaching clients:
- Lead capture forms on blog, landing pages, popups
- Lead magnet delivery (free training plan, guide, etc.)
- 7-email automated nurture sequence over 15 days
- Leads scored and qualified automatically
- Converts into 1-on-1 coaching bookings (handled by existing platform)

**The 7-Email Sequence:**
| Day | Email | Goal |
|-----|-------|------|
| 0 | Welcome + Lead Magnet | Deliver value, build trust |
| 2 | #1 Coaching Mistake | Educate, establish authority |
| 4 | Quick Win Drill | Actionable value, soft product mention |
| 6 | Client Story | Social proof, soft booking pitch |
| 9 | Gear Recommendations | Affiliate product promotion |
| 12 | Is Coaching Right For You? | Direct soft sell |
| 15 | Subscriber Discount Offer | 20% off, 48hr urgency |

## Automation Schedule

| Frequency | Task |
|-----------|------|
| Every 30 min | Process due email sequences |
| Daily 2 AM | Score & qualify leads |
| Every Monday 9 AM | Generate new SEO blog post (Claude AI) |
| Every Wednesday 10 AM | Generate social media posts |
| Daily midnight | Expire old download links |
| Daily 11 PM | Record booking revenue snapshot |
| 1st of each month | Re-engage cold leads |

## SEO Content Engine

Each Monday, Claude AI automatically generates a new SEO-optimised blog post targeting high-value football coaching keywords:
- `football drills to do alone`
- `how to get football scouted`
- `pre match meal football`
- `improve first touch football`
- `mental strength football`
- `youth football development`
- `prevent football injuries`

These posts drive free organic traffic 24/7, capturing emails via the signup form and converting them into the funnel.

## Revenue Dashboard

Available at `/passive-income` (admin only):
- Real-time revenue by stream (digital products, affiliates, bookings)
- Lead funnel metrics (new → nurturing → qualified → converted)
- Monthly growth vs. previous month
- Top performing products and affiliate links
- Recent revenue activity feed
- Passive income breakdown with automation status

## Setup Instructions

### 1. Set Environment Variables

Add to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...        # Claude AI for content generation
SITE_URL=https://sanchescoaching.co.uk
```

All other required vars (Stripe, SendGrid, AWS) are already in `.env.example`.

### 2. Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add-passive-income-engine
npx prisma generate
```

### 3. Initialise the System (One-time)

After logging in as admin, call:
```
POST /api/v1/passive-income/admin/setup
```

This seeds:
- 6 affiliate products
- 5 digital products
- 1 welcome email sequence (7 emails)

Or use the "Initialise Passive Income System" button in the admin dashboard at `/passive-income`.

### 4. Upload Digital Product Files

Upload actual PDF/video files to S3 bucket and update each product's `fileUrl` via the admin API.

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/passive-income/leads` | Capture lead (email signup) |
| GET | `/api/v1/passive-income/unsubscribe?email=...` | Unsubscribe |
| GET | `/api/v1/passive-income/blog` | Get published blog posts |
| GET | `/api/v1/passive-income/blog/:slug` | Get single post |
| GET | `/api/v1/passive-income/shop` | Get digital products |
| GET | `/api/v1/passive-income/shop/:slug` | Get single product |
| POST | `/api/v1/passive-income/shop/:id/checkout` | Create Stripe checkout |
| GET | `/api/v1/passive-income/shop/fulfil/:sessionId` | Fulfil after payment |
| GET | `/api/v1/passive-income/go/:trackingCode` | Affiliate click redirect |
| GET | `/api/v1/passive-income/affiliates` | Get affiliate products |

### Admin (JWT + ADMIN role required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/passive-income/admin/dashboard` | Full revenue dashboard |
| GET | `/api/v1/passive-income/admin/revenue-chart?period=month` | Chart data |
| GET | `/api/v1/passive-income/admin/passive-breakdown` | Passive stream breakdown |
| GET | `/api/v1/passive-income/admin/leads` | Lead list |
| GET | `/api/v1/passive-income/admin/lead-stats` | Lead funnel stats |
| GET | `/api/v1/passive-income/admin/email-stats` | Email sequence stats |
| GET | `/api/v1/passive-income/admin/affiliate-stats` | Affiliate performance |
| GET | `/api/v1/passive-income/admin/product-stats` | Digital product stats |
| POST | `/api/v1/passive-income/admin/generate-content` | Generate blog post |
| POST | `/api/v1/passive-income/admin/publish-post/:id` | Publish a post |
| POST | `/api/v1/passive-income/admin/setup` | One-time system init |
| POST | `/api/v1/passive-income/admin/trigger-emails` | Manually process emails |
| POST | `/api/v1/passive-income/admin/bulk-generate-content` | Bulk content generation |

## Pages Added

| Route | Description |
|-------|-------------|
| `/passive-income` | Admin revenue & automation dashboard |
| `/blog` | SEO blog listing page |
| `/blog/[slug]` | Individual blog post |
| `/shop` | Digital products + affiliate gear shop |
| `/shop/[slug]` | Individual product page with Stripe checkout |
| `/unsubscribe` | GDPR-compliant unsubscribe page |

## Revenue Projections

Conservative estimates based on 500 monthly organic visitors:

| Stream | Monthly Estimate |
|--------|-----------------|
| Digital Products (3% conversion × £30 avg) | £450/month |
| Affiliate Commissions (2% CTR × 4% conv × £40 avg) | £160/month |
| Coaching Bookings via email funnel (2 clients/month × £300) | £600/month |
| **Total** | **~£1,200/month** |

As organic traffic grows and email list builds, all three streams scale proportionally — entirely on autopilot.
