---
target: index.html (full wedding invitation site)
total_score: 29
p0_count: 1
p1_count: 2
timestamp: 2026-07-05T20-01-41Z
slug: index-html-full-wedding-invitation-site
---
Method: dual-agent (A: a60e53fc35737e472 · B: a3e881dde45646840)
No live browser/screenshot evidence this run — headless browser tool hit an environment lock issue on this Windows machine after setup; all findings below are from static source review + the deterministic detector, not a rendered page.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No submit-in-progress state; Pix "copy" only swaps a label for 2.2s |
| 2 | Match System / Real World | 4 | Warm, appropriately formal Portuguese copy throughout |
| 3 | User Control and Freedom | 3 | Esc closes modals, RSVP has a reset; no edit/cancel for a submitted mural post |
| 4 | Consistency and Standards | 3 | Very consistent — arguably over-templated (see Anti-Patterns) |
| 5 | Error Prevention | 2 | Gift QR is a fake placeholder SVG; Pix key is an unfilled `sua-chave-pix@email.com` |
| 6 | Recognition Rather Than Recall | 3 | Icons + labels throughout |
| 7 | Flexibility and Efficiency | 3 | Book has arrows/dots/corner-turn; nav has anchor links |
| 8 | Aesthetic and Minimalist Design | 2 | Stars + lanterns + cursor sparks + scroll-thread + confetti all run concurrently |
| 9 | Error Recovery | 3 | Inline field errors, auto-focus to first error |
| 10 | Help and Documentation | 3 | `.book-hint` explains the page-turn interaction |
| **Total** | | **29/40** | **Good — solid foundation, address weak areas** |

## Anti-Patterns Verdict

**LLM assessment:** Moderate AI-slop tells concentrated in specific spots rather than the whole page. The shimmering gradient text on the couple's names (`.gold-text` + `.shimmer-text`, app.css:174-180 & 2733-2742, hero.jsx:111) is a textbook AI-landing-page tell on the single most important text on the page. An identical eyebrow → title → divider-flourish scaffold repeats across all 8 sections — bespoke copy, templated structure. Ambient motion (floating lanterns, cursor-trail sparks, confetti on RSVP and every guestbook post) pushes past PRODUCT.md's own "elegant and formal, whimsy as accent" brief — DESIGN.md's own Don't ("storybook/lantern whimsy shouldn't overwhelm the page") is being violated by the code. Counter-evidence: the storybook page-flip component is genuinely bespoke, non-templated craft — the strongest "a human designed this" signal on the site.

**Deterministic scan:** 104 raw findings from detect.mjs, mostly noise once verified against source:
- design-system-color (66, advisory): ~95% same-palette-family drift (inline hex duplicating --gold-*/--rose instead of var()) or alpha-only white/black — not foreign colors. One real undocumented addition: a green "copied" success state (app.css:2378) not in DESIGN.md.
- design-system-radius (29, advisory): false positive — all flagged radii belong to the storybook's illustrative page/spine shapes and the music equalizer, not generic UI surfaces.
- single-font (1, warning): false positive — the detector only captured the first family= param in a combined Google Fonts URL that actually loads all 3 fonts (Cinzel/Cormorant Garamond/Jost).
- design-system-font (2, warning): false positive — standard system-monospace fallback stack for a polaroid caption.
- gradient-text (1, warning): confirmed, see above.
- bounce-easing (2, warning): split — eq-bounce is a plain ease-in-out scale (false positive, name-triggered); msg-pop's cubic-bezier(.2,1.2,.3,1) genuinely overshoots past 1.0 (confirmed).
- layout-transition (3, warning): confirmed, all real — .scroll-thread animates width, .navbar animates padding, .music-player animates max-width/gap/padding-right.

No visual overlay was possible this run (see limitation above).

## Overall Impression

A genuinely well-crafted single-page invite with one standout bespoke component (the storybook) let down by two things: a non-functional gift-giving flow (fake QR, unfilled Pix key) and too many concurrent ambient-motion systems that work against the site's own stated "elegant, formal, legible for all ages" brief. Neither is hard to fix, and fixing them would let the storybook and parchment-card details — the site's real strengths — read as more special rather than competing with noise.

## What's Working

1. **The storybook flip-book** (storybook.jsx) — physically-plausible page-flip with recto/verso faces, drop-cap first letters, corner ornaments, and a distinct mobile fallback. Real, non-templated craft.
2. **Parchment/night duality for Event Details** — switching to warm parchment + ink-brown specifically for the must-read logistics card makes the most information-dense section visually distinct, directly serving the "legible for older guests" goal.
3. **Reduced-motion handling is unusually thorough** — nearly every custom animation (cursor trail, lanterns, reveal-on-scroll, book leaves, music EQ) independently respects prefers-reduced-motion. Real accessibility diligence, not boilerplate.

## Priority Issues

**[P0] Gift-giving flow doesn't work.** gifts.jsx:6-37 renders a fake, randomly-patterned SVG "QR code" that encodes nothing; data.js:13 ships the literal unfilled placeholder `pixKey: "sua-chave-pix@email.com"`. Any guest who scans it or copies the key and pays sends money nowhere, with no error telling them so.
**Why it matters:** blocks the "optionally give a gift" job entirely, and actively misleads guests into a failed payment with silent failure.
**Fix:** generate a real QR from an actual Pix EMV payload once the real key is set; don't ship this section until then.
**Suggested command:** /impeccable harden

