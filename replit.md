# The Maker's Mark

Sarvesh Bijawe's portfolio as a scroll-based story: the visitor crosses an unfinished valley, a buried kingdom, a future civilization and an ordinary maker's room that each hold the same four projects, then lands on a plain conventional portfolio page.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/makers-mark/` — "The Maker's Mark" scroll-story portfolio (static React + Vite, no backend).
  - `src/content/` — the typed content model (all copy, doorways); never invent copy elsewhere.
  - `src/components/FramePlate.tsx` — canvas scrubber for generated video plates (`public/media/<name>/w800|w1600/fNNN.webp` + `poster.jpg`). Acts drive it from a GSAP proxy; memory-bounded (window + coarse skeleton, releases off-screen). Regenerate sequences with `scripts/extract-frames.sh <name>` (env `FPS`, `Q`) from `gen/video/*.mp4`.
  - `gen/` — raw AI generations (videos, stills, reference frames); source of truth, not served. `src/assets/gen/*.webp` — the served stills (doorway cutouts, wax-seal sigil, Coda project marks). **No SVG in the story acts** and **no stills that duplicate the plate**: structure beats are text-only panels placed on the side of the frame the structure is not on. Doorway choice maps to a structure (`src/content/doorways.ts`) and must stay visible: Prologue leads line, per-world "your doorway" tag, Coda ordering.
  - `src/components/Prologue.tsx` — one grand physical door, rendered as a generated 1080p video plate with a still poster; only the HTML CTA begins the opening. Wheel, touch and scrolling keys are locked before and during the clip. Its final second dissolves into the actual first World 1 frame, then the app makes an immediate controlled handoff—no white fog overlay. The old multiple-door choice is intentionally absent from new visits.
  - `src/components/unwritten/` — Act 1 is a 22.2 s scroll plate named `unwritten_journey_frames`: 510 user-supplied 1920×1080 JPG frames staged under `gen/incoming/world1-frames/part-{a,b,c}` and converted into responsive 800px/1600px WebP tracks. Beats are keyed to footage seconds in `BEATS`; the camera rests at the portal (`JOURNEY`) and the white-out tail is prepended to `unwritten_to_kingdom.mp4`. Pin is 1000%.
  - `src/components/kingdom/` — Act 2 (stone/bronze) over the `kingdom_travel` plate; overlays in DOM order must match the plate's beat order (Bridge, Well, Gate, side halls, Orchard); carved text = `.k-carved`; transition = drag the chisel (`UnfinishedCarving`, HTML/canvas) → `.k-refracting` → `unlockNextAct()`. Small screens shrink pinned frames with CSS `zoom`.
  - `src/components/long-after/` — Act 3, a solid ivory/titanium future civilization above black water. `future_journey` combines Bridge, Well, Gate and Orchard shots with 0.6s crossfades (355 frames at 16fps). Text-only side panels preserve interactions; `FilamentGrab` exits toward the daylight room.
  - `src/content/environment-media.ts` — shared sequence names/counts/durations for Unwritten, Long After and Present Room. `scripts/build-unwritten-frames.sh` builds World 1’s 510-frame WebP plate from the user-supplied JPGs. `scripts/assemble-environments.sh` builds the future sequence and its crossings. `present_daylight` is an 8s/128-frame ordinary-room camera move: laptop → phone/ledger → whiteboard → shelves.
  - `src/components/present-room/` — Act 4 (the only real world), pinned scrub over the `present_travel` plate; hotspots open `RoomCard` (Radix Dialog) with real names/links from the content model; `StickyGate` is the final gate; the first "turn the page" plays `public/media/present_to_coda.mp4` in a local `PageTurn` overlay (unlock at 60%, fails fast on autoplay refusal).
  - `src/components/CodaAct.tsx` — Act 5, the plain conventional portfolio on the blank opening page (resume served from `public/`, linked via `import.meta.env.BASE_URL`).
  - `ASSETS-CHECKLIST.md` — the real photos/screenshots/handwriting the owner still has to supply; every stand-in in the room carries `data-placeholder`.
  - `src/lib/scroll.ts` — Lenis/ScrollTrigger helpers; always scroll via `scrollToElement`; `waitForElement` before scrolling to a lazily loaded act.
  - `src/lib/dissolve.ts` + `src/components/MaterialDissolve.tsx` — world-to-world transitions play `public/media/{unwritten_to_kingdom,stone_to_future,future_to_room}.mp4` in a fixed overlay. The two future crossings prefer VP9 `.webm` sources with MP4 fallbacks for codec compatibility. Internal dissolve kind IDs are retained. Next act unlocks at a per-kind midpoint; 12s safety; reduced motion → plain crossfade. Describe generations positively as a continuous full-bleed digital image extending cleanly to every edge.
  - `src/lib/ambient.ts` + `src/components/AmbientSound.tsx` — optional per-world ambient beds synthesised with Web Audio (no audio files); off by default, `AmbientToggle` bottom-left.
  - `src/hooks/use-fit-frames.ts` — shrinks pinned Kingdom scenes with CSS `zoom` until they fit small viewports.
  - `public/og.jpg` — the Open Graph image (the bronze mark on the stone wall), generated from a throwaway HTML render; regenerate with the same approach if the mark changes.

## Architecture decisions

- Acts are appended to the DOM only when unlocked; Kingdom, Long After, Present Room and Coda are separate lazy chunks and the next world is prefetched when the current one unlocks. Each act sits in its own `data-act-slot` wrapper so ScrollTrigger's pin-spacer never moves a node React owns directly.
- `html`/`body` background tracks the shown world (dissolve target during a dissolve) so repaints never flash white.
- GSAP/ScrollTrigger drives scrub; CSS keyframes/transitions handle small reveals. Generated media dominates the static output; check its actual size after new generations instead of relying on an old estimate.
- Social/canonical URLs use `%VITE_SITE_URL%` in `index.html`; `vite.config.ts` derives it from `REPLIT_DOMAINS` inside a deployment build, or set `VITE_SITE_URL` in `.env` for a custom domain.
- Deployment is static (`artifact.toml`: `serve = "static"`, `publicDir = artifacts/makers-mark/dist/public`, SPA rewrite). Build needs `PORT` and `BASE_PATH` (provided by `services.env`).

## Product

- Prologue (choose a doorway) → The Unwritten → The Buried Kingdom → The Long After → The Present Room → Coda (plain portfolio + résumé). Each world ends in a visitor-caused gate (decide, chisel, grab the filament, read the sticky note) that dissolves into the next material.
- Works by tap and keyboard on phones; reduced motion gets a linear layout with crossfades; "Skip to Coda" link for keyboard users; optional ambient sound toggle.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Pinned acts: hidden scrub frames are set `inert` + `pointer-events:none` from their opacity; sync it from the *timeline's* `onUpdate` as well as the ScrollTrigger's — with `scrub: 1` the timeline keeps moving after the last scroll event and only its own callback sees the final opacities (otherwise a fast flick leaves the visible frame inert/hidden). Never tween `pointerEvents`.
- `index.html`: any `<link href>` that can resolve to `/` (e.g. canonical with an empty site URL) needs `vite-ignore`, or the build fails with EISDIR.
- Long After: hover reveals reserve their height (`min-h`) so the pane never shifts under the cursor; moving light dots are `pointer-events:none`; state-driven visibility sits on a wrapper, not on `.la-etch` (the scrub tween writes inline opacity to every `.la-etch`).
- Reduced motion uses a separate linear layout; act-entry detection uses a viewport-centre `rootMargin` observer (ratio thresholds never fire for tall sections), and viewport-following backgrounds use `fixed` + clip-path (sticky is broken by `main`'s `overflow-x-hidden`).
- Rose is reserved for the visitor's own path in every world (glass strokes tint via CSS `color`).
- Present Room: depth layers are full-size stacked divs, so `.pr-layer` is `pointer-events:none` and only `.pr-obj`/interactive props opt back in; hotspot buttons sit at `z-index:10` above the object's decoration, and screen overlays that must stay above them (laptop lid) are `pointer-events:none` except for their own buttons. Absolutely positioned `<img>`s give their wrapper zero height — use `.pr-img-flow` when overlays are positioned in % of the image.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
