import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sanches Coaching | Premium Football Training",
  description:
    "Book premium football coaching sessions with Gus Sanches. 1-to-1 training, group sessions, assessments, and elite training camps.",
  keywords: [
    "football coaching",
    "personal training",
    "Gus Sanches",
    "1-to-1 coaching",
    "football camps",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} font-body antialiased bg-[#050505] text-white min-h-screen`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
