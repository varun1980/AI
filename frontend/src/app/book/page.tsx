'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'react-query';
import { bookingsApi, paymentsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiCalendar, FiClock, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { format, addDays } from 'date-fns';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const sessionTypes = [
  { id: '1', name: '1-to-1 Session', duration: 60, price: 50 },
  { id: '2', name: 'Small Group', duration: 90, price: 30 },
  { id: '3', name: 'Assessment', duration: 45, price: 40 },
];

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: availability } = useQuery(
    ['availability', selectedDate, selectedType],
    () => bookingsApi.getAvailability(selectedDate, selectedType),
    { enabled: !!selectedDate && !!selectedType }
  );

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Create booking
      const bookingResponse = await bookingsApi.create({
        sessionConfigId: selectedType,
        startTime: `${selectedDate}T${selectedTime}`,
        notes,
      });

      // Create payment intent
      const session = sessionTypes.find((s) => s.id === selectedType);
      const paymentResponse = await paymentsApi.createIntent({
        amount: session?.price || 0,
        bookingId: bookingResponse.data.id,
      });

      // Confirm payment
      const result = await stripe.confirmCardPayment(paymentResponse.data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else {
        setStep(4);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedSession = sessionTypes.find((s) => s.id === selectedType);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= s
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-gray-400'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`w-20 h-1 ${
                  step > s ? 'bg-primary-500' : 'bg-dark-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Session Type */}
      {step === 1 && (
        <div>
          <h2 className="text-3xl font-display uppercase mb-6">Select Session Type</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {sessionTypes.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  setSelectedType(session.id);
                  setStep(2);
                }}
                className={`card text-left hover:border-primary-500 transition-colors ${
                  selectedType === session.id ? 'border-primary-500' : ''
                }`}
              >
                <h3 className="text-xl font-display uppercase mb-2">{session.name}</h3>
                <p className="text-gray-400 mb-4">{session.duration} minutes</p>
                <p className="text-2xl font-display text-primary-500">£{session.price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && (
        <div>
          <h2 className="text-3xl font-display uppercase mb-6">Select Date & Time</h2>

          <div className="card mb-6">
            <h3 className="text-xl font-display uppercase mb-4">
              {selectedSession?.name}
            </h3>
            <p className="text-gray-400">
              {selectedSession?.duration} minutes • £{selectedSession?.price}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Date
              </label>
              <input
                type="date"
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Time
              </label>
              {availability?.data?.length > 0 ? (
                <div className="space-y-2">
                  {availability.data
                    .filter((slot: any) => slot.available)
                    .map((slot: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTime(format(new Date(slot.startTime), 'HH:mm'))}
                        className={`w-full btn ${
                          selectedTime === format(new Date(slot.startTime), 'HH:mm')
                            ? 'btn-primary'
                            : 'btn-outline'
                        }`}
                      >
                        {format(new Date(slot.startTime), 'h:mm a')}
                      </button>
                    ))}
                </div>
              ) : (
                <p className="text-gray-400">Select a date to see available times</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              rows={4}
              placeholder="Tell us about your goals or any specific areas you'd like to focus on..."
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button onClick={() => setStep(1)} className="btn-outline">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="btn-primary flex-1"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div>
          <h2 className="text-3xl font-display uppercase mb-6">Payment</h2>

          <div className="card mb-6">
            <h3 className="text-xl font-display uppercase mb-4">Booking Summary</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center">
                <FiCheckCircle className="mr-3 text-primary-500" />
                {selectedSession?.name}
              </div>
              <div className="flex items-center">
                <FiCalendar className="mr-3 text-primary-500" />
                {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="flex items-center">
                <FiClock className="mr-3 text-primary-500" />
                {selectedTime}
              </div>
              <div className="flex items-center justify-between border-t border-dark-800 pt-3 mt-3">
                <span className="font-display uppercase">Total</span>
                <span className="text-2xl font-display text-primary-500">
                  £{selectedSession?.price}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="card">
            <h3 className="text-xl font-display uppercase mb-4">Card Details</h3>
            <div className="bg-dark-900 p-4 rounded-lg mb-6">
              <CardElement
                options={{
                  style: {
                    base: {
                      color: '#fff',
                      fontSize: '16px',
                    },
                  },
                }}
              />
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(2)} className="btn-outline">
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !stripe}
                className="btn-primary flex-1"
              >
                {loading ? 'Processing...' : `Pay £${selectedSession?.price}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-5xl text-green-500" />
          </div>
          <h2 className="text-3xl font-display uppercase mb-4">Booking Confirmed!</h2>
          <p className="text-gray-400 mb-8">
            You'll receive a confirmation email with calendar invite shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              View Dashboard
            </button>
            <button onClick={() => router.push('/')} className="btn-outline">
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="container-custom">
          <Elements stripe={stripePromise}>
            <BookingForm />
          </Elements>
        </div>
      </div>
      <Footer />
    </div>
  );
}
