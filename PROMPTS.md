# PROMPTS.md

Raw, **unedited** AI chat logs (or public share links). No AI-generated summaries.

## Session 1 - Stack selection & project skeleton
<!-- Paste the full chat transcript or a public share link here. -->

## Session 2 - Google Stitch UI Prompts (Showroom)

# Google Stitch prompts: Showroom

Every prompt below is **self-contained**: copy one code block, paste it into Stitch, generate, then move to the next.
They match the frontend that was built in React + Tailwind, so the exported designs line up with the real app.

## How to use
1. Generate the **11 required screens** (prompts 1 to 7d) first. That leaves room under Stitch's 16-screen limit for retries. Delete failed or duplicate screens as you go.
2. The four **optional** prompts (O1 to O4) are small states that are quick to build in code. Only generate them if you have screens to spare.
3. Generate **one screen per prompt**. When screens were combined, Stitch invented demo pages with tabs and extra features.
4. If a result adds things you did not ask for, use the **correction prompt** at the end instead of regenerating.
5. Keep the prompts and Stitch's replies unedited in `PROMPTS.md`, and mention Stitch in "My AI Usage" in the README.

## What the shared text does
Each prompt starts with the **design system** (colors, fonts, top bar) and ends with the **rules** (only the listed elements, the real data fields, the seven categories, label wording). The colors are the contrast-checked values used in the app: muted text `#566174` and amber text `#7A4E08` replace the lighter shades that failed WCAG AA.

---

## Required screens

### 1. Sign in (desktop)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the desktop Sign in screen. Split screen. Left half: deep teal (#094F4B) panel with a full-bleed dark, moody photo of a teal sports coupe in a glass showroom at night, the logo at top left, and at the bottom the headline "Every car, in stock and in sight." in large white Archivo Narrow with one supporting line: "Browse the floor, bring a car into view, and purchase it in one click." Right half: pale grey page with a centered white card containing: title "Sign in", subtitle "Welcome back. Sign in to browse the showroom.", fields Email and Password (the password field has a show/hide eye icon button), a full-width teal "Sign in" button, and below it "New here? Create an account".
Only these elements: no "remember me", no "forgot password", no statistics, no security badges, no top navigation.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 2. Create account (desktop)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Same split-screen layout as the Sign in screen. Card content: title "Create account", subtitle "Register to browse and purchase vehicles.", fields Email, Password (helper text "At least 8 characters.") and Confirm password (both with show/hide icon buttons), a full-width teal "Create account" button, and below it "Already have an account? Sign in".
Show the Email field in an ERROR state: red border and the message "Email already registered. Try signing in instead." under it.
No steps ("Step 1 of 3"), no "curator" or "dealership" wording, no extra requirements on the password.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 3. Dashboard with parked cars (desktop)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the main Dashboard for a signed-in User. Heading "Available vehicles" on the left and the count "8 vehicles" on the right. Below: ONE filter card with the fields Make, Model, Category (dropdown: All categories plus the seven categories), Min price, Max price, a teal "Search" button and a secondary icon button "Reset". Below that, a responsive grid of 8 vehicle cards (3 columns on desktop).

Vehicle card: a 4:3 "showroom window" with a soft light-grey gradient and a thin floor line. In it the car is a clean flat side-view illustration FACING LEFT, parked at the RIGHT EDGE and cropped by the card so only the front third is visible (headlight, hood, front wheel). Each car has a different paint color. Under the window: make in small muted text with the stock badge on the right; model in large bold Archivo Narrow; a category pill and the year; a divider; the label "Price" on the left and the price large in teal on the right; a full-width teal "Purchase" button. The out-of-stock car is greyscale and its button is disabled, grey, labelled "Unavailable" with a ban icon.

Under the grid, one centered muted line: "Hover a car, or tap it on a touch screen, to bring it into view. Drag to rotate."

