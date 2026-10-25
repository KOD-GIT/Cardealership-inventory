import { Link } from "react-router-dom";
import { buttonClass } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center gap-6 px-4 py-20 lg:px-10">
      <p className="t-label flex items-center gap-2 text-dim"><span aria-hidden="true" className="h-2 w-2 bg-signal" />Error 404</p>
      <h1 className="t-display">Off the <span className="t-outline">map</span></h1>
      <p className="max-w-xl text-lg text-dim">That address does not match anything on the floor. It may have been mistyped, or the page was removed.</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/floor" className={buttonClass("signal")}>Enter the floor</Link>
        <Link to="/" className={buttonClass("ghost")}>Home</Link>
      </div>
    </div>
  );
}
