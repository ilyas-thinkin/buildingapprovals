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

const siteUrl = new URL("https://www.buildingapprovals.ae");
// Google Analytics property used for gtag configuration.
const GA_MEASUREMENT_ID = "G-GK7ZKMLRR2";
// Google Ads conversion tracking ID.
const GOOGLE_ADS_ID = "AW-17844606318";

// Site-wide SEO metadata, social previews, canonical URL, and verification tokens.
export const metadata: Metadata = {
  metadataBase: siteUrl,
  // Core titles and description reused across pages.
  title: {
    default: "Dubai Municipality Approval | DM | DCD | Trakhees approval",
    template: "%s | Building Approvals Dubai",
  },
  description:
    "Dubai's trusted engineering & fitout approval services. Dubai municipality, DCD, DDA, DSO, DHA, JAFZA, Nakheel, and all other authority approvals. Call Now.",
  // Primary keyword set for search engines.
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
  // Open Graph tags for social previews.
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Building Approvals Dubai",
    title: "Dubai Municipality Approval | DM | DCD | Trakhees approval",
    description:
      "Dubai's trusted engineering & fitout approval services. Dubai municipality, DCD, DDA, DSO, DHA, JAFZA, Nakheel, and all other authority approvals. Call Now.",
    images: [
      {
        url: "/images/BA OG Logo_imresizer (1).png?v=2",
        width: 1200,
        height: 1200,
        alt: "Building Approvals Dubai",
      },
    ],
  },
  // Twitter card metadata for link sharing.
  twitter: {
    card: "summary_large_image",
    title: "Dubai Municipality Approval | DM | DCD | Trakhees approval",
    description:
      "Dubai's trusted engineering & fitout approval services. Dubai municipality, DCD, DDA, DSO, DHA, JAFZA, Nakheel, and all other authority approvals. Call Now.",
    images: ["/images/BA OG Logo_imresizer (1).png?v=2"],
  },
  // Canonical URL applied to all routes.
  alternates: {
    canonical: siteUrl.href,
  },
  // Crawl directives for search engines.
  robots: {
    index: true,
    follow: true,
  },
  // Google Search Console verification token.
  verification: {
    google: "1RihkLPG-TpLD2tnqwYW9MHjgWWaajO_br8pGGWeDpY",
  },
  // Web app manifest for PWA support and icon configuration.
  manifest: "/manifest.json",
  // Favicon variants for different devices.
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/images/BA OG Logo_imresizer (1).png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/favicon.ico" },
      { url: "/images/BA OG Logo_imresizer (1).png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/images/BA OG Logo_imresizer (1).png",
      },
    ],
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
        {/* Google Tag Manager bootstrap */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-MGLFLKWF');
            `,
          }}
        />
        {/* GTM noscript fallback for non-JS browsers */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MGLFLKWF"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Google Analytics tag loader */}
        <Script
          id="ga-external"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        {/* GA configuration for page view tracking */}
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
        {/* Google Ads conversion tracking */}
        <Script
          id="google-ads-external"
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-ads-inline"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_ID}');
            `,
          }}
        />
        {/* LocalBusiness schema markup for Google Business Profile & rich results */}
        <Script
          id="ld-local-business"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "@id": `${siteUrl.href}#business`,
              name: "Building Approvals Dubai",
              alternateName: "Building Approvals",
              url: siteUrl.href,
              telephone: "+971589575610",
              email: "info@buildingapprovals.ae",
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl.origin}/images/BA OG Logo_imresizer (1).png?v=2`,
                width: "1200",
                height: "1200",
                caption: "Building Approvals Dubai Logo",
              },
              image: `${siteUrl.origin}/images/BA OG Logo_imresizer (1).png?v=2`,
              description:
                "Dubai's trusted engineering & fitout approval consultancy. We handle Dubai Municipality, Civil Defence, DEWA, Trakhees, Emaar, Nakheel, DHA, DSO, JAFZA, and all other authority approvals and NOCs across Dubai.",
              priceRange: "$$",
              currenciesAccepted: "AED",
              paymentAccepted: "Cash, Credit Card, Bank Transfer",
              address: {
                "@type": "PostalAddress",
                streetAddress:
                  "Office No: 302-2, Al Babtain building, 2nd St - Port Saeed",
                addressLocality: "Dubai",
                addressRegion: "Dubai",
                postalCode: "00000",
                addressCountry: "AE",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 25.2503628,
                longitude: 55.3099428,
              },
              hasMap: "https://maps.app.goo.gl/WuitF9PhjnDoV71E6",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Saturday",
                  ],
                  opens: "09:00",
                  closes: "18:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Sunday",
                  opens: "09:00",
                  closes: "14:00",
                },
              ],
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+971589575610",
                  contactType: "customer service",
                  areaServed: "AE",
                  availableLanguage: ["English", "Arabic"],
                },
                {
                  "@type": "ContactPoint",
                  telephone: "+971589575610",
                  contactType: "sales",
                  areaServed: "AE",
                  availableLanguage: ["English", "Arabic"],
                },
              ],
              areaServed: {
                "@type": "City",
                name: "Dubai",
                "@id": "https://www.wikidata.org/wiki/Q612",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                bestRating: "5",
                worstRating: "1",
                ratingCount: "11",
                reviewCount: "11",
              },
              sameAs: [
                "https://www.buildingapprovals.ae",
                "https://maps.app.goo.gl/WuitF9PhjnDoV71E6",
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Dubai Authority Approval Services",
                itemListElement: [
                  {
                    "@type": "OfferCatalog",
                    name: "Government Authority Approvals",
                    itemListElement: [
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Dubai Municipality Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Civil Defence Approval (DCD)" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "DEWA Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Trakhees Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "RTA Permit and Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Food Control Department Approval" } },
                    ],
                  },
                  {
                    "@type": "OfferCatalog",
                    name: "Developer & Free Zone Approvals",
                    itemListElement: [
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Emaar Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Nakheel Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "DHA Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "DSO / DIEZ Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "JAFZA Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "DDA Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tecom & DCCA Approval" } },
                    ],
                  },
                  {
                    "@type": "OfferCatalog",
                    name: "Specialty Approvals",
                    itemListElement: [
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Signage Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Spa Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Shisha Cafe License" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Smoking Permit" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Swimming Pool Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Solar Approval" } },
                      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tent Approval" } },
                    ],
                  },
                ],
              },
            }),
          }}
        />
        {/* WebSite schema for sitelinks search box */}
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${siteUrl.href}#website`,
              name: "Building Approvals Dubai",
              url: siteUrl.href,
              publisher: {
                "@id": `${siteUrl.href}#business`,
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl.href}blog?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
              inLanguage: "en-AE",
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
