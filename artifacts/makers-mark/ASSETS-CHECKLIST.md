# Assets checklist — things only you can supply

Everything below is currently a **placeholder** in the Present Room or the Coda. Each
placeholder in the room carries a tiny dashed `PLACEHOLDER` tag and a
`data-placeholder` attribute so it is easy to find. Drop the real file in, and the tag
goes away with it.

## Photos and screenshots

| # | What | Where it appears | Replace in | Ideal spec |
|---|------|------------------|------------|------------|
| 1 | **Sai Store photo** — the shopkeeper's counter, or the ledger being scanned | Polaroid pinned left of the whiteboard | `src/components/present-room/RoomProps.tsx` → `Polaroid` (swap the grey `.pr-polaroid-photo` for an `<img>`) | Square crop, ≥ 600×600, JPG/WebP |
| 2 | **Recall AI scan screenshot** — the app mid-scan of a handwritten ledger | Phone screen on the desk | `Screens.tsx` → `PhoneScreen` (replace the HTML mock with an `<img>`) | Portrait phone screenshot, PNG |
| 3 | **ReelSense demo screenshot** — the recommender with explanations visible | Laptop screen | `Screens.tsx` → `LaptopScreen` (keep the `PaperPilot` tab button) | 16:10 landscape, ≥ 1600 px wide |
| 4 | **MindThread screenshot** ("v0") | Taped to the top-right of the whiteboard | `Whiteboard.tsx` → `.pr-v0-shot` | 16:10, PNG |
| 5 | **TRACE demo still** — one frame from the demo video | Shelf, right | `RoomProps.tsx` → `TraceStill` | 16:9, ≥ 800 px wide |
| 6 | **GhostWire architecture diagram** — your real one, if it exists | Shelf, middle | `RoomProps.tsx` → `GhostWireDiagram` (currently a drawn stand-in) | SVG or PNG, landscape |
| 7 | **Cost-per-scan data** — the actual monthly figures behind "93% over four months, ~$0.0004" | Printout leaning on the desk | `RoomProps.tsx` → `CostCurvePrintout` (`pts` array) | Four (or more) monthly cost values |
| 8 | **Imagine Cup 2026 badge / certificate** scan, if you have one | Badge card on the desk | `RoomProps.tsx` → `ImagineCupBadge` | Any, portrait |
| 9 | **IIEST Shibpur certificate** scan | Framed certificate on the desk (text is currently overlaid on a generated frame) | `RoomProps.tsx` → `CertificateText` / `PresentRoomAct.tsx` | Portrait, ≥ 800 px tall |
| 10 | **Auth0 hackathon badge** scan or photo | Lanyard on the shelf | `RoomProps.tsx` → `LanyardBadgeText` | Portrait |

## Handwriting (21 phrases)

All handwriting in the room is vectorised from a **font stand-in** (Caveat) and is
flagged `placeholder: true` in `src/assets/handwriting/generated.ts`. To replace with
your own hand:

1. Write each phrase in black pen on white paper and scan/photograph it flat.
2. Trace each to an SVG of filled paths (Inkscape → *Path → Trace Bitmap*, one glyph
   or stroke per `<path>`, in writing order).
3. Save as `src/assets/handwriting/overrides/<id>.svg` (ids below).
4. Re-run the generator: `OPENTYPE_PATH=/tmp/hw/node_modules/opentype.js node scripts/handwriting.mjs scripts/Caveat.ttf`
   (see `src/assets/handwriting/overrides/README.md`).

| id | phrase |
|----|--------|
| `found-1` | You found the mark. |
| `found-2` | Say hello. |
| `same-1` | Same idea. |
| `same-2` | Kept coming back. |
| `companion` | Cognitive AI Companion |
| `ongoing` | research, ongoing |
| `v0` | v0 |
| `note-v0` | where it started |
| `question-1` | does the memory live in the context, |
| `question-2` | or beside it? |
| `memory` / `reflection` / `feeling` / `time` | the four diagram labels |
| `drafts` | the mark, four drafts |
| `turn` | turn the page |
| `reelgap` / `stargap` | ReelGap / StarGap |
| `note-bubble` | popularity bubble! |
| `note-why` | explain why, every time |
| `note-cost` | per scan, four months |

## The mark's drafts

The "four drafts" sheet pinned left of the whiteboard uses three invented early
versions plus the final mark. If you have real sketches of the mark, scan them and
replace the `DRAFTS` paths in `RoomProps.tsx` → `MarkDraftsSheet`.

## Coda

- **Resume:** `public/Sarvesh-Bijawe-Resume.pdf` is the PDF you uploaded. Replace the
  file (same name) whenever it changes.
- **Live URL:** the site's own address appears nowhere yet; add it to the Coda header
  once published (next milestone handles SEO/OG).
- **LinkedIn URL:** confirm `https://linkedin.com/in/sarvesh-bijawe` in
  `src/content/index.ts` → `contact.links`.
