# Sanches Coaching Platform - Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Third-Party Services Setup

#### Google Calendar API
- [ ] Create Google Cloud Project
- [ ] Enable Google Calendar API
- [ ] Create Service Account
- [ ] Download service account JSON key
- [ ] Share your calendar with service account email
- [ ] Add JSON to `GOOGLE_SERVICE_ACCOUNT_KEY` in `.env`

#### Stripe
- [ ] Create Stripe account
- [ ] Get test API keys from dashboard
- [ ] Create webhook endpoint for production URL
- [ ] Configure webhook events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
- [ ] Get webhook secret
- [ ] Add all keys to `.env`
- [ ] Test with test cards

#### SendGrid
- [ ] Create SendGrid account
- [ ] Verify sender email address
- [ ] Create API key with Mail Send permissions
- [ ] Add to `.env`
- [ ] Test email sending

#### Twilio
- [ ] Create Twilio account
- [ ] Get Account SID and Auth Token
- [ ] Purchase a phone number
- [ ] Verify test phone numbers
- [ ] Add credentials to `.env`
- [ ] Test SMS sending

#### AWS S3
- [ ] Create AWS account
- [ ] Create S3 bucket (e.g., `sanches-coaching`)
- [ ] Configure bucket CORS policy
- [ ] Create IAM user with S3 permissions
- [ ] Generate access keys
- [ ] Add credentials to `.env`
- [ ] Test file upload

---

## ✅ 2. Database Setup

### Local Development
```bash
# Install PostgreSQL 15+
# Create database
createdb sanches_coaching

# Run migrations
cd backend
npx prisma generate
npx prisma migrate dev

# Seed initial data
npm run prisma:seed
```

### Production Database
- [ ] Set up PostgreSQL database (Heroku, Railway, AWS RDS, etc.)
- [ ] Copy production DATABASE_URL
- [ ] Run migrations in production:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Run seed script for initial data

---

## ✅ 3. Backend Deployment

### Option A: Railway / Render
```bash
# Connect repository
# Set environment variables
# Deploy automatically from git push
```

### Option B: AWS / GCP
```bash
# Build Docker image
docker build -t sanches-backend ./backend

# Push to registry
docker push your-registry/sanches-backend

# Deploy to container service
```

### Environment Variables (Production)
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-secret>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_SERVICE_ACCOUNT_KEY=...
GOOGLE_CALENDAR_ID=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@sanchescoaching.co.uk
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+44...
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-2
AWS_S3_BUCKET=sanches-coaching
SENTRY_DSN=https://...
FRONTEND_URL=https://sanchescoaching.co.uk
```

---

## ✅ 4. Frontend Deployment

### Vercel (Recommended)
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.sanchescoaching.co.uk/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-...
```

---

## ✅ 5. Domain Configuration

### DNS Settings
```
A Record: @ -> <your-server-ip>
CNAME: www -> sanchescoaching.co.uk
CNAME: api -> <backend-url>
```

