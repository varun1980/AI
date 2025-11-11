# Sanches Coaching Platform

A premium football coaching booking platform built for Gus Sanches, featuring real-time availability, session bookings, payment processing, and comprehensive admin tools.

## 🚀 Features

### Core Functionality
- **Real-time Booking System**: Book sessions with live availability checking via Google Calendar integration
- **Multiple Session Types**: 1-to-1, Small Group, Assessment, and Training Camps
- **Block Booking Packages**: Discounted 6-week and 10-week packages with automatic scheduling
- **Secure Payments**: Stripe integration with Apple Pay and Google Pay support
- **User Dashboard**: View upcoming sessions, payment history, and package balance
- **Admin Dashboard**: Manage bookings, block time, view analytics, and export reports
- **Automated Notifications**: Email and SMS confirmations, reminders, and calendar invites
- **Media Gallery**: Training videos and photo gallery
- **Events Management**: Upcoming camps and workshops with registration

### Technical Highlights
- **Backend**: NestJS with TypeScript, PostgreSQL, Prisma ORM
- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Payments**: Stripe with webhook handling and refund management
- **Calendar**: Google Calendar API with bi-directional sync
- **Storage**: AWS S3 for media files
- **Notifications**: SendGrid (email) + Twilio (SMS)
- **Caching**: Redis for performance optimization
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions with automated testing and deployment

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/sanches-coaching.git
cd sanches-coaching
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Configuration

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
```

### 4. Database Setup

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Development Servers

```bash
# From root directory
npm run dev

# Or individually:
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/v1

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.yml up -d
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Tests
```bash
cd frontend

# Run tests
npm test

# E2E tests with Playwright
npx playwright test
```

## 📊 Database Schema

The platform uses PostgreSQL with the following main entities:

- **Users**: Client accounts with auth and profile data
- **Bookings**: Individual session bookings with status tracking
- **Packages**: Block booking packages (6-week, 10-week)
- **Payments**: Stripe payment records with refund tracking
- **SessionConfig**: Session types with pricing and duration
- **AvailabilityBlock**: Coach availability and blocked times
- **Events**: Training camps and workshops
- **Media**: Image and video gallery
- **Notifications**: Email/SMS notification logs
- **Analytics**: Event tracking and metrics

## 🔐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - Email/password login
- `POST /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/me` - Get current user

### Bookings
- `GET /api/v1/bookings/availability` - Check available slots
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/my-bookings` - User's bookings
- `PATCH /api/v1/bookings/:id/reschedule` - Reschedule booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Payments
- `POST /api/v1/payments/create-intent` - Create payment intent
- `POST /api/v1/payments/webhook` - Stripe webhook
- `GET /api/v1/payments/payment-methods` - Saved payment methods

### Packages
- `POST /api/v1/packages` - Purchase package
- `GET /api/v1/packages/my-packages` - User's packages
- `GET /api/v1/packages/:id/balance` - Package balance

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard stats
- `GET /api/v1/admin/bookings` - All bookings
- `GET /api/v1/admin/users` - All users
- `GET /api/v1/admin/export` - Export data (CSV)

## 🎨 Design System

The platform uses a premium black-gold color scheme:

### Colors
- **Primary Gold**: `#b8832b` - CTAs and highlights
- **Dark Background**: `#0a0a0a` - Main background
- **Dark Cards**: `#1a1a1a` - Card backgrounds
- **Text**: White with gray variations

### Typography
- **Display Font**: Bebas Neue (headlines)
- **Body Font**: Inter (content)

### Components
All UI components follow a consistent design system with:
- Smooth animations and transitions
- Hover effects with gold accents
- Responsive layouts (mobile-first)
- Accessibility compliance (WCAG 2.2 AA)

## 📱 PWA Features

The frontend is PWA-enabled with:
- Offline support
- Install to home screen
- Push notifications (optional)
- Fast loading with service workers

## 🔧 Configuration

### Google Calendar Setup
1. Create Google Cloud Project
2. Enable Calendar API
3. Create Service Account
4. Download credentials JSON
5. Share calendar with service account email
6. Add credentials to `.env`

### Stripe Setup
1. Create Stripe account
2. Get API keys (test & live)
3. Configure webhooks endpoint
4. Add webhook secret to `.env`

### SendGrid Setup
1. Create SendGrid account
2. Verify sender email
3. Generate API key
4. Add to `.env`

### Twilio Setup
1. Create Twilio account
2. Get phone number
3. Get Account SID and Auth Token
4. Add to `.env`

### AWS S3 Setup
1. Create S3 bucket
2. Configure CORS
3. Create IAM user with S3 access
4. Add credentials to `.env`

## 📈 Monitoring & Analytics

### Application Monitoring
- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior and conversion tracking
- **Custom Analytics**: Server-side event tracking

### Performance Targets
- **Page Load**: < 2s (mobile)
- **API Response**: < 300ms (read), < 800ms (write)
- **Uptime**: 99.9%
- **Lighthouse Score**: > 90

## 🚀 Deployment

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway/Render/AWS (Backend)
```bash
# Build
npm run build

# Start
npm run start:prod
```

### Environment Variables
Ensure all production environment variables are set in your deployment platform.

## 📝 License

This project is proprietary and confidential.
© 2024 Sanches Coaching. All rights reserved.

## 👨‍💻 Development Team

Built by your development team for Gus Sanches.

## 📞 Support

For issues or questions:
- Email: support@sanchescoaching.co.uk
- GitHub Issues: [Create an issue](https://github.com/yourusername/sanches-coaching/issues)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core booking system
- ✅ Payment processing
- ✅ Admin dashboard
- ✅ Email/SMS notifications

### Phase 2 (Upcoming)
- ⏳ Waitlist functionality
- ⏳ AI-powered schedule recommendations
- ⏳ WhatsApp integration
- ⏳ Video feedback for premium users
- ⏳ Mobile app (React Native)

### Phase 3 (Future)
- ⏳ Multi-coach support
- ⏳ Affiliate program
- ⏳ Advanced analytics
- ⏳ API for third-party integrations

## 🤝 Contributing

This is a private repository. If you're part of the development team:

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request
5. Wait for code review

---

**Built with ❤️ for premium football coaching**
