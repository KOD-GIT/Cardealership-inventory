# Design review: Stitch export vs. the Showroom frontend

The UI was first explored in Google Stitch (an AI design tool). The export was reviewed screen by screen
and used **as a visual reference only**. Nothing from the exported HTML is shipped; every component was
rebuilt in React + Tailwind. This file records what was kept, what was changed and why, so the AI usage is
transparent (see "My AI Usage" in the README).

## What was kept
- The colour palette (teal `#0E6B66`, cool grey canvas, status colours) and the typefaces (Archivo Narrow, IBM Plex Sans).
- The **parked car** idea: only the nose is visible until hover, focus or tap, then the car slides in and can be rotated.
- The Dashboard filter bar (make, model, category, price range), stock badge scheme, toasts, admin stats strip,
  table with restock/edit/delete icon actions, and the add/edit, restock and delete dialogs.
- The hero photo on the auth screens (compressed from 1.2 MB to 26 KB).

## What was removed or corrected, and why
| Problem in the export | Fix | Reason |
|---|---|---|
| Sidebar (Appraisals, Sales Pipeline, Client Portfolios), "Studio Node", breadcrumbs, footer links | Removed | Not in the kata or the API |
| VIN / chassis numbers, HP, 0-60, mileage, "Bays", "Telemetry", "Studio Tag", MSRP | Removed; shown as "Price" | The API has make, model, category, price, quantity, year, image only |
| Categories like Grand Tourer, Electric, Hypercar | Exactly the 7 API values | Filter and form must match the enum |
| IDs like `SHW-0911` | Numeric IDs | API IDs are integers |
| "Reserve this vehicle" | "Purchase" | The API has a purchase endpoint, not reservations |
| Mobile login with a "Fill Admin / Fill Client" switch | Removed | Role must come from the account, never from a client-side toggle |
| Password hint "number and architectural symbol" | "At least 8 characters" | That is the real API rule |
| "SOC2 Certified", "WCAG AAA Compliant", fake stats | Removed | Claims that cannot be backed up |
| Remember device, Forgot password, Request access, Step 1 of 3 | Removed | No such features |
| Pagination, "+4 this week", "Export Spec Sheet" | Removed | Out of scope / no data source (decision D16) |
| Three different card designs and two filter bars across screens | One `VehicleCard`, one `SearchFilterBar` | Consistency |
| Two different teals (`#00514d` and `#0E6B66`) and a blue-tinted background | One brand teal, grey canvas | Consistency |
| Amber text `#B7791F` on `#FEF3C7` = 3.3:1; grey `#64748B` on the canvas = 4.3:1 | `warning-ink #7A4E08` (6.5:1), `muted #566174` (5.7:1) | WCAG AA needs 4.5:1 |
| Inputs with placeholders only; icon buttons with no accessible name | Visible labels; `aria-label` on every icon button | Accessibility |
| 10-11 px uppercase labels; scrollbars hidden on 17 of 19 screens | 12 px minimum, sentence case, native scrollbars | Readability |
| Tailwind via CDN, Google Fonts with no fallback stack, hot-linked images, icon-font ligatures | Compiled Tailwind, self-hosted fonts with fallbacks, local assets, `lucide-react` icons | Works offline and cannot break if a CDN is down |

## Verified in a real browser
The production build was driven with headless Chromium (software WebGL) against a mocked API: the 3D card
mounts on hover, rotates on drag, returns to the parked state on leave, and the mobile layouts fit at 390 px.
Screenshots are in `docs/screenshots/`. They were captured against mocked data and should be retaken once
the backend is finished.
