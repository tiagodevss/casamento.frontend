---
name: Céu de Lanternas — Tiago & Gabriela
description: A night-sky wedding invitation lit by candle-gold, told as a storybook.
colors:
  night-950: "#05071a"
  night-900: "#080b22"
  night-850: "#0b0f2b"
  night-800: "#101537"
  night-700: "#171d4a"
  purple-900: "#1a1340"
  purple-700: "#2c2065"
  purple-500: "#4a3a8e"
  lilac: "#c4b3ec"
  lilac-soft: "#ddd2f4"
  gold-200: "#f6e3b4"
  gold-300: "#f0d49a"
  gold-400: "#e6c178"
  gold-500: "#d8a94a"
  gold-600: "#bd8a33"
  candle: "#ffcf86"
  rose: "#d49a9b"
  rose-soft: "#e8c2c2"
  cream: "#f6ecd3"
  cream-200: "#eaddbb"
  parchment: "#f3e6c4"
  parchment-dark: "#e4d1a3"
  ink: "#2a2140"
  ink-soft: "#5b5070"
  text-light: "#f4ecd8"
  text-dim: "#b9b0d4"
typography:
  display:
    fontFamily: "Cinzel, 'Times New Roman', serif"
    fontSize: "clamp(3rem, 11vw, 8rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "0.02em"
  script:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.3rem, 3.2vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  headline:
    fontFamily: "Cinzel, 'Times New Roman', serif"
    fontSize: "clamp(2rem, 5vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "0.04em"
  body:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "Jost, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.42em"
rounded:
  pill: "999px"
  lg: "22px"
  md: "14px"
  sm: "12px"
  xs: "6px"
spacing:
  xs: "0.5rem"
  sm: "0.85rem"
  md: "1.25rem"
  lg: "2.5rem"
  xl: "clamp(5rem, 11vw, 9rem)"
components:
  button-primary:
    backgroundColor: "{colors.gold-500}"
    textColor: "#2a1c06"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.9rem"
  button-primary-hover:
    backgroundColor: "{colors.gold-400}"
    textColor: "#2a1c06"
  button-ghost:
    backgroundColor: "rgba(255,255,255,0.04)"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.9rem"
  button-ghost-hover:
    textColor: "{colors.gold-200}"
  card-glass:
    backgroundColor: "{colors.night-900}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.lg}"
  input-field:
    backgroundColor: "{colors.night-900}"
    textColor: "{colors.cream}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 1rem"
---

# Design System: Céu de Lanternas (Sky of Lanterns)

## 1. Overview

**Creative North Star: "A storybook told under a starlit sky, lit by candle-gold."**

The site is one continuous night scene: a deep starfield backdrop sits behind every section, and candle-gold light — from lanterns, glow effects, and gold gradients — is the one warm element that cuts through the dark. The couple's story is literally told as a page-turning storybook component (`.book`), reinforcing the "chapters" framing already present in the copy (Capítulo I–IV). Per PRODUCT.md, this reads as **elegant and formal first**, with the lantern/storybook motifs as a romantic accent thread rather than the dominant register — whimsy supports the occasion, it doesn't override its formality.

What this system explicitly rejects: casual/playful UI chrome, bright saturated "app" colors, flat daylight backgrounds. There are no stated anti-references beyond that; the system already commits fully to its own aesthetic.

**Key Characteristics:**
- Deep night-sky base (near-black navy/purple) with a twinkling star field, never flat black
- Candle-gold as the singular accent, carried through glows, gradients, and borders
- Cinzel (display) + Cormorant Garamond italic (script accent) + Jost (body) — a formal serif/serif/humanist-sans trio
- Pill-shaped buttons and soft-radius glass cards; nothing sharp-cornered
- Glow-based elevation (`--glow-gold`) instead of hard shadows for emphasis

## 2. Colors

A near-black night palette with lilac undertones, warmed by a single candle-gold accent and a cream/parchment neutral for text and the storybook pages.

