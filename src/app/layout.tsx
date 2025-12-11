import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = new URL("https://buildingapprovals.ae");
const GA_MEASUREMENT_ID = "G-GK7ZKMLRR2";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Building Approvals | Authority approvals done right",
    template: "%s | Building Approvals",
  },
  description:
    "Building Approvals is Dubai's specialist consultancy for fast, compliant authority approvals and NOCs across Civil Defense, DEWA, Dubai Municipality, RTA, Trakhees, and more.",
  keywords: [
    "Dubai authority approvals",
    "Civil Defense approval Dubai",
    "DEWA approval",
    "Dubai Municipality permit",
    "RTA permit",
    "Trakhees approval",
    "Emaar approvals",
    "Nakheel approvals",
    "DHA approval",
    "DSO approval",
    "JAFZA approvals",
    "Dubai building permits",
    "Dubai NOC services",
    "Dubai signage permit",
    "Dubai construction approvals",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Building Approvals",
    title: "Building Approvals | Authority approvals done right",
    description:
      "End-to-end authority approvals across Dubai with zero resubmissions and faster timelines.",
    images: [
      {
        url: "/images/Building Approvals OG Logo.png",
        width: 1200,
        height: 630,
        alt: "Building Approvals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Building Approvals | Authority approvals done right",
  description:
    "Fast, compliant approvals and NOCs across Dubai authorities with zero resubmissions.",
  images: ["/images/Building Approvals OG Logo.png"],
},
  alternates: {
    canonical: siteUrl.href,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "1RihkLPG-TpLD2tnqwYW9MHjgWWaajO_br8pGGWeDpY",
  },
  icons: {
    icon: "/images/favicon (2).ico",
    shortcut: "/images/favicon (2).ico",
    apple: "/images/favicon (2).ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="ga-external"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga-inline"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `,
          }}
        />
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Building Approvals",
              url: siteUrl.href,
              logo: `${siteUrl.origin}/logo/logo.webp`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+971589575610",
                contactType: "customer service",
                areaServed: "AE",
                availableLanguage: ["English"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Office No: 302-2, Al Babtain building, 2nd St - Port Saeed",
                addressLocality: "Dubai",
                addressCountry: "AE",
              },
            }),
          }}
        />
        <Navbar />
        {children}
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
