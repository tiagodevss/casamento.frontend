---
target: index.html (full wedding invitation site)
total_score: 25
p0_count: 1
p1_count: 2
timestamp: 2026-07-05T22-40-59Z
slug: index-html-full-wedding-invitation-site
---
Method: dual-agent (A: a5cec6e08c6a8b6fd · B: a6b1e537435b9d1c9)
No live browser/screenshot evidence this run — the headless browser tool hit the same known daemon-lock issue on this Windows machine ("Another instance is starting the server... Timed out waiting"). All findings below are from static source review (Assessment A) plus the deterministic detector (Assessment B), not a rendered page.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good loading copy throughout RSVP/gifts; no ongoing "aguardando pagamento" indicator while the Pix polling loop runs silently (gifts.jsx:47-64) |
| 2 | Match System / Real World | 3 | Warm, natural Portuguese copy matched to the real courtship story; undercut by a factual date contradiction in the lantern easter egg |
| 3 | User Control and Freedom | 3 | Esc/backdrop-click closes modals; RSVP has a "trocar"/reset path; no way to edit an already-submitted RSVP without redoing the search |
| 4 | Consistency and Standards | 3 | Design tokens followed faithfully everywhere — arguably over-consistent (see Anti-Patterns) |
| 5 | Error Prevention | 3 | Companion count clamped; custom gift amount regex-filtered; no double-submit guard on the guestbook form |
| 6 | Recognition Rather Than Recall | 2 | Navbar has no active/current-section highlighting while scrolling — only a binary "scrolled" state |
| 7 | Flexibility and Efficiency | 3 | Lightbox keyboard arrows/Escape; no other accelerators (acceptable for a mostly single-visit site) |
| 8 | Aesthetic and Minimalist Design | 2 | Lanterns + cursor trail + confetti + scroll-thread + shimmer text all run concurrently from first paint, on top of an already-rich storybook |
| 9 | Error Recovery | 2 | Gift payment error has no retry action (dead end); RSVP submit failure is mis-attached to the "attending" field's error slot |
| 10 | Help and Documentation | 1 | No phone/WhatsApp contact anywhere; a failed guest-name search has zero human fallback |
| **Total** | | **25/40** | **Acceptable — significant improvements needed before users are happy** |

## Anti-Patterns Verdict

**LLM assessment:** Real tension between one bespoke centerpiece and six mechanically-identical sections. Every content section (`StorySection`, `GallerySection`, `EventDetails`, `Countdown`, `RSVPForm`, `GiftSection`, `GuestMessages`) uses the exact same four-part `.section-head` scaffold — eyebrow → title → capped-width description → three-span divider-flourish — copy-pasted down to class names and stagger-delay conventions. The hero also carries `gold-text shimmer-text` gradient-clip text on the couple's names (hero.jsx:111) — a textbook AI-landing-page tell, unchanged since the last critique. Layered on top: five concurrent ambient systems (floating lanterns, scroll-thread, cursor-trail, confetti, twinkling stars) mount globally at first paint (App.jsx:16-20), which is the project's own DESIGN.md "Don't" ("storybook/lantern whimsy shouldn't overwhelm the page") being violated by the code, not an external standard. Counter-evidence, same as last run: the `.book` storybook component (storybook.jsx) is genuinely bespoke, non-templated craft — the strongest "a human designed this" signal on the site, directly embodying the "chapters" copy conceit.

**Deterministic scan:** exit code 2, 8 findings total, all `advisory` severity (down from 104 raw / same overall shape last run):
- `design-system-color` (6): all in `src/effects.jsx:423,437` — a tight amber/gold cluster (`#f3982f` → `#fff4cf`, `#ffe08a`). Reads as a programmatic gradient/sparkle-effect ramp rather than ad hoc drift; likely a false positive worth a quick DESIGN.md-token pass rather than a real fix.
- `design-system-radius` (2): `src/storybook.jsx:176` — `2px`/`8px` on the same line. Consistent with last run's finding that storybook-illustrative shapes get flagged; likely false positive (book spine/page shape, not a generic UI surface).

No visual overlay was possible this run (browser tool hit the same daemon lock as last time).

## Overall Impression

Real, measurable progress since the last critique: the P0 fake-QR/placeholder-Pix-key gift flow is **fixed** — `gifts.jsx` now calls a real backend (`api.createPaymentOrder`, `api.getPaymentStatus`) instead of rendering a random SVG. But a new, comparably serious problem has surfaced in its place: the guestbook (`mural.jsx`) has **no `api` import at all** — messages only ever live in local React state, so the site's closing emotional beat (confetti, visible post, "your message was received") is currently fake in exactly the way the gift flow used to be. The ambient-motion-overload issue flagged last time is unchanged. The storybook and parchment details remain the real strengths, still competing against the same ornamental noise.

## What's Working

1. **The storybook flip-book** (storybook.jsx) — bespoke page-turn interaction with recto/verso leaves, corner ornaments, and distinct desktop/mobile variants. Still the standout, non-templated component on the site.
2. **RSVP state design** (rsvp.jsx) — progressive disclosure (search → form → conditional fields → success), tailored success copy for "sim"/"não," and a proper reset path. Thoughtful state modeling, not a toast-and-done flow.
3. **The gift flow is now real.** Since the last critique, `GiftModal` was wired to an actual backend payment order + polling loop instead of a fake placeholder QR — a genuine fix of the previous run's top-priority issue.

## Priority Issues

