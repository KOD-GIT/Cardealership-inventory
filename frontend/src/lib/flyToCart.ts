/**
 * The "add to cart" flourish: a lightweight clone of the vehicle photo travels to the cart badge.
 *
 * - The source card is never touched (the clone is a separate element), so the layout stays stable.
 * - It is fire-and-forget. The cart state is updated by the caller before this runs, and nothing waits for
 *   the animation, so a slow or skipped animation can never lose an item.
 * - People who prefer reduced motion, browsers without the Web Animations API, and a missing cart badge all
 *   simply skip it. The badge itself flashes instead, which is immediate and non-moving.
 */
export const CART_TARGET_ATTR = "data-cart-target";

export function flyToCart(source: Element | null, imageSrc: string | null | undefined): void {
  const target = document.querySelector<HTMLElement>(`[${CART_TARGET_ATTR}]`);
  if (!target) return;
  const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  flash(target);
  if (reduced || !source || typeof Element.prototype.animate !== "function") return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) return;

  const clone = document.createElement("div");
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed", left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`,
    zIndex: "80", pointerEvents: "none", background: imageSrc ? `#141414 url("${imageSrc}") center / cover` : "#FF4A1C",
    border: "1px solid #FF4A1C", transformOrigin: "center",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const animation = clone.animate(
    [
      { transform: "translate(0,0) scale(1) skewX(0deg)", opacity: 1 },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.15}px) scale(0.6) skewX(-9deg)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12) skewX(-9deg)`, opacity: 0.9 },
    ],
    { duration: 560, easing: "cubic-bezier(.22,1,.36,1)" },
  );
  const done = () => clone.remove();
  animation.onfinish = done;
  animation.oncancel = done;
}

/** A one-frame orange rule over the badge: instant feedback that works without any movement. */
function flash(target: HTMLElement): void {
  const mark = document.createElement("span");
  mark.setAttribute("aria-hidden", "true");
  mark.className = "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 animate-flash bg-signal";
  if (getComputedStyle(target).position === "static") target.style.position = "relative";
  target.appendChild(mark);
  window.setTimeout(() => mark.remove(), 300);
}
