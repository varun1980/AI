'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from 'react-query';
import { bookingsApi, packagesApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FiCalendar, FiClock, FiPackage, FiDollarSign, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'packages'>('upcoming');

  // Redirect if not authenticated
  if (typeof window !== 'undefined' && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  const { data: upcomingBookings, isLoading: loadingUpcoming } = useQuery(
    'upcomingBookings',
    () => bookingsApi.getMyBookings('upcoming'),
    { enabled: activeTab === 'upcoming' }
  );

  const { data: pastBookings, isLoading: loadingPast } = useQuery(
    'pastBookings',
    () => bookingsApi.getMyBookings('past'),
    { enabled: activeTab === 'past' }
  );

  const { data: packages, isLoading: loadingPackages } = useQuery(
    'packages',
    () => packagesApi.getMyPackages(),
    { enabled: activeTab === 'packages' }
  );

  const handleCancelBooking = async (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsApi.cancel(id);
        // Refresh bookings
        window.location.reload();
      } catch (error) {
        alert('Failed to cancel booking');
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display uppercase tracking-wider mb-2">
              My Dashboard
            </h1>
            <p className="text-gray-400">
              Welcome back, {user?.firstName}! Manage your bookings and packages.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Upcoming Sessions</p>
                  <p className="text-3xl font-display text-primary-500">
                    {upcomingBookings?.data?.length || 0}
                  </p>
                </div>
                <FiCalendar className="text-4xl text-primary-500/20" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Packages</p>
                  <p className="text-3xl font-display text-primary-500">
                    {packages?.data?.length || 0}
                  </p>
                </div>
                <FiPackage className="text-4xl text-primary-500/20" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Sessions</p>
                  <p className="text-3xl font-display text-primary-500">
                    {(upcomingBookings?.data?.length || 0) + (pastBookings?.data?.length || 0)}
                  </p>
                </div>
                <FiClock className="text-4xl text-primary-500/20" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-dark-800">
            {(['upcoming', 'past', 'packages'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-display uppercase text-sm tracking-wider transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'upcoming' && (
              <>
                {loadingUpcoming ? (
                  <p className="text-gray-400">Loading...</p>
                ) : upcomingBookings?.data?.length === 0 ? (
                  <div className="card text-center py-12">
                    <FiCalendar className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No upcoming bookings</p>
                    <button
                      onClick={() => router.push('/book')}
                      className="btn-primary"
                    >
                      Book a Session
                    </button>
                  </div>
                ) : (
                  upcomingBookings?.data?.map((booking: any) => (
                    <div key={booking.id} className="card">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-display uppercase mb-2">
                            {booking.sessionConfig.name}
                          </h3>
                          <div className="space-y-2 text-gray-400">
                            <div className="flex items-center">
                              <FiCalendar className="mr-2 text-primary-500" />
                              {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="flex items-center">
                              <FiClock className="mr-2 text-primary-500" />
                              {format(new Date(booking.startTime), 'h:mm a')} -{' '}
                              {format(new Date(booking.endTime), 'h:mm a')}
                            </div>
                            <div className="flex items-center">
                              <FiDollarSign className="mr-2 text-primary-500" />
                              £{booking.sessionConfig.price}
                            </div>
                          </div>
                          {booking.notes && (
                            <p className="mt-3 text-sm text-gray-500">
                              Notes: {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/bookings/${booking.id}/reschedule`)}
                            className="btn-outline text-sm"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="btn text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500"
                          >
                            <FiX className="mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'past' && (
              <>
                {loadingPast ? (
                  <p className="text-gray-400">Loading...</p>
                ) : pastBookings?.data?.length === 0 ? (
                  <div className="card text-center py-12">
                    <p className="text-gray-400">No past bookings</p>
                  </div>
                ) : (
                  pastBookings?.data?.map((booking: any) => (
                    <div key={booking.id} className="card opacity-75">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-display uppercase mb-2">
                            {booking.sessionConfig.name}
                          </h3>
                          <div className="space-y-2 text-gray-400 text-sm">
                            <div className="flex items-center">
                              <FiCalendar className="mr-2" />
                              {format(new Date(booking.startTime), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="flex items-center">
                              <FiClock className="mr-2" />
                              {format(new Date(booking.startTime), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs uppercase ${
                            booking.status === 'COMPLETED'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-gray-500/10 text-gray-500'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'packages' && (
              <>
                {loadingPackages ? (
                  <p className="text-gray-400">Loading...</p>
                ) : packages?.data?.length === 0 ? (
                  <div className="card text-center py-12">
                    <FiPackage className="text-6xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No active packages</p>
                    <button
                      onClick={() => router.push('/packages')}
                      className="btn-primary"
                    >
                      Buy a Package
                    </button>
                  </div>
                ) : (
                  packages?.data?.map((pkg: any) => (
                    <div key={pkg.id} className="card">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-display uppercase mb-2">
                            {pkg.type.replace('_', '-')} Package
                          </h3>
                          <div className="space-y-2 text-gray-400">
                            <p>
                              Sessions: {pkg.usedSessions} / {pkg.totalSessions} used
                            </p>
                            <p>Remaining: {pkg.totalSessions - pkg.usedSessions}</p>
                            {pkg.preferredDay && (
                              <p>
                                Preferred: {pkg.preferredDay} at {pkg.preferredTime}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-display text-primary-500">
                            £{pkg.price}
                          </p>
                          <p className="text-sm text-gray-400">
                            Saved £{pkg.discount}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-dark-800 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{
                              width: `${(pkg.usedSessions / pkg.totalSessions) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