### Primary
- **Candle Gold** (`gold-500` #d8a94a, glow `candle` #ffcf86): the one accent that means "action" or "warmth" — primary buttons, CTA nav links, glows, focus rings, hero name shadow. Used sparingly against the dark backdrop so it reads as light, not decoration.

### Secondary
- **Deep Lilac** (`purple-500` #4a3a8e / `lilac` #c4b3ec): the night sky's own undertone — radial gradients behind the hero, form labels, secondary text accents. Never competes with gold as the "important" color.

### Tertiary
- **Old Rose** (`rose` #d49a9b): reserved for negative/alternate states only — the "não vou" RSVP choice, form error borders. Never used decoratively.

### Neutral
- **Night** (`night-950` #05071a → `night-700` #171d4a): the page background ramp; darkest at the very top/bottom, lightening slightly mid-scroll for depth.
- **Cream** (#f6ecd3) / **Text Light** (#f4ecd8): primary text color on the night background.
- **Parchment** (#f3e6c4) / **Ink** (#2a2140): the storybook component flips this relationship — dark ink text on parchment-light pages, mirroring a physical book.
- **Text Dim** (`text-dim` #b9b0d4): secondary/supporting copy (descriptions, meta text) on the night background.

### Named Rules
**The Single Accent Rule.** Gold is the only color that means "light" or "action." If a new element needs emphasis, reach for gold-400/500 and a glow, not a new hue.

## 3. Typography

**Display Font:** Cinzel (with 'Times New Roman', serif fallback)
**Script Font:** Cormorant Garamond, italic (with Georgia, serif fallback)
**Body Font:** Jost (with system-ui, sans-serif fallback)

**Character:** A formal serif for structure (Cinzel's evenly-weighted capitals read as ceremonial/engraved), an italic serif for intimate asides (the "&" in the couple's names, quotes), and a light geometric sans for everything functional. The pairing is deliberately formal — Cinzel does the heavy lifting for "this is a wedding," not whimsical script.

### Hierarchy
- **Display** (600, `clamp(3rem, 11vw, 8rem)`, line-height 0.98): the couple's names in the hero only. The "&" swaps to script-italic at 0.42em, gold-300.
- **Headline** (600, `clamp(2rem, 5vw, 3.6rem)`, line-height 1.08): section titles (`.section-title`), always in Cinzel with a soft gold text-shadow.
- **Script accent** (400 italic, `clamp(1.3rem, 3.2vw, 2rem)`): hero subtitle and quote-like asides in Cormorant Garamond italic, lilac-soft or gold-300.
- **Body** (400, 1rem, line-height 1.7, max ~50–65ch): Jost for descriptions, form copy, gift/story text.
- **Label** (500, 0.72rem, letter-spacing 0.42em, uppercase): the `.eyebrow` treatment above section titles, gold-400.

### Named Rules
**The Ceremonial Caps Rule.** Cinzel is reserved for names, section titles, and the storybook chapter titles — never for body copy or UI labels. Its weight is what signals "formal occasion."

## 4. Elevation

The system is glow-based, not shadow-based: instead of neutral drop shadows implying elevation, most raised elements use `--glow-gold` (a soft gold-tinted blur) or `--shadow-card`/`--shadow-deep` (very soft, very dark, large-radius shadows that read as depth in the night scene rather than a hard lift). Glass surfaces (`.glass`) additionally use `backdrop-filter: blur(14px)` so cards feel like frosted panels floating over the starfield, not opaque cards stacked on it.

### Shadow Vocabulary
- **Glow Gold** (`0 0 30px rgba(230,193,120,0.45)`): default emphasis glow — focus rings, badges, active dots, lantern rims.
- **Glow Gold Strong** (`0 0 60px rgba(255,207,134,0.6)`): hero-level emphasis (names, primary lantern).
- **Shadow Card** (`0 24px 60px -24px rgba(5,7,26,0.85)`): standard card lift against the night backdrop.
- **Shadow Deep** (`0 30px 80px -30px rgba(0,0,0,0.8)`): heaviest lift, used for the storybook and modal.

### Named Rules
**The Glow-Not-Shadow Rule.** Emphasis reads as light (gold glow), not as a gray drop shadow. A component "floating" over the night sky should look lit from within, not lifted with a generic box-shadow.

## 5. Components

### Buttons
- **Shape:** fully pill-shaped (`border-radius: 999px`).
- **Primary (`.btn-gold`):** gold gradient background (gold-300 → gold-500 → gold-600), dark ink text (#2a1c06), soft gold drop shadow, plus a diagonal light-sweep on hover (`::after` shimmer).
- **Ghost (`.btn-ghost`):** near-transparent frosted background, cream text, glass border; hover adds gold border + `--glow-gold` + gold-200 text.
- **Hover / Focus:** all buttons lift `translateY(-3px)` on hover with a `cubic-bezier(.2,.8,.2,1)` ease; `:active` scales to 0.97.

### Cards / Containers
- **Corner Style:** 22px radius for glass cards (`.glass`), 14px for gift cards, 12–16px for smaller surfaces.
- **Background:** `.glass` uses `--glass-bg` (rgba night, 55% opacity) with `backdrop-filter: blur(14px)`; gift cards use near-transparent white (2–4.5% opacity) over the night backdrop.
- **Shadow Strategy:** `--shadow-card` by default; gift cards add a subtle border-color/background shift on hover instead of a shadow change.
- **Border:** 1px, `--glass-border` (gold-tinted translucent) on glass; gold-tinted translucent borders (14–42% opacity) on gift cards.

### Inputs / Fields
- **Style:** dark translucent background (`rgba(8,11,34,0.5)`), 1px lilac-translucent border, 12px radius, cream text.
- **Focus:** border shifts to gold-400 plus a 3px gold halo ring + `--glow-gold`.
- **Error:** border shifts to rose, halo ring becomes rose-tinted; error message renders in rose-soft.
- **Choice/radio cards (`.choice`):** custom pill-radio pattern — "yes" selection glows gold, "no" selection tints rose; native radio hidden, custom ring rendered via `::after`.

### Navigation
- **Style:** fixed transparent navbar that gains a frosted dark background + gold-tinted bottom border once scrolled (`.navbar.scrolled`). Brand mark in Cinzel with a gold ampersand. Nav links are dimmed (`text-dim`) at rest, gold-200 on hover; the CTA link gets the same gold gradient pill as `.btn-gold`. Mobile menu is a full-screen frosted overlay with large Cinzel links.

### Storybook (Signature Component)
The couple's story is rendered as a physical open book (`.book`, `.book-face`, `.page-inner`) with left/right leaves, corner ornaments, a page-turn interaction, and a dot-based progress control (`.book-dots`) — the site's most distinctive component and the clearest expression of the "storybook" north star. On mobile it collapses to a stacked single-page variant (`.book-mobile` / `.mpage`).

## 6. Do's and Don'ts

### Do:
- **Do** keep gold (`gold-400`/`gold-500`) as the only "active/important" color — buttons, focus states, glows, badges.
- **Do** use glow-based emphasis (`--glow-gold`, `--shadow-card`) rather than plain gray drop shadows; everything should feel lit from the night, not stacked on paper.
- **Do** reserve Cinzel for names, section titles, and chapter titles; keep Jost for all functional/body text so the formality reads through structure, not decoration everywhere.
- **Do** default to pill-shaped buttons and soft-radius (12–22px) cards; nothing in this system is sharp-cornered.
- **Do** treat the storybook motif and lantern imagery as an accent layer over an otherwise elegant, formal composition — per PRODUCT.md, formality wins when whimsy and formality pull in different directions.

### Don't:
- **Don't** introduce a second accent hue competing with gold; rose is reserved strictly for negative/error states, not decoration.
- **Don't** flatten the background to solid black or plain white; the night gradient + star field is load-bearing for the whole system's mood.
- **Don't** use sharp 0px corners or hard gray box-shadows; both break the "glow, not shadow" and "nothing sharp" rules.
- **Don't** set body copy in Cinzel or the script italic; both are accent/display faces only.
- **Don't** let the storybook/lantern whimsy overwhelm the page — this is a formal church wedding, not a children's fairy tale site.
