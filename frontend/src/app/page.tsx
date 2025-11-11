import { Hero } from '@/components/layout/Hero';
import { Features } from '@/components/layout/Features';
import { SessionTypes } from '@/components/booking/SessionTypes';
import { MediaGallery } from '@/components/layout/MediaGallery';
import { UpcomingEvents } from '@/components/layout/UpcomingEvents';
import { InstagramFeed } from '@/components/layout/InstagramFeed';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <SessionTypes />
      <UpcomingEvents />
      <MediaGallery />
      <InstagramFeed />
      <Footer />
    </div>
  );
}