Sample vehicles (use exactly these, in this order):
1. Toyota Camry, Sedan, 2024, $27,999.99, 4 in stock
2. Honda Civic, Hatchback, 2023, $22,500.00, Only 1 left
3. Ford F-150, Truck, no year, $41,250.50, Out of stock
4. Mazda MX-5, Convertible, 2024, $31,990.00, 3 in stock
5. Subaru Outback, SUV, 2025, $34,200.00, 6 in stock
6. Chevrolet Corvette, Coupe, 2024, $68,500.00, Only 2 left
7. Honda Odyssey, Van, 2023, $38,900.00, 5 in stock
8. Tesla Model 3, Sedan, 2024, $40,240.00, 7 in stock

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 4. Card states: parked and in view

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design a close-up comparison of ONE vehicle card (Toyota Camry, Sedan, 2024, $27,999.99, 4 in stock) in two states, side by side, each about 420px wide, with small captions "Parked" and "In view".
Parked: the car in flat side view facing left, at the right edge of the 4:3 window, cropped so only the front third shows.
In view: the same card with a slightly stronger shadow. The car is fully visible and centered in a front three-quarter view with a soft contact shadow on the floor line. A white pill at the bottom left of the window says "Drag to rotate". Two small round icon buttons at the bottom right: rotate left and rotate right (circular arrows, with tooltips). Everything below the window stays identical.
Add two short annotations with arrows: "Slides in from the right on hover, focus or tap" and "Drag, or use the buttons, to rotate".

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 5. Manage inventory (admin, desktop)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the Admin screen for an ADMIN user (top bar shows the "Manage inventory" link as active and the "Admin" badge). Heading "Manage inventory" on the left and a teal "+ Add vehicle" button on the right. Below: three stat cards in a row: "Vehicles" 8, "Units in stock" 27, "Out of stock" 1 (number in red). Then one filter card: "Search make or model", Category dropdown, Stock dropdown (All, In stock, Low stock, Out of stock) and a "Clear filters" button.
Then a data table, one row per sample vehicle, with columns: small side-view car thumbnail, ID (1 to 8), Make, Model, Category (pill), Year, Price (right-aligned, teal), Stock (badge), and Actions: three icon buttons with tooltips: "Restock" (box with a plus), "Edit" (pencil), "Delete" (trash, turns red on hover). Show "Showing 8 of 8 vehicles" above the table.
No pagination, no export button, no extra columns.

Sample vehicles (use exactly these, in this order):
1. Toyota Camry, Sedan, 2024, $27,999.99, 4 in stock
2. Honda Civic, Hatchback, 2023, $22,500.00, Only 1 left
3. Ford F-150, Truck, no year, $41,250.50, Out of stock
4. Mazda MX-5, Convertible, 2024, $31,990.00, 3 in stock
5. Subaru Outback, SUV, 2025, $34,200.00, 6 in stock
6. Chevrolet Corvette, Coupe, 2024, $68,500.00, Only 2 left
7. Honda Odyssey, Van, 2023, $38,900.00, 5 in stock
8. Tesla Model 3, Sedan, 2024, $40,240.00, 7 in stock

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 6a. Add / edit vehicle dialog

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design a modal dialog over the dimmed Admin screen. Title "Edit vehicle", subtitle "Update the details shown to customers." Two-column form: Make, Model, Category (dropdown), Year (label shows "(optional)"), Price (with a $ prefix), Quantity in stock, and a full-width field "Image link" (optional) with helper text "Shown on the vehicle card. Leave empty to use the standard car." Pre-fill with Toyota Camry, Sedan, 2024, 27999.99, 3.
Show the Price field in an ERROR state with the message "Price must be greater than 0". Footer buttons: "Cancel" (secondary) and "Save vehicle" (teal). Close icon top right.
No live preview panel, no upload button, no extra fields.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 6b. Restock and delete dialogs

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

On one canvas over a dimmed Admin screen, show two small dialogs side by side.
Left: title "Restock Ford F-150". A grey row "Current stock" with a red "Out of stock" badge. A field "Units to add" with minus and plus stepper buttons and the value 5. A light teal row "New stock: 5 units". Buttons "Cancel" and "Restock".
Right: title "Delete Honda Civic?" with the text "This cannot be undone. Purchase history is kept." and a small red warning icon. Buttons "Cancel" and a red "Delete vehicle".
Both dialogs fully visible, not cropped.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 7a. Mobile dashboard (390px)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the mobile (390px wide) Dashboard. Compact top bar: logo mark only, the "Vehicles" link and an icon-only "Log out" button. Heading "Available vehicles" with "8 vehicles" on the same line. One filter card with stacked fields (Make, Model, Category, Min price, Max price) and two buttons side by side: "Search" and "Reset". Then a single column of vehicle cards.

