# Sanches Coaching Platform - Setup Guide

This guide will walk you through setting up the Sanches Coaching platform from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v15 or higher)
- **Redis** (v7 or higher)
- **Git**
- **Docker** (optional, but recommended)

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd sanches-coaching

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Step 2: Database Setup

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis
```

### Option B: Manual Installation

1. **Install PostgreSQL**:
   - Download from https://www.postgresql.org/download/
   - Create a database: `createdb sanches_coaching`

2. **Install Redis**:
   - Download from https://redis.io/download
   - Start Redis: `redis-server`

## Step 3: Environment Configuration

### Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and configure:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/sanches_coaching?schema=public

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (get from SendGrid Dashboard)
SENDGRID_API_KEY=SG...

# Twilio (get from Twilio Console)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+44...

# AWS S3 (get from AWS Console)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=sanches-coaching

# Google Calendar (Service Account JSON)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_CALENDAR_ID=primary
```

### Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Step 4: Database Migrations

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed initial data
npx prisma db seed
```

## Step 5: Third-Party Service Setup

### Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Create Service Account
   - Download JSON key
5. Share your Google Calendar with the service account email
6. Copy the JSON content to `GOOGLE_SERVICE_ACCOUNT_KEY` in `.env`

### Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers > API keys
3. Set up a webhook endpoint:
   - URL: `https://yourdomain.com/api/v1/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook secret to `.env`

### SendGrid

1. Go to [SendGrid](https://sendgrid.com)
2. Create account and verify sender email
3. Generate API key from Settings > API Keys
4. Add to `.env`

### Twilio

1. Go to [Twilio Console](https://www.twilio.com/console)
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to `.env`

### AWS S3

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Create an S3 bucket
3. Configure CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```
4. Create IAM user with S3 access
5. Add credentials to `.env`

## Step 6: Start Development Servers

```bash
# From root directory
npm run dev

# This will start both backend and frontend
```

Or start individually:

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## Step 7: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/v1
- **Prisma Studio**: `npx prisma studio` (from backend directory)

## Step 8: Create Admin User

Run this in Prisma Studio or via SQL:

```sql
INSERT INTO users (id, email, role, first_name, last_name, is_verified, is_active)
VALUES (
  gen_random_uuid(),
  'gus@sanchescoaching.co.uk',
  'ADMIN',
  'Gus',
  'Sanches',
  true,
  true
);
```

Then set a password by logging in via the frontend.

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # or :4000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep sanches_coaching
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG
```

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

## Next Steps

1. **Configure Session Types**: Add session configurations via Admin Dashboard
2. **Set Working Hours**: Configure availability via Admin Dashboard
3. **Upload Media**: Add training videos and images
4. **Test Booking Flow**: Make a test booking to ensure everything works
5. **Configure Notifications**: Test email and SMS notifications

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Support

If you encounter any issues:
- Check the [Troubleshooting](#troubleshooting) section above
- Review backend logs: `cd backend && npm run dev`
- Check database with Prisma Studio: `npx prisma studio`
- Contact the development team

---

**Ready to coach!** 🚀⚽