**[P1] Ambient motion overload competes with reading and form-filling.** Floating lanterns (up to 18 concurrent), cursor-trail sparks, star twinkle, and the scroll-progress thread all animate simultaneously and continuously, including behind the story chapters and RSVP form.
**Why it matters:** directly undercuts PRODUCT.md's own principles ("legibility for all ages," "formality over whimsy") — an older relative reading Chapter II or filling the RSVP form is competing with drifting lanterns for attention.
**Fix:** keep the lanterns (strongest brand asset) as the one signature ambient layer; drop or heavily throttle the cursor trail, which carries no communicative purpose.
**Suggested command:** /impeccable quieter

**[P1] Autoplay music can be triggered by any tap, anywhere on the page.** music.jsx:54-69 attaches its autoplay-unlock listener to global pointerdown/keydown, not the music button itself.
**Why it matters:** a guest scrolling on their phone in a quiet room can unintentionally start "I See the Light" playing out loud from an unrelated tap — jarring for a request tied to a church ceremony.
**Fix:** only start playback on an explicit tap of the music control; treat blocked autoplay as "stay paused until the user opts in."
**Suggested command:** /impeccable harden

**[P2] Confetti fires on every guestbook post, not just RSVP.** mural.jsx:45 reuses the RSVP-confirmed confetti burst for every mural message, including simple or heartfelt-but-quiet wishes.
**Why it matters:** tonally mismatched — confetti reads as "task completed!" gamification, not "your message was received."
**Fix:** reserve confetti for the RSVP "yes" case; reuse the softer rising-lantern motif (already built for RSVP success) for mural posts.
**Suggested command:** /impeccable clarify

**[P2] Gradient text on the couple's names.** .gold-text (app.css:174-180) + .shimmer-text applied to hero.jsx:111, the single most important heading on the page.
**Why it matters:** a well-known AI-generated-landing-page tell, on the page's most important text.
**Fix:** swap to a solid --gold-400/--gold-300; the existing glow/text-shadow already carries the "special" feel without the gradient-clip.
**Suggested command:** /impeccable typeset

**[P3] Three CSS transitions animate layout properties instead of transform.** .scroll-thread animates width (app.css:533), .navbar animates padding (app.css:707), .music-player animates max-width/gap/padding-right (app.css:2555) — the last one is the priciest, reflowing continuously over 0.55s.
**Why it matters:** layout thrash and avoidable jank, worse on low-end phones.
**Fix:** switch to transform: scaleX() for the scroll bar; keep navbar/music-player visual changes but drive them with transform/opacity where possible.
**Suggested command:** /impeccable optimize

## Persona Red Flags

**Jordan (confused first-timer):** Interactive lanterns look identical to decorative ones until hover/tap — no visible affordance distinguishes them, so the hidden lantern-message Easter egg is unlikely to be discovered. On desktop, the storybook's turn zones are the bottom corners of each page; .book-hint explains this, but only after Jordan has already scrolled past the book once, so first contact likely involves some fumbling.

**Casey (distracted mobile user):** The very first tap anywhere on the page (a nav link, a scroll) can silently arm/trigger the music autoplay-unlock, so audio can start playing out loud without Casey ever touching a play button. The book's bottom-corner turn zones (~30% width × 42% height) sit close to where a resting thumb naturally lands while reading a dense paragraph, risking accidental page-flips mid-read.

**Riley (stress tester):** Scanning the "QR" with a real banking app fails silently (it's not a real QR); copying the Pix key and pasting it into a banking app will be rejected as invalid (it's a literal placeholder email-shaped string) — with no in-UI error explaining why either failed. Selecting "Sim" with several companions but leaving the companion-names field blank is accepted with no validation, so the couple receives "confirmed with N companions" and zero names to work from.

**Older relative on a tablet, unfamiliar with scrolling sites** (project-specific, from PRODUCT.md's stated audience): beyond the hero's scroll-hint chevron, there's no persistent "you are here" cue besides a thin gold progress bar at the very top edge — easy to miss at lower visual acuity. The storybook's small 8px .book-dots are a touch-target risk for reduced dexterity.

## Minor Observations

- LANTERN_MESSAGES in data.js:18 says "21.11.2026" — contradicts the actual wedding date of 14 de Novembro used everywhere else. A factual error hidden inside an Easter egg, but still wrong.
- details.jsx:17 and :30 stack two separate eyebrow-style labels back-to-back for the same section — redundant framing.
- The free-contribution input loses its focus ring entirely (app.css:2228-2230, outline: none with no replacement), unlike every other form field, which gets the gold focus halo.
- Countdown nav anchor is missing from NAV_ITEMS even though Countdown is its own section between Details and RSVP.
- Countdown headline text ("Faltam poucos dias...") is static regardless of actual time remaining — will read oddly for anyone visiting more than a year out.

## Questions to Consider

- If the cursor trail and confetti were stripped out entirely, would the storybook and parchment card read as more special because they're no longer competing with ambient noise?
- Is the Pix QR/key a known pre-launch TODO, or did it ship? The UI currently presents "point your bank's camera here" with full confidence over something that cannot work — worse than not offering digital gifting at all.
- Given PRODUCT.md names older relatives as a target audience needing clarity over cleverness, has anyone in that age range tried this on a phone yet?
