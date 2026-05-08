# IP Address Tracker — React 19

An interactive IP geolocation tool with a multi-page architecture, real-time theme-aware map, animated 3D topographic landing page, search history with a visual track path, and gradient-slider visual preferences.

This README documents **what** the project does, **how** every feature works under the hood, **why** every architectural decision was made, and every **challenge** encountered during development with its root cause and resolution.

## Table of contents

- [Overview](#overview)
- [Links](#links)
- [Screenshot](#screenshot)
- [How to run](#how-to-run)
- [Features](#features)
- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Design decisions](#design-decisions)
- [My process](#my-process)
- [Challenges and fixes](#challenges-and-fixes)
- [Built with](#built-with)
- [What I learned](#what-i-learned)
- [Reflections](#reflections)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview

This is a React 19 rebuild of the Frontend Mentor IP Address Tracker challenge, expanded into a full multi-page application with a landing page, tracker, saved searches, and about page. The core challenge — geolocate an IP address and show it on a map — is preserved and enhanced.

The design is the result of a deep research pass on hyper-immersive browser UI, spatial design, motion, and neumorphism. Rather than maximalist visual effects, the research synthesis directed me toward **stable layout, short purposeful motion, selective depth cues, and restrained 3D**. Every animation has a job. Every visual flourish is justified.

## Links

- Solution URL: (paste your GitHub repo URL here)
- Live Site URL: (paste your Netlify/Vercel URL here)

## Screenshot

![Design preview for the IP address tracker](./preview.jpg)

## How to run

```bash
npm install
```

Create a `.env` file in the project root:

```
VITE_GEO_API_KEY=your_geo_ipify_key_here
```

Get a free key at https://geo.ipify.org/. The key is read via `import.meta.env.VITE_GEO_API_KEY` and never appears in the source code.

```bash
npm run dev
```

Open `http://localhost:5173`.

## Features

### Landing page
- Animated 3D topographic surface rendered with **Three.js** (WebGL) — two layered wireframe meshes plus slow camera drift
- Bold four-level text hierarchy in front of the animation: eyebrow → headline → lead → supporting text
- **GSAP**-choreographed staggered entrance with proper StrictMode cleanup
- Theme controls accessible from the corner on every screen size
- All animation respects `prefers-reduced-motion`

### Tracker
- Geo.ipify API lookup for any IP address, IPv6 address, or domain name
- LeafletJS interactive map with **theme-aware tile layers**: OpenStreetMap for light, CartoDB Dark Matter for dark
- Real-time tile swapping when the theme slider crosses 50% — map adapts instantly without remount
- **Track Path** toggle: every searched location is connected by a dotted blue polyline
- IP visibility toggle masks the displayed IP with bullet characters for screen-sharing privacy
- React 19 `useTransition` keeps typing urgent while the heavy state swap runs in the background
- React 19 `useOptimistic` echoes the submitted query in the status line during fetch
- AbortController cancels the previous in-flight request when a new search begins
- Info card overlaps the hero/map boundary, always visible above the map on all devices

### Saved Searches
- Every successful search is automatically added to history (persisted to localStorage)
- View, delete individual entries, or clear all
- **Revisit** any saved search to jump directly back to its location on the map

### Theme system — three gradient sliders
- **Theme Mode** slider (0–100) — white → black gradient track. Every color in the app is computed via CSS `color-mix()` weighted by this percentage, producing a smooth, real-time interpolated transition across the entire interface simultaneously
- **Invert Colors** slider (0–100%) applies CSS `filter: invert(X%) hue-rotate(180deg)` to the entire shell
- **Night Mode** slider (0–100%) overlays a warm amber tint to reduce blue light
- All preferences persist to localStorage

### Responsive design
- Mobile-first CSS with breakpoints at 480px, 600px, and 900px
- Info cards: 1 column (mobile) → 2 columns (tablet) → 4 columns with dividers (desktop)
- Hero padding, search form, and map height all scale to viewport
- Theme controls compact on mobile (smaller padding, sliders, labels)
- Landing page CTAs stack to full-width on phones
- `clamp()` used for all fluid typography scaling

### Accessibility
- Semantic HTML5: `main`, `header`, `nav`, `article`, `dl`/`dt`/`dd`, `form`
- 25+ ARIA attributes: `aria-live`, `aria-label`, `aria-pressed`, `aria-current`, `role="search"`
- Keyboard skip link to jump straight to content
- Visible focus rings using the brand-600 token
- Custom 22px slider thumbs sized for accessibility
- `aria-live="polite"` status line announces every search result
- `prefers-reduced-motion` respected in Three.js, GSAP, and CSS

---

## How it works

This section explains the implementation of each major feature — how it's built, what makes it tick, and the specific code patterns involved.

### How the gradient sliders produce smooth theme transitions

The theme mode slider stores a number from 0 to 100 — zero is fully light, 100 is fully dark, and everything in between is a blend. When you move the slider, `useTheme` updates `theme.mode` to whatever value the slider is at. `App.tsx` then writes that number to the document root as a CSS custom property called `--mode`:

```ts
document.documentElement.style.setProperty("--mode", `${theme.mode}%`);
```

Every color in the app is defined using CSS `color-mix()` — a native browser function that blends two colors by a percentage:

```css
--ink-900: color-mix(in srgb, #2b2b2b, #f1f5f9 var(--mode));
```

When `--mode` is 0%, you get pure dark text on a light background. At 100%, pure light text on dark. At 50%, the exact midpoint. The browser computes all 11 color pairs natively — no JavaScript color math, no per-component re-renders for styling. The interpolation is hardware-accelerated.

The inversion slider applies `filter: invert(X%) hue-rotate(180deg)` on the root container. The night mode slider scales the opacity of a fixed warm amber overlay that sits outside the inverted container, so the amber stays warm even when inversion is on.

### How the track path is drawn and toggled

Every time you search an IP address, `useSearchHistory` saves the result — including latitude and longitude — into an array in React state. That array is passed to `MapView` as a `history` prop.

Inside `MapView`, a `useEffect` watches `history` and a boolean `showTrackPath`. When the track path is on and there are saved locations, it takes every coordinate, reverses them into chronological order, and draws a Leaflet `L.polyline` — a dotted blue line connecting every IP location searched, in order:

```ts
L.polyline(points, { color: "#5262c6", weight: 3, opacity: 0.85, dashArray: "8, 10" })
```

The toggle button in the tracker header flips `showTrackPath` via `useState`. When toggled off, the `useEffect` removes the polyline from the map. The button uses `aria-pressed` so screen readers announce the state.

### How dark mode works on the Leaflet map

Leaflet renders maps using tile layers — small image squares loaded from a tile server. Different servers provide different visual styles. This app uses two:

```
Light: https://tile.openstreetmap.org/{z}/{x}/{y}.png         (OpenStreetMap)
Dark:  https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png  (CartoDB Dark Matter)
```

`MapView` receives an `isDark` boolean (derived from `theme.mode > 50`). A `useEffect` watches `isDark` — whenever it changes, it removes the current tile layer and adds the other one. The map itself never remounts; only the tiles swap. Tile layers are stored in a `useRef` so the swap is direct: `map.removeLayer(old)` then `newLayer.addTo(map)`.

Since the theme slider is continuous (0–100), the map tiles flip at the midpoint (50) because raster tile images are inherently binary — there's no in-between for pre-rendered map imagery. Everything else in the app transitions smoothly via `color-mix()`.

### How searches are saved and persisted

`useSearchHistory` manages an array of `HistoryItem` objects in React state. Each entry contains: a unique ID (timestamp + random suffix), the IP address, city, region, latitude, longitude, and timestamp.

Persistence: a `useEffect` serializes the array to JSON and writes it to `localStorage` whenever it changes. On initial load, `useState` reads from `localStorage` with a lazy initializer, so search history survives page refreshes and browser restarts. The array is capped at 50 entries.

The Saved Searches page reads the same array and renders each entry as a neumorphic card. "View" converts a `HistoryItem` back to an `IPData` object and navigates to the tracker with that data pre-loaded. "Delete" removes a single entry by ID. "Clear All" empties the array.

### How the API key is hidden and safe

The API key lives in a `.env` file at the project root. Vite reads environment variables prefixed with `VITE_` and exposes them via `import.meta.env`. In `useIPTracker`, the fetch URL includes:

```ts
apiKey: import.meta.env.VITE_GEO_API_KEY
```

The key never appears in source code. `.gitignore` excludes `.env`, so it's never committed to GitHub. A `.env.example` file shows the variable name without the value, so anyone cloning the repo knows what to set up.

For deployment on Netlify or Vercel, the environment variable is set in the hosting platform's dashboard — injected at build time. The Geo.ipify free tier doesn't support domain restriction, but since no card details are attached, there's no financial risk if the key is extracted from the built bundle.

---

## Architecture

```
ip-tracker-react/
├── index.html                  ← design tokens + utility classes + responsive breakpoints
├── .env                        ← API key (gitignored, never committed)
├── .env.example                ← shows variable name for teammates
├── design/                     ← FM reference designs (for grading)
├── public/images/              ← favicon, icon-arrow.svg, pattern backgrounds
└── src/
    ├── App.tsx                 ← page routing, --mode CSS variable, theme overlays
    ├── main.tsx                ← React 19 entry (createRoot + StrictMode)
    ├── types/index.ts          ← IPData, ThemeState (mode: number 0-100), HistoryItem, Page
    ├── hooks/
    │   ├── useTheme.ts         ← mode (0-100) + inversion + night mode, localStorage
    │   ├── useIPTracker.ts     ← Geo.ipify fetch + AbortController, no loading state
    │   ├── useIPVisibility.ts  ← mask/unmask IP display
    │   └── useSearchHistory.ts ← add/remove/clear, localStorage, max 50 entries
    └── components/
        ├── LandingPage.tsx     ← Three.js bg + GSAP entrance + bold hero text
        ├── TopographicBg.tsx   ← Three.js scene (2 layered meshes, camera drift)
        ├── TrackerPage.tsx     ← search + info cards + map + controls
        ├── MapView.tsx         ← Leaflet + theme tiles (light/dark) + track polyline
        ├── ThemeControls.tsx   ← 3 gradient sliders (mode, inversion, night)
        ├── SavedSearches.tsx   ← saved entries with view/delete/clear
        ├── AboutPage.tsx       ← neumorphic feature cards
        └── Sitemap.tsx         ← bottom navigation on every page
```

### Data flow

```
                       App
                  ┌──────────────────┐
                  │ useTheme         │  → writes --mode to documentElement
                  │ useSearchHistory │  → persists to localStorage
                  └─────┬────────────┘
                        │ props down
       ┌────────────────┼─────────────────┬───────────┐
       ▼                ▼                 ▼           ▼
   LandingPage      TrackerPage      SavedSearches  AboutPage
       │                │
       ▼                ▼
   TopographicBg    MapView, ThemeControls
                        │
                        ▼
                   useIPTracker (own state, no loading — uses isPending)
                   useIPVisibility (own state)
```

App owns the cross-page state (theme, history) and routes via a simple `page` enum. Each page component receives only what it needs as props. No router library — for a four-page app, a state-driven switch is simpler and faster than React Router.

---

## Design decisions

### 1. Color system

The official Frontend Mentor style guide gives only two neutrals: Very Dark Gray `hsl(0, 0%, 17%)` ≈ `#2b2b2b` and Dark Gray `hsl(0, 0%, 59%)` ≈ `#969696`. Against white, `#969696` only hits 2.96:1 — failing both the WCAG 4.5:1 small-text bar and the 3:1 non-text bar. So the official palette is partially broken.

I kept `#2b2b2b` and added accessible derivations: `--ink-700: #535353`, `--ink-600: #767676` (clears 4.5:1), `--ink-500: #949494` (clears 3:1). Brand colors were sampled from the official hero asset: `#4743a0`, `#5262c6`, `#5e83ee`.

Every token is a `color-mix()` between its light and dark endpoints, weighted by `--mode`. Moving the slider produces a continuous gradient transition for all colors simultaneously.

### 2. React 19: useTransition + useOptimistic

Typing must stay urgent. The submitted query should echo immediately. The heavy state swap should not block input. `useTransition` makes the fetch non-blocking; `useOptimistic` shows "Looking up 8.8.8.8…" instantly. AbortController cancels stale in-flight requests.

The `loading` state from `useIPTracker` was dropped entirely because aborted fetches cause flicker (`true → false → true`). `isPending` from `useTransition` is the single source of truth.

### 3. Map flyTo: 0.35 seconds

Research-backed. Bederson and Boltman showed animation improves spatial reconstruction; Shanmugasundaram and Irani showed short animations are as effective as long ones.

### 4. Neumorphism: containers only

NN/g and Axess Lab warn that neumorphism's low contrast makes clickability ambiguous. So containers get neumorphism (panels, cards, theme-controls shell) while controls stay explicit and high-contrast (search input, submit button, focus rings). Shadow tokens use `color-mix()` so they blend smoothly with the mode slider.

### 5. Info card as a DOM sibling, not a child

The info card sits BETWEEN the hero and the map in the DOM — not inside the hero. This avoids CSS stacking context traps where Leaflet's internal panes paint over elements nested inside a sibling. With the info card as its own positioned sibling (`z-index: 50`), it's guaranteed to sit above the map section (`z-index: 1`). Negative margins create the visual overlap effect.

### 6. Night-mode overlay outside the inverted shell

The `.shell` element gets `filter: invert(...)` when inversion > 0. The warm amber overlay is a sibling of `.shell`, not a child, so the amber stays warm even when inversion is active. If it were inside the shell, inversion would flip it to cold blue.

### 7. GSAP cleanup with clearProps

`gsap.from()` sets inline `opacity: 0` on elements. React StrictMode in dev mode fires effects twice. Without clearing those inline styles on cleanup, the second `gsap.from()` reads the killed tween's `opacity: 0` as the "natural" state and animates FROM 0 TO 0. `gsap.set(children, { clearProps: "opacity,y,transform" })` in the cleanup function restores elements to their CSS-defined state.

---

## My process

1. Listed every requirement and grouped them into hooks vs components vs config
2. Built the type definitions first so every prop and state shape was contract-defined before any JSX
3. Implemented the four custom hooks before any UI — pure logic isolation
4. Built the Three.js component as a self-contained module with proper cleanup
5. Composed the four pages last, since they only orchestrate hooks and child components
6. Did a dedicated CSS-extraction pass: moved all repeated inline styles into utility classes in `index.html`
7. Did a code-review pass and fixed three issues (night-overlay stacking, dead Leaflet code, loading-state flicker)
8. Integrated the Frontend Mentor starter assets (pattern backgrounds, favicon, icon-arrow.svg, design references)
9. Ran the project live and identified four runtime issues (see Challenges 1–4 below)
10. Fixed all four — changed theme mode from string to number, rewrote CSS to `color-mix()`, moved info-wrap out of hero, added responsive breakpoints
11. Ran again and found two more issues (see Challenges 5–6 below)
12. Fixed both — GSAP clearProps for StrictMode, responsive hero bar and info-wrap margins
13. Ran `tsc --noEmit` 20 times — clean every time

---

## Challenges and fixes

### Challenge 1: Theme slider snapped instead of producing a smooth gradient

**What was happening:** The mode slider snapped at 50% — the interface flipped instantly from light to dark with no in-between.

**Root cause:** `theme.mode` was typed as `"light" | "dark"` — a string union that cannot represent a continuous spectrum. No CSS transition can interpolate between two discrete string values.

**Resolution:** Changed `theme.mode` to `number` (0–100). Replaced `toggleMode()` with `setMode(v)`. Rewrote every color token in `index.html` to use `color-mix(in srgb, light-value, dark-value var(--mode))`. App.tsx writes the numeric mode to `document.documentElement.style.setProperty("--mode", ...)`. The browser natively interpolates all 11 color pairs in real time.

**Files changed:** `src/types/index.ts`, `src/hooks/useTheme.ts`, `src/App.tsx`, `src/components/ThemeControls.tsx`, `index.html`

### Challenge 2: Info card hidden behind the Leaflet map

**What was happening:** The info card was supposed to overlap the hero/map boundary. Instead, the map painted directly on top of it.

**Root cause:** The info card was inside the hero's stacking context. Even with high z-index numbers inside the hero, Leaflet's internal panes in the map section created a separate stacking context that painted over the hero's contents. Sibling stacking contexts compare at the parent level, and z-index numbers inside one context are invisible to the other.

**Resolution — first attempt:** Added `isolation: isolate` and explicit z-index ordering on `.hero` and `.map-section`. This was theoretically correct but still failed in practice because Leaflet's DOM manipulations created additional stacking contexts that escaped the intended hierarchy.

**Resolution — final fix:** Moved `.info-wrap` **out of** the hero entirely. It's now a sibling element between the hero and the map in the DOM, with `position: relative; z-index: 50`. Since all three (hero z:5, info-wrap z:50, map-section z:1) are siblings in the same `.tracker` parent, z-index comparison is straightforward and cannot be trapped. Negative margins (`margin-top: -3.5rem; margin-bottom: -2rem`) create the visual overlap effect.

**Files changed:** `src/components/TrackerPage.tsx`, `index.html`

### Challenge 3: Site was not responsive

**What was happening:** The app looked fine at desktop but broke on mobile — info cards stayed 4-column, text overflowed, padding was too large, buttons didn't stack.

**Root cause:** During the CSS consolidation pass, the responsive breakpoints from the original vanilla JS version were not carried over.

**Resolution:** Added 16 media queries across four breakpoints (480px, 600px, 900px, reduced-motion). Info cards go from 1 column (mobile) → 2 columns (tablet) → 4 columns with dividers (desktop). Hero padding, search form, map height, about grid, landing page controls, and CTA buttons all scale to viewport. `clamp()` used for all fluid typography.

**Files changed:** `index.html`

### Challenge 4: Landing page lacked bold text in front of the animation

**What was happening:** The 3D topographic animation filled the background but the text was too thin to read clearly against it.

**Root cause:** Text used default font weights (400–500) and the background opacity was 0.7, creating visual competition.

**Resolution:** Added four-level hierarchy with bold weights: eyebrow (700, uppercase, brand color) → headline (700, clamp 2.5–7rem) → lead sentence (700, 1.05–1.5rem) → supporting text (400, lighter). Reduced topographic background opacity to 0.55. Set `.topo-bg` to `z-index: -1` and `.landing` to `isolation: isolate` so the background is unambiguously behind all content.

**Files changed:** `src/components/LandingPage.tsx`, `index.html`

### Challenge 5: Landing page text disappeared after page load

**What was happening:** Text appeared for a split second on refresh, then vanished completely.

**Root cause:** GSAP + React StrictMode interaction. `gsap.from(children, { opacity: 0 })` sets inline `opacity: 0` on elements. In dev mode, React fires every `useEffect` twice: mount → cleanup → mount. The old cleanup did `tween.kill()` which stops the animation but leaves `opacity: 0` stuck as an inline style. The second `gsap.from()` reads that stuck inline opacity as the "natural" destination and animates FROM 0 TO 0. Text stays invisible forever.

**Resolution:** Added `gsap.set(children, { clearProps: "opacity,y,transform" })` in the cleanup function. This removes GSAP's inline styles, restoring elements to their CSS-defined state. The second mount's `gsap.from()` now reads the real CSS opacity (1) as the target.

**Files changed:** `src/components/LandingPage.tsx`

### Challenge 6: Hero controls and info card didn't scale to mobile

**What was happening:** The theme controls (3 sliders with labels) took ~200px of vertical space on a 375px phone, pushing the title and search off-screen. The info card overlap was calibrated for desktop only.

**Root cause:** No mobile-specific overrides for the hero bar or theme card. Info-wrap margins were static values that worked for desktop's short 4-column card but not mobile's tall single-column card.

**Resolution:** Added `@media (max-width: 599px)` override that shrinks theme card padding (0.55rem), label font size (0.65rem), and slider height (6px). Made info-wrap margins responsive: -3.5rem/−2rem mobile → -4rem/−3rem tablet → -4.5rem/−3.5rem desktop. Reduced hero bottom padding on mobile from 7rem to 5.5rem. Added `#root { min-height: 100vh; display: flex; flex-direction: column }` so the tracker fills the viewport. Made map section min-height 300px on mobile (was 400px).

**Files changed:** `index.html`, `src/components/SavedSearches.tsx`

---

## Built with

- **React 19** with `useTransition`, `useOptimistic`, `useRef`, `useState`, `useEffect`, `useCallback`
- **TypeScript** with strict mode and `verbatimModuleSyntax`
- **Vite 6** for dev server and build
- **Three.js** (CDN, r128) for the WebGL topographic surface
- **GSAP** (CDN, 3.12) for the landing entrance choreography
- **LeafletJS** (CDN, 1.9.4) for the interactive map
- **OpenStreetMap** (light tiles) and **CartoDB Dark Matter** (dark tiles)
- **CSS `color-mix()`** for smooth theme interpolation (Chrome 111+, Firefox 113+, Safari 16.2+)
- **Geo.ipify** API for IP geolocation
- **localStorage** for persistence (theme + search history)

## What I learned

- **CSS `color-mix()` is the right tool for smooth theme interpolation.** Switching from a binary `data-theme="dark"` attribute to `color-mix(in srgb, light, dark var(--mode))` with a 0–100% variable means the browser natively interpolates every color whenever the slider moves. No JavaScript color math, no per-component re-renders.
- **CSS stacking contexts are the #1 source of "element hidden behind another" bugs.** The info card was behind the map not because z-index was wrong, but because nested stacking contexts isolate z-index comparisons. The fix was structural: move the info card to be a sibling, not a child.
- **GSAP `from()` + React StrictMode requires `clearProps` on cleanup.** Without it, killed tweens leave inline `opacity: 0` that poisons subsequent animations.
- **Three.js cleanup is non-negotiable.** Without canceling `requestAnimationFrame` and disposing the renderer/geometry/material on unmount, page navigation leaks GPU memory.
- **Leaflet tile layers can be swapped at runtime** without remounting the map — `removeLayer` then `addTo`.
- **AbortController prevents stale data** from older fetches overwriting newer results.
- **A `loading` boolean flickers when fetches abort.** `useTransition`'s `isPending` is the single source of truth.
- **Responsive design is not optional.** Every media query that existed in the original vanilla JS version needed to be carried over — and then some, because the React version has more UI elements (theme controls, track path toggle).

## Reflections

This project grew from a single-page challenge into a four-page React application with persistent state, real-time theme switching, 3D graphics, search history with track path visualization, and three independent display preference sliders.

The six runtime challenges taught me more than the initial build did. The stacking-context bug was invisible in the code — the z-index numbers were high enough, the structure looked correct. But CSS stacking contexts don't compare numbers across sibling contexts; they compare within them. Moving the info card from a child to a sibling was the structural fix that made z-index numbers actually mean something. Similarly, the theme slider snap was a type-system problem disguised as a visual problem: you can't interpolate between `"light"` and `"dark"` no matter how clever your CSS is. Changing the data type from a string union to a number unlocked `color-mix()` and made the smooth gradient trivially easy. And the GSAP + StrictMode bug was a reminder that cleanup functions in React aren't just about preventing memory leaks — they're about restoring DOM state so subsequent effects start from a clean baseline.

The most valuable lesson was learning to be ruthless about deleting code. I extracted ~600 lines of styling into CSS classes. I dropped a `loading` state because it caused flicker. I dropped 250 particles from the Three.js scene because they were ornament without function. Every animation needs a job description, and anything without one should be cut.

If I had more time I would add unit tests for the hooks, integration tests for the page transitions, and a service worker for offline caching.

## Author

- Kwadwo Danso
- GitHub: [KwadwoDanso](https://github.com/KwadwoDanso/IP-address-tracker-react)
- Frontend Mentor: [@KwadwoDanso](https://www.frontendmentor.io/profile/KwadwoDanso)

## Acknowledgments

- [Frontend Mentor](https://www.frontendmentor.io/challenges/ip-address-tracker-I8-0yYAH0) for the original challenge
- [Geo.ipify](https://geo.ipify.org/) for the IP geolocation API
- [LeafletJS](https://leafletjs.com/) for the map library
- Utilize AI to learn the new libraries and implementing it
- [OpenStreetMap](https://www.openstreetmap.org/) and [CartoDB](https://carto.com/) for tile imagery
- [Three.js](https://threejs.org/) for the WebGL 3D library
- [GSAP](https://gsap.com/) for the animation library
- Bederson & Boltman — "Does Animation Help Users Build Mental Maps of Spatial Information?"
- Scarr et al. — "Improving Command Selection with CommandMaps"
- Nielsen Norman Group and Axess Lab for the cautionary neumorphism literature
- [Elegant Themes](https://www.elegantthemes.com/blog/design/design-principles-behind-high-converting-landing-pages) for landing page design principles
- [React Documentation](https://react.dev) — `useTransition` and `useOptimistic` reference
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) — `color-mix()` documentation
- Per Scholas course materials covering React hooks, custom hooks, useEffect patterns, forms, accessibility, and component composition