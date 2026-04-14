# Design System Specification: Editorial Vitality

## 1. Overview & Creative North Star
**Creative North Star: "The Living Sanctuary"**

This design system rejects the clinical, rigid structures common in health tech in favor of a "Living Sanctuary." We are moving away from the "app-in-a-box" aesthetic toward a high-end, editorial experience that feels organic, breathable, and premium. 

To achieve this, we employ **Intentional Asymmetry** and **Tonal Depth**. By breaking the traditional 12-column grid with overlapping elements and generous whitespace, we mimic the organized randomness of nature. We don't just "show data"; we curate a wellness journey through sophisticated typography and layered surfaces that feel like a high-end physical journal.

---

## 2. Colors & Surface Logic

Our palette is rooted in the "Chlorophyll Scale"—a range of greens that feel biological rather than digital.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts or tonal transitions.
- Use `surface-container-low` sections against a `surface` background to denote a change in context.
- High-contrast lines create visual "noise" that disrupts the calm aesthetic.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-stock paper.
*   **Base Layer:** `surface` (#f8f9fa) — The foundation of the sanctuary.
*   **The Inset Layer:** `surface-container-low` (#f3f4f5) — Used for secondary grouping.
*   **The Floating Layer:** `surface-container-lowest` (#ffffff) — Reserved for the most important interactive cards to create a natural, "sun-bleached" lift.

### The "Glass & Gradient" Rule
To add visual "soul," use subtle linear gradients (e.g., `primary` to `primary-container`) for hero sections or main CTAs. For floating navigation or modal overlays, apply **Glassmorphism**: 
- Color: `surface` at 70% opacity.
- Backdrop Blur: 20px - 32px.
- This ensures the UI feels integrated with the "environment" rather than pasted on top.

---

## 3. Typography
We utilize a pairing of **Manrope** (for Display/Headlines) and **Inter** (for Body/Labels) to balance editorial authority with functional clarity.

*   **Display (Manrope):** Large, bold, and expressive. Use `display-lg` (3.5rem) for daily wins or key health metrics. The tight tracking and organic curves of Manrope reflect a modern, premium health brand.
*   **Headline (Manrope):** Use `headline-sm` (1.5rem) to introduce sections. Pair these with asymmetric alignment to create a rhythmic, non-standard layout.
*   **Body & Titles (Inter):** Inter handles the "work." Use `body-lg` (1rem) for most reading contexts. High x-height ensures readability even in low-light wellness scenarios.
*   **Labels:** Use `label-sm` (0.6875rem) in uppercase with 5% letter spacing for a sophisticated, "metadata" look.

---

## 4. Elevation & Depth

### Tonal Layering
Depth is achieved by "stacking" surface tiers. Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a soft, natural lift without the need for shadows.

### Ambient Shadows
When a "floating" effect is required for high-priority elements:
- **Blur:** 40px to 60px.
- **Opacity:** 4%–8%.
- **Tint:** The shadow must not be grey. Use a 10% opacity version of `on-surface` (#191c1d) to mimic natural ambient light.

### The "Ghost Border" Fallback
If a border is legally or functionally required (e.g., input fields), use a **Ghost Border**:
- Token: `outline-variant` (#bfcaba).
- Opacity: **20% maximum**.
- Forbid 100% opaque, high-contrast borders.

---

## 5. Components

### Buttons & Interaction
- **Primary CTA:** A soft gradient from `primary` (#0d631b) to `primary-container` (#2e7d32). 
- **Shape:** Use `xl` (1.5rem/24px) or `full` (pill) for a soft, friendly touch.
- **Secondary:** Use `secondary-container` (#abf4ac) with `on-secondary-container` text. No border.

### Input Fields & Controls
- **Text Inputs:** Use `surface-container-highest` as the background fill. No border. Active state is indicated by a subtle shift to `primary` for the label and a 2px `surface-tint` indicator at the bottom only.
- **Checkboxes & Radios:** Avoid sharp squares. Use `md` (0.75rem) roundedness for checkboxes. When selected, use a `primary` fill with a white checkmark.

### Cards & Lists
- **The Divider Ban:** Strictly forbid the use of divider lines between list items. Instead, use 16px to 24px of vertical whitespace (the "Breath" principle) or subtle background shifts.
- **Nurture Cards:** Health stats should be housed in `surface-container-lowest` cards with `xl` (1.5rem) corner radius. Use `tertiary` (#774d00) for small accents like "New" or "Hot" labels to provide warmth against the green.

### Specialty: The "Vitality Glass" (Health Metrics)
For core health data (Heart Rate, Steps), use a semi-transparent card with a `surface-tint` glow behind it, creating a "biological pulse" effect.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme whitespace (32px+) between major sections to let the design breathe.
*   **Do** use "Editorial Offsetting"—move images or headers slightly off-center to create a bespoke, custom-built feel.
*   **Do** prioritize the `surface` tokens over shadows for hierarchy.

### Don't:
*   **Don't** use pure black (#000000) or pure grey. Always use the `on-surface` (#191c1d) or `outline` tokens which are slightly tinted.
*   **Don't** use "default" system shadows. They feel heavy and clinical.
*   **Don't** place text on high-saturation green backgrounds for long periods; reserve high saturation for CTAs and status indicators.
*   **Don't** use 1px dividers. If you feel you need a divider, you actually need more whitespace.