import { Link } from "wouter";

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-error mb-4">404</h1>
      <p className="text-xl text-base-content/70 mb-8">Page not found</p>
      <Link href="/" className="btn btn-primary btn-lg">
        Return Home
      </Link>
    </div>
  );
}
