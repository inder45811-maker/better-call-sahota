import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="container not-found">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>
        Let’s get you
        <br />
        <em>back on track.</em>
      </h1>
      <p>That page isn’t here. You can return home or explore the services.</p>
      <Link href="/" className="button">
        Back to the bigger picture
      </Link>
    </main>
  );
}