Vehicle card: a 4:3 "showroom window" with a soft light-grey gradient and a thin floor line. In it the car is a clean flat side-view illustration FACING LEFT, parked at the RIGHT EDGE and cropped by the card so only the front third is visible (headlight, hood, front wheel). Each car has a different paint color. Under the window: make in small muted text with the stock badge on the right; model in large bold Archivo Narrow; a category pill and the year; a divider; the label "Price" on the left and the price large in teal on the right; a full-width teal "Purchase" button. The out-of-stock car is greyscale and its button is disabled, grey, labelled "Unavailable" with a ban icon.

Sample vehicles (use exactly these, in this order):
1. Toyota Camry, Sedan, 2024, $27,999.99, 4 in stock
2. Honda Civic, Hatchback, 2023, $22,500.00, Only 1 left
3. Ford F-150, Truck, no year, $41,250.50, Out of stock
4. Mazda MX-5, Convertible, 2024, $31,990.00, 3 in stock
5. Subaru Outback, SUV, 2025, $34,200.00, 6 in stock
6. Chevrolet Corvette, Coupe, 2024, $68,500.00, Only 2 left
7. Honda Odyssey, Van, 2023, $38,900.00, 5 in stock
8. Tesla Model 3, Sedan, 2024, $40,240.00, 7 in stock

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 7b. Mobile card: tapped state

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the mobile (390px) vehicle card (Toyota Camry, Sedan, 2024, $27,999.99, 4 in stock) in its TAPPED state, next to its parked state with captions "Parked" and "Tapped".
Tapped: the car is fully visible and centered in a front three-quarter view; a white pill at the top right of the window says "Tap again to close"; a pill at the bottom left says "Drag to rotate"; two round rotate-left and rotate-right buttons at the bottom right. The price and Purchase button stay below, unchanged.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 7c. Mobile sign in (390px)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the mobile (390px) Sign in screen: a 140px-high dark teal photo strip at the top (teal sports coupe in a glass showroom at night) with the logo at its bottom left, then the white card directly below it with title "Sign in", subtitle "Welcome back. Sign in to browse the showroom.", fields Email and Password (show/hide eye button), a full-width teal "Sign in" button and "New here? Create an account".
No role switch of any kind (the account decides who is an admin), no "remember me", no badges.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### 7d. Mobile admin (390px)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the mobile (390px) Admin screen. Compact top bar with logo mark, "Vehicles" and "Manage inventory" links and an icon-only "Log out". Heading "Manage inventory", then a teal "+ Add vehicle" button, then three small stat cards in one row (Vehicles 8, Units in stock 27, Out of stock 1). Then a stacked filter card (Search make or model, Category, Stock, Clear filters). Then one card per vehicle (use the first three sample vehicles): small car thumbnail, "Make, year", model large, category pill, price in teal, stock badge, and a row of three icon buttons at the bottom right: Restock, Edit, Delete.
No pagination, no sort controls.

Sample vehicles (use exactly these, in this order):
1. Toyota Camry, Sedan, 2024, $27,999.99, 4 in stock
2. Honda Civic, Hatchback, 2023, $22,500.00, Only 1 left
3. Ford F-150, Truck, no year, $41,250.50, Out of stock
4. Mazda MX-5, Convertible, 2024, $31,990.00, 3 in stock
5. Subaru Outback, SUV, 2025, $34,200.00, 6 in stock
6. Chevrolet Corvette, Coupe, 2024, $68,500.00, Only 2 left
7. Honda Odyssey, Van, 2023, $38,900.00, 5 in stock
8. Tesla Model 3, Sedan, 2024, $40,240.00, 7 in stock

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

---

## Optional screens

### O1. Dashboard loading (optional)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the Dashboard in its LOADING state: same top bar, heading "Available vehicles" and filter card, but the grid shows 8 skeleton cards (grey rounded blocks with a faint shimmer) that match the real card layout: a 4:3 block, a short line, a title line, a pill, a price line and a full-width button block.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### O2. Dashboard empty search (optional)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the Dashboard with NO RESULTS: same top bar, heading and the same filter card (Make filled with "Zzz"). Where the grid would be, a white card with a centered teal-tinted circle icon (search with an X), the heading "No vehicles match your search", the line "Try removing a filter or searching for a different make." and a teal "Reset filters" button.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### O3. Dashboard error (optional)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Design the Dashboard with a LOAD ERROR: same top bar, heading and filter card. Under them a red-tinted banner with a warning icon, the title "Couldn't load vehicles", the line "Check your connection and try again." and a secondary "Try again" button on the right.

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

