# Sanches Coaching API Documentation

Base URL: `http://localhost:4000/api/v1` (development)

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-token>
```

---

## Auth Endpoints

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+447123456789"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CLIENT"
  },
  "accessToken": "jwt-token",
  "tokenType": "Bearer"
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google OAuth
```http
POST /auth/google
```

**Request Body:**
```json
{
  "googleId": "google-user-id",
  "email": "user@gmail.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

---

## Bookings Endpoints

### Get Available Slots
```http
GET /bookings/availability?date=2024-01-15&sessionConfigId=uuid
```

**Response:**
```json
[
  {
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "available": true
  }
]
```

### Create Booking
```http
POST /bookings
```

**Request Body:**
```json
{
  "sessionConfigId": "uuid",
  "startTime": "2024-01-15T10:00:00Z",
  "notes": "Looking to improve passing",
  "packageId": "uuid" // optional
}
```

### Get My Bookings
```http
GET /bookings/my-bookings?type=upcoming
```

**Query Params:**
- `type`: `upcoming` | `past`

### Reschedule Booking
```http
PATCH /bookings/:id/reschedule
```

**Request Body:**
```json
{
  "newStartTime": "2024-01-16T14:00:00Z"
}
```

### Cancel Booking
```http
DELETE /bookings/:id
```

**Request Body:**
```json
{
  "reason": "Schedule conflict"
}
```

---

## Payments Endpoints

### Create Payment Intent
```http
POST /payments/create-intent
```

**Request Body:**
```json
{
  "amount": 50.00,
  "currency": "gbp",
  "bookingId": "uuid",
  "metadata": {}
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Webhook (Stripe)
```http
POST /payments/webhook
```

**Headers:**
```
stripe-signature: <stripe-signature>
```

### Get Payment Methods
```http
GET /payments/payment-methods
```

---

## Packages Endpoints

### Create Package
```http
POST /packages
```

**Request Body:**
```json
{
  "type": "SIX_WEEK",
  "preferredDay": "MONDAY",
  "preferredTime": "18:00"
}
```

### Get My Packages
```http
GET /packages/my-packages
```

### Get Package Balance
```http
GET /packages/:id/balance
```

**Response:**
```json
{
  "total": 6,
  "used": 2,
  "remaining": 4
}
```

---

## Events Endpoints

### Get All Events
```http
GET /events?published=true&upcoming=true
```

### Get Event by ID
```http
GET /events/:id
```

### Create Event (Admin)
```http
POST /events
```

**Request Body:**
```json
{
  "title": "Summer Training Camp",
  "description": "5-day intensive training",
  "startDate": "2024-07-15",
  "endDate": "2024-07-19",
  "location": "City Sports Complex",
  "capacity": 20,
  "price": 350.00,
  "isPublished": true
}
```

---

## Media Endpoints

### Get All Media
```http
GET /media?type=video
```

**Query Params:**
- `type`: `image` | `video`

### Upload Media (Admin)
```http
POST /media/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
```
file: <file>
type: "image" | "video"
```

---

## Admin Endpoints

### Get Dashboard Stats
```http
GET /admin/dashboard
```

**Response:**
```json
{
  "totalUsers": 150,
  "totalBookings": 450,
  "upcomingBookings": 23,
  "activePackages": 35,
  "revenueThisMonth": 2350.00
}
```

### Get All Bookings
```http
GET /admin/bookings?page=1&limit=20
```

### Get All Users
```http
GET /admin/users?page=1&limit=20
```

### Export Data
```http
GET /admin/export?type=bookings
```

**Query Params:**
- `type`: `bookings` | `users` | `payments`

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Booking not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Time slot not available",
  "error": "Conflict"
}
```

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per IP
- **Header**: `X-RateLimit-Remaining`

---

## Webhooks

### Stripe Webhook Events

The following events are handled:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Endpoint:** `POST /payments/webhook`

**Verification:** Stripe signature verification required

---

## Testing

Use the following test credentials:

**Test User:**
```
Email: test@example.com
Password: test123
```

**Test Cards (Stripe):**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

---

**For more details, see the [main documentation](../README.md)**
