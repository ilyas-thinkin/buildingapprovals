import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-text">
          The page you&apos;re looking for may have moved, been removed, or never existed.
          You can head back home or explore our approval services instead.
        </p>

        <div className="not-found-actions">
          <Link href="/" className="not-found-primary">
            Back to Home
          </Link>
          <Link href="/services" className="not-found-secondary">
            Explore Services
          </Link>
        </div>

        <div className="not-found-links">
          <Link href="/blog">Visit Blog</Link>
          <Link href="/contact">Contact Us</Link>
        </div>
      </section>
    </main>
  );
}