### O4. Toasts (optional)

```
Design system "Showroom" (a digital car showroom, web app). Colors: page background #F2F4F6, white cards, ink text #12161C, muted text #566174, borders #DDE3EA, primary teal #0E6B66, success green #1F7A4D on #D1FADF, low-stock amber dot #B7791F with dark amber text #7A4E08 on #FEF3C7, danger red #B42318 on #FEE4E2. Fonts: Archivo Narrow bold for headings and prices, IBM Plex Sans for everything else. 12px corner radius, soft shadows, sentence-case labels, minimum text size 12px, every input has a visible label above it, icon-only buttons have tooltips, scrollbars stay visible.
Top bar (signed-in screens): small teal logo mark plus the word "Showroom", links "Vehicles" (and "Manage inventory" for admins), then the user email, a small role badge ("User" or "Admin") and a "Log out" button. NO sidebar.

Show the normal Dashboard grid (use the 8 sample vehicles) with two toast notifications stacked at the bottom right.
Toast 1 (success): green check icon, bold title "Toyota Camry purchased", line "Your purchase is complete.", close icon, green left edge.
Toast 2 (error): red warning icon, bold title "That car just sold out", line "Another customer bought the last one. Try another vehicle.", close icon, red left edge.
No links, no extra fields.

Sample vehicles (use exactly these, in this order):
1. Toyota Camry, Sedan, 2024, $27,999.99, 4 in stock
2. Honda Civic, Hatchback, 2023, $22,500.00, Only 1 left
3. Ford F-150, Truck, no year, $41,250.50, Out of stock
4. Mazda MX-5, Convertible, 2024, $31,990.00, 3 in stock
5. Subaru Outback, SUV, 2025, $34,200.00, 6 in stock
6. Chevrolet Corvette, Coupe, 2024, $68,500.00, Only 2 left
7. Honda Odyssey, Van, 2023, $38,900.00, 5 in stock
8. Tesla Model 3, Sedan, 2024, $40,240.00, 7 in stock

Include ONLY what is described. Do not add sidebars, breadcrumbs, footers, status or telemetry banners, analytics, fake statistics, security or certification badges, VIN or chassis numbers, engine / horsepower / 0-60 / mileage specs, "bay" numbers, extra navigation or extra features. A vehicle has only: make, model, category, price, quantity in stock, year, image. Categories are exactly: Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (never "Reserve") and "Price" (never "MSRP"). Prices look like $27,999.99. Stock labels: "4 in stock", "Only 1 left" (when 1 or 2 units remain), "Out of stock". Cars are generic illustrations with no brand logos or badges.
```

---

## Correction prompt (for a screen that came out wrong)

Paste this into Stitch on the screen you want to fix:

```
Keep the current visual style and layout. Remove everything that is not in this list: sidebar, breadcrumbs, footer links, telemetry or status banners, "bay" labels, VIN or chassis numbers, engine / HP / 0-60 / mileage specs, security or certification badges, fake statistics, "remember me", "forgot password", pagination, export buttons, upload buttons.
A vehicle has only: make, model, category, price, quantity, year, image.
Categories are exactly Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van. Say "Purchase" (not "Reserve") and "Price" (not "MSRP"). IDs are plain numbers. Prices look like $27,999.99.
Every input has a visible label. Minimum text size 12px. Icon-only buttons have tooltips. There is no role switch on the sign-in screen.
Use one top bar only: logo mark, links, user email, role badge, Log out.
```

## Quick reference (matches the API)

| Item | Value |
|---|---|
| Vehicle fields | make, model, category, price, quantity, year (optional), image (optional) |
| Categories | Sedan, SUV, Hatchback, Coupe, Convertible, Truck, Van |
| Stock labels | `N in stock` (3 or more), `Only N left` (1 or 2), `Out of stock` (0, Purchase disabled and labelled "Unavailable") |
| Password rule | at least 8 characters (nothing else) |
| Search filters | make, model, category, min price, max price |
| Admin actions | restock, edit, delete, add vehicle |
| Roles | User, Admin (set by the account, never chosen on screen) |

## After exporting
Put the exported files in `frontend/design-reference/` and treat them as a visual reference only. Rebuild each screen as React components and check it against `docs/API_CONTRACT.md` and `docs/DESIGN_REVIEW.md`.