**[P0] Guestbook messages are never persisted.** `mural.jsx` has no `api` import; `add()` only pushes into local React state. A guest's message triggers confetti and visibly appears on the wall, giving every signal of success, but it vanishes on refresh and the couple never sees it.
**Why it matters:** this is the site's designed closing emotional beat, and it currently lies to every guest who uses it — the same class of bug as the gift flow had last run, just moved to a new section.
**Fix:** wire `add()`/message loading to `api.postMessage` / `api.listMessages`, mirroring the pattern already proven in `rsvp.jsx` and `gifts.jsx`.
**Suggested command:** /impeccable harden

**[P1] Concurrent ambient animation stack still contradicts the stated brief.** `FloatingLanterns` + `ScrollThread` + `CursorTrail` + `Confetti` + twinkling stars + shimmer hero text all run simultaneously from first paint (App.jsx:16-20). PRODUCT.md states "formality over whimsy when the two pull in different directions"; DESIGN.md's own Don't list names this exact failure mode. Unchanged since the last critique.
**Why it matters:** an older relative reading the story chapters or filling the RSVP form is competing with drifting lanterns, a cursor trail, and a twinkling starfield for attention, on a page whose own brief calls for restraint.
**Fix:** keep lanterns as the one signature ambient layer; drop or throttle the cursor trail (desktop-only novelty with no functional payoff); reserve confetti for actual completion moments.
**Suggested command:** /impeccable quieter

**[P1] Gift payment errors have no recovery path.** If `api.createPaymentOrder` fails, `GiftModal` renders a static red error message with no retry action (gifts.jsx:110-112) — the guest's only option is to close and reopen the modal.
**Why it matters:** a transient network hiccup turns into a dead end for someone trying to give a gift, right after the flow was otherwise fixed to work for real.
**Fix:** add a "tentar novamente" button that re-invokes `createOrder()`.
**Suggested command:** /impeccable harden

**[P2] No help/contact path anywhere on the site.** No phone number, WhatsApp link, or "dúvidas?" affordance exists. A guest whose RSVP name search fails (rsvp.jsx:31, "Não encontramos seu convite") has no way to reach a human.
**Why it matters:** a real gap for an audience PRODUCT.md itself describes as skewing toward older relatives who may not match the exact name format the couple registered them under.
**Fix:** add a small contact line (phone/WhatsApp) near the RSVP and guestbook sections.
**Suggested command:** /impeccable harden

**[P2] Countdown has no post-wedding state.** Once Nov 14, 2026 passes, `Countdown` will show `00:00:00:00` with "Hoje é o nosso dia!" indefinitely (details.jsx:92-151), which will read oddly for anyone visiting the site months later.
**Why it matters:** the site will likely stay live after the wedding as a keepsake; a stuck countdown undercuts that.
**Fix:** add a past-tense closing state ("Foi um dia inesquecível…").
**Suggested command:** /impeccable clarify

**[P3] Lantern easter-egg date contradicts the real wedding date.** `data.js:17` reads "21.11.2026 — o dia do nosso sim," while every other date on the site (`dateISO`, hero, details, countdown) is 2026-11-14.
**Why it matters:** small, low-visibility (only surfaces if a guest clicks an interactive lantern), but it's a factual error on a wedding invitation.
**Fix:** correct the string in `LANTERN_MESSAGES`.
**Suggested command:** /impeccable clarify

## Persona Red Flags

**"Vovó Norma" (project-specific — older relative on a tablet, per PRODUCT.md's stated audience):** Her primary action is finding the date/time/address, then RSVPing. The mobile nav toggle is icon-only with only an `aria-label`, no visible "Menu" text, so a hamburger icon isn't a guaranteed affordance for a less tech-fluent visitor. If her name search comes back empty (a real risk if the couple registered her under a family group name rather than her own), she hits a dead end with zero fallback — no phone number, no "tente o sobrenome da família" hint — for exactly the persona this site is built around.

**Riley (stress tester):** The guestbook now fails silently and completely — post a message, see confetti and the post appear, refresh, and it's gone with no error, no warning, nothing. Selecting "Sim" with companions but leaving the companion-names field blank still appears to be accepted (unchanged from last run) — the couple would receive "confirmed with N companions" and zero names.

**Casey (distracted mobile user):** `MusicPlayer` attempts autoplay-with-fade-in on load; if the browser permits it, ambient audio can start unannounced in a quiet setting, with only a small floating player as the mute control — a plausible embarrassment moment on a phone in public.

## Minor Observations

- Custom gift amount parsing only replaces the *first* comma (gifts.jsx), so Brazilian thousands-formatted input like "1.234,56" will parse wrong.
- Footer credit line uses `new Date().getFullYear()` — will silently drift if the site stays live for years as a keepsake.
- The playlist's "I See the Light" (a Tangled reference) reinforces the fairy-tale register PRODUCT.md explicitly wants kept secondary to formality — worth a tone check alongside the ambient-motion note above.
- Navbar has no active-section highlight while scrolling a single long page — a small orientation gap (Heuristic 6).

## Questions to Consider

- The guestbook and the gift flow had the identical class of bug (a beautiful, convincing UI wrapped around nothing real) at different points in time — is there a reason writes-to-backend keep shipping last, or would it help to treat "does this actually save?" as a checklist item before any new section ships?
- Given PRODUCT.md's own "formality over whimsy" principle, would the storybook and parchment details read as more special if the five concurrent ambient systems were reduced to one signature layer?
- Is there a plan for what this site should look/feel like after November 14, 2026, once it becomes a keepsake rather than an invitation?
