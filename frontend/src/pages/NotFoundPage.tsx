import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6 text-center">
      <div>
        <h1 className="text-6xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted">That address doesn&rsquo;t exist. Head back to the showroom.</p>
        <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-[10px] bg-brand px-5 font-semibold text-white hover:bg-brand-dark">
          Back to vehicles
        </Link>
      </div>
    </main>
  );
}
