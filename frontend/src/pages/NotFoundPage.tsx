import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-ink-soft">
        We couldn't find the page you were looking for.
      </p>
      <Link to="/" className="btn-primary mx-auto mt-6 w-fit">
        Back to home
      </Link>
    </div>
  );
}
