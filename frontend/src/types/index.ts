export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'ADMIN' | 'CLIENT';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionConfig {
  id: string;
  type: SessionType;
  name: string;
  description?: string;
  duration: number;
  price: number;
  maxParticipants: number;
  isActive: boolean;
}

export type SessionType = 'ONE_TO_ONE' | 'SMALL_GROUP' | 'ASSESSMENT' | 'CAMP';

export interface Booking {
  id: string;
  userId: string;
  sessionConfigId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  sessionConfig: SessionConfig;
  user: User;
  payment?: Payment;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Payment {
  id: string;
  userId: string;
  bookingId?: string;
  packageId?: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface Package {
  id: string;
  userId: string;
  type: PackageType;
  totalSessions: number;
  usedSessions: number;
  price: number;
  discount: number;
  preferredDay?: string;
  preferredTime?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type PackageType = 'SIX_WEEK' | 'TEN_WEEK';

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  capacity: number;
  currentBookings: number;
  price: number;
  imageUrl?: string;
  videoUrl?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  upcomingBookings: number;
  activePackages: number;
  revenueThisMonth: number;
}