### SSL Certificate
- [ ] Configure SSL/TLS (Let's Encrypt or Cloudflare)
- [ ] Force HTTPS redirect
- [ ] Update CORS origins in backend

---

## ✅ 6. Post-Deployment Testing

### Critical User Flows
- [ ] User registration
- [ ] User login (email + Google OAuth)
- [ ] View available session types
- [ ] Check calendar availability
- [ ] Book a session
- [ ] Process payment (test card: 4242 4242 4242 4242)
- [ ] Receive confirmation email
- [ ] Receive calendar invite
- [ ] View booking in dashboard
- [ ] Reschedule booking
- [ ] Cancel booking
- [ ] Purchase package
- [ ] View package balance

### Admin Flows
- [ ] Login as admin
- [ ] Access admin dashboard
- [ ] View all bookings
- [ ] View all users
- [ ] Block calendar time
- [ ] Create event/camp
- [ ] Upload media
- [ ] Export data
- [ ] Issue refund

### Integration Tests
- [ ] Stripe webhook processing
- [ ] Google Calendar sync (both ways)
- [ ] Email notifications sent
- [ ] SMS notifications sent
- [ ] Calendar invites attached
- [ ] Reminder notifications (24h, 1h)

---

## ✅ 7. Monitoring & Analytics

### Setup Monitoring
- [ ] Configure Sentry error tracking
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Configure Google Analytics
- [ ] Set up server-side analytics
- [ ] Create dashboard for key metrics

### Key Metrics to Monitor
- [ ] API response times
- [ ] Error rates
- [ ] Payment success rates
- [ ] Booking conversion rate
- [ ] Email delivery rates
- [ ] SMS delivery rates
- [ ] Calendar sync success
- [ ] User registration rate

---

## ✅ 8. Security Checklist

- [ ] All API keys stored in environment variables
- [ ] Database connection uses SSL
- [ ] JWT tokens have reasonable expiration
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Helmet.js configured
- [ ] HTTPS enforced
- [ ] Stripe webhooks verified with signature
- [ ] User passwords hashed with bcrypt

---

## ✅ 9. Performance Optimization

- [ ] Database indexes on frequently queried fields
- [ ] Redis caching configured
- [ ] CDN configured for static assets
- [ ] Image optimization
- [ ] Frontend code splitting
- [ ] Lazy loading components
- [ ] Database connection pooling
- [ ] API response compression

---

## ✅ 10. Launch Preparation

### Content
- [ ] Upload coach photos
- [ ] Upload training videos
- [ ] Add testimonials
- [ ] Create first event/camp
- [ ] Configure session types and pricing
- [ ] Set working hours
- [ ] Create discount codes

### Marketing
- [ ] Social media accounts ready
- [ ] Instagram feed integrated
- [ ] Email templates customized
- [ ] SMS templates finalized
- [ ] Launch announcement prepared

### Support
- [ ] Support email configured
- [ ] FAQ page created
- [ ] Terms of service published
- [ ] Privacy policy published
- [ ] Refund policy documented

---

## ✅ 11. Launch Day

- [ ] Final backup of database
- [ ] All environment variables verified
- [ ] Payment processing tested
- [ ] Notification system tested
- [ ] Create first admin user in production
- [ ] Test complete booking flow
- [ ] Monitor error logs
- [ ] Monitor server performance
- [ ] Monitor payment processing
- [ ] Be ready for support requests

---

## ✅ 12. Post-Launch (Week 1)

- [ ] Daily monitoring of error logs
- [ ] Daily check of payment reconciliation
- [ ] Monitor user feedback
- [ ] Fix any reported issues
- [ ] Optimize based on performance data
- [ ] Gather user testimonials
- [ ] Collect analytics data

---

## Quick Start Commands

### Development
```bash
# Start all services
docker-compose up -d

# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Production
```bash
# Build
npm run build

# Start
npm run start:prod
```

### Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed data
npm run prisma:seed

# Open Prisma Studio
npx prisma studio
```

---

## Support Contacts

**Technical Issues:**
- Backend logs: Check Sentry dashboard
- Database: Check hosting provider logs
- Email: Check SendGrid dashboard
- SMS: Check Twilio console
- Payments: Check Stripe dashboard

**Emergency Contacts:**
- Database provider support
- Hosting provider support
- Stripe support
- SendGrid support
- Twilio support

---

## Success Metrics

**Week 1:**
- [ ] 20+ users registered
- [ ] 10+ bookings completed
- [ ] 99%+ uptime
- [ ] 0 critical errors

**Month 1:**
- [ ] 100+ users registered
- [ ] 50+ bookings completed
- [ ] 5+ package purchases
- [ ] 95%+ customer satisfaction

**Month 3:**
- [ ] 500+ users registered
- [ ] 200+ bookings completed
- [ ] 20+ package purchases
- [ ] Revenue target met

---

**🚀 Ready to Launch! Good luck with Sanches Coaching!**
