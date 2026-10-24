import { useEffect } from "react";

/** Sets the browser tab title per page (also announced by screen readers on navigation). */
export function useDocumentTitle(title: string): void {
  useEffect(() => { document.title = `${title} | Showroom`; }, [title]);
}
