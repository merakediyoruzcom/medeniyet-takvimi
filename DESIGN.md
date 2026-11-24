---
name: "Medeniyet Takvimi Design System"
version: "2.0"
direction: "Ottoman-Anatolian Observatory & Swiss Editorial Almanac — brass astronomical instrumentation and warm ahar-parchment precision on a 12-column grid."
colors:
  dark:
    bg: "#111317"
    surface: "#181B22"
    surface-raised: "#222630"
    border: "#2E3340"
    ink: "#ECE7DC"
    muted: "#A69E8E"
    accent: "#D9A441"
    accent-contrast: "#111317"
    success: "#4ADE9F"
    danger: "#F28482"
  light:
    bg: "#F6F1E7"
    surface: "#EDE5D5"
    surface-raised: "#FAF7F0"
    border: "#D5C9B2"
    ink: "#191C24"
    muted: "#5A554A"
    accent: "#7C5205"
    accent-contrast: "#FAF7F0"
    success: "#156F4B"
    danger: "#A62B2B"
typography:
  display: { fontFamily: "Cormorant Garamond", weights: [500, 600, 700], tracking: "-0.02em" }
  body:    { fontFamily: "Albert Sans", weights: [400, 500, 600], size: "16px", lineHeight: 1.6 }
  mono:    { fontFamily: "JetBrains Mono", fontVariantNumeric: "tabular-nums" }
spacing: [4, 8, 12, 16, 24, 32, 48, 64, 96]
rounded: { sm: "4px", md: "8px", lg: "14px", full: "9999px" }
motion:  { fast: "140ms", base: "240ms", ease: "cubic-bezier(0.25, 1, 0.5, 1)" }
---

## Overview

Medeniyet Takvimi is an astronomical 13-month fixed calendar almanac anchored to the Winter Solstice (21 December) and the 3200 BCE invention of writing. Its interface pairs Swiss editorial layout rigor with Ottoman observatory instrumentation (brass astrolabe geometry, double-hairline archival borders, warm ahar-parchment and obsidian ink).

## Colors

- **Single Accent (Observatory Brass / Antique Ochre):** `#D9A441` on dark (`7.66–8.27:1`), `#7C5205` on light (`5.47–6.0:1`). Used for active indicators, primary actions, focus rings, and monumental year numbers.
- **Scheme Handling:** Automatic system preference via `color-scheme: light dark` + `light-dark()` with explicit `@media (prefers-color-scheme: dark)` fallback and a 3-state settings popover override (`system`, `light`, `dark`).
- **7 Cycle Mineral Hues:** Always paired with text labels (`Kızıl`, `Turuncu`, `Sarı`, `Yeşil`, `Mavi`, `Çivit`, `Mor`) — never used alone to encode state.

## Typography

- **Cormorant Garamond** for monumental numerals, headlines, and the Civilization Registry Certificate.
- **Albert Sans** for UI controls, body prose, and tabular ledger text (`lang="tr"` enforced so uppercase transforms map `i` → `İ`).
- **JetBrains Mono** with `tabular-nums` for calendar day numbers, solstice offsets, and coordinates.

## Do

- Group content with 1px hairlines and generous editorial whitespace rather than nested rounded cards.
- Render lunar phases as crisp geometric `<MoonDisc>` SVGs.
- Use native HTML `<dialog>`, `popover`, and `document.startViewTransition()` with reduced-motion guards.

## Don't

- No purple/indigo-blue AI gradients, no gradient text on headlines, no blurred neon blobs.
- No emoji UI bullets or sparkle (`✨`) icons as brand identity.
- No raw hex literals inside React UI components — use semantic tokens (`bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `text-accent`, `border-hairline`).
