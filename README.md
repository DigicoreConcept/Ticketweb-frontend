# Digicore Ticketing Platform - Frontend Theme & Aesthetics

This document outlines the core design aesthetics, theme configuration, and styling utilities used in the frontend of the Digicore Ticketing Platform.

## 1. Design Aesthetics & Philosophy

The platform is designed to be **visually striking, premium, and highly dynamic**. To achieve a state-of-the-art user experience, the design relies on the following pillars:

- **Immersive Dark Mode**: The UI defaults to a sleek, pitch-black aesthetic (`#0a0a0a`) mixed with elevated dark gray surfaces (`#171717`) to create depth.
- **Vibrant Brand Colors**: A punchy, vivid orange/red (`#fb2d00`) acts as the primary accent, contrasting beautifully against the dark background.
- **Glassmorphism**: Widespread use of translucent backgrounds (`bg-white/5`), subtle borders, and background blurs to create a sense of hierarchy and modernity without heavy drop shadows.
- **Micro-Animations**: Dynamic interactions—such as shimmers, floating elements, and smooth border fills—make the interface feel responsive and alive.
- **Modern Typography**: Powered by Next.js font optimization using **Geist** (Sans and Mono), ensuring clean, legible, and premium text rendering.

---

## 2. Tailwind CSS v4 Configuration

This project uses **Tailwind CSS v4**. Instead of a traditional `tailwind.config.ts`, the theme tokens are directly injected into CSS via the `@theme inline` directive in `app/globals.css`.

### Base Color Tokens

| Variable | Hex Code | Purpose |
| :--- | :--- | :--- |
| `--background` | `#0a0a0a` | Main page background (deep black). |
| `--foreground` | `#ededed` | Primary text color. |
| `--primary` | `#fb2d00` | Call-to-actions, primary highlights, active states. |
| `--secondary` | `#713aed` | Secondary accents (purple). |
| `--card` / `--popover` | `#171717` | Elevated surface backgrounds (dropdowns, cards). |
| `--muted` / `--accent` | `#262626` | Subtle backgrounds and inactive states. |
| `--border` / `--input`| `#262626` | Default borders and form input backgrounds. |

### Border Radius
- `--radius-2xl`: `1rem`
- `--radius-3xl`: `1.5rem` (Used heavily for soft, rounded premium cards).

---

## 3. Custom Utilities & Classes

The theme provides custom utility classes layered on top of Tailwind to enforce consistency across components.

### Glassmorphism Classes
- `.glass`: Applies a transparent white background (`bg-white/5`), a strong backdrop blur (`backdrop-blur-lg`), and a subtle white border (`border-white/10`).
- `.glass-card`: A slightly darker variant for elevated cards with `shadow-xl`.

### Text Gradients
- `.text-gradient`: Instantly applies the primary brand color to text. (Can be expanded to linear gradients).

### Heading Typography
Global base overrides automatically apply heavy, tight typography to all heading elements (`h1` through `h6`):
- **Font Weight**: Bold.
- **Tracking**: Tight.
- **Scaling**: Responsive text scaling applied globally to `h1`, `h2`, and `h3` tags.

---

## 4. Animations & Interactions

To keep the UI engaging, the following keyframe animations are integrated directly into the Tailwind theme:

- `animate-shimmer` (`shimmery`): An infinite background-position slide over 3 seconds, perfect for skeleton loaders or "Live Now" badges.
- `animate-float` (`floaty`): A smooth vertical levitation effect over 6 seconds, heavily used in the landing page graphics and empty states.
- `.animate-borderFill`: A custom utility class that creates an animated, sliding gradient border fill effect upon interaction or mounting.

---

## 5. Development Guidelines

When building new components:
1. **Always use theme tokens**: Rely on `bg-card`, `text-primary`, or `border-white/10` rather than hardcoding hex values.
2. **Prioritize dynamic feedback**: Ensure buttons and cards have hover states (e.g., `hover:scale-[1.02]`, `active:scale-[0.98]`, `hover:bg-white/5`).
3. **Responsive by Default**: Build mobile-first. Use the `sm:`, `md:`, and `lg:` prefixes to adjust layout paddings, font sizes, and grids.
4. **Avoid generic colors**: Stick to the predefined palette to maintain the platform's distinct visual identity.
