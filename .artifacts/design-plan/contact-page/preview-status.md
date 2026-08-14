# Preview status — `case-contact-page` / `direction-one-door`

Phase `preview`. Context lock: [`context-lock.preview.json`](context-lock.preview.json) ←
[`context-lock.plan.json`](context-lock.plan.json). No drift at detection.

Current revision: **1.1** — awaiting explicit approval. Nothing is sealed.

## Proofs

| Proof | Command | Exit | Log |
|---|---|---|---|
| Types | `tsc --noEmit` | 0 | [`candidate/lint.log`](candidate/lint.log) |
| Canon | `eslint candidate/src/**/*.{ts,tsx}` | 0 | [`candidate/lint.log`](candidate/lint.log) |
| Build | `next build` | 0 | [`candidate/build.log`](candidate/build.log) |

The canon block already reaches this candidate: `starciFeConfig` globs
`**/candidate/src/**/*.{ts,tsx}`, so the executable specification is governed by the same rules as
`src/`.

## Revision ledger

### 1.0 — the selected direction, built

Four pressable channel tiles over one writing surface; the session picks the form or the founder
conversation. Typecheck and canon lint both clean.

**What the render showed that the build could not.** Measured on the running candidate: the tiles
came back `background-color: rgba(0,0,0,0)`, `border-width: 0px`, `padding: 0px`,
`border-radius: 0px`. Four buttons that looked like four runs of bare text. Nothing failed; the page
was simply wrong, which is the fifth time in this workspace that a green build has proved nothing
about appearance.

### 1.1 — the surface, and who owns it

| Element | Change | Reason |
|---|---|---|
| `contact-channel-tile` | Surface classes added, then **removed again** | `bg-surface`, `shadow-surface` and `rounded-3xl` in a contract entry were refused by `no-interaction-class-in-entry`: a ground and an elevation make the node a raised OBJECT, and a raised object already has an owner. The gate was right. |
| `ContactChannelTile` | Draws through `PressableSurface` with `isRaised` | That branch draws its own button and hands the node to `SurfaceCard`, so a pressable tile is the SAME card as an inert one beside it. `hover: "surface"` because nothing inside the tile names the destination, and the branch's own comment says something has to answer. |
| `ContactMessageForm` | Renders through `SurfaceFormCard` rather than a bare `Tree` | 1.0 floated four controls on the page background with nothing bounding them. The legacy page put the same form in a card. |
| `FounderConversationPanel` | Same | A thread with no edge makes the composer read as a page control rather than as this conversation's own. |

**Retained from 1.0:** the whole thesis — channels above, one writing surface below, the session
deciding which. Reading order, CTA and owner boundaries are unchanged.

**Rejected during 1.1:** an intermediate shape that turned the four tiles into one `SurfaceListCard`
of four rows. It passed the gate, and it was the wrong reason to change a shape the owner had
selected — it was avoidance, not design. `PressableSurface` made the selected shape expressible
correctly, so the strip came back.

## Corrections this phase made to the Plan record

Three proposals in `plan-record.json` did not survive contact with canon and the shipped source.
None of them changes the product thesis; all three are ownership corrections.

| Plan proposed | Preview built | Why |
|---|---|---|
| `leaf-message-bubble`, `leaf-textarea`, `leaf-select` | Same | Unchanged. All three are genuinely absent. |
| `composite-message-composer` | **Dropped.** The composer lives inside `FounderConversationPanel`. | COMPOSITE-7: an arrangement used once lives in the block that uses it; it is promoted by the SECOND consumer, not by a prediction of one. |
| `icon-brand-glyphs` → a new `BrandMark` leaf reading `public/brands/*.svg` | **Dropped.** Facebook and LinkedIn were added to `leaves/Icon/brands.tsx`, and `IconName` gained both. | The shipped `Icon` leaf had already answered this: it holds Google's and GitHub's marks as local paths for exactly the reason ICON-7 gives. A second owner would have split "what mark does this product draw" across two files. |
| A flat 13-state page manifest | **Decomposed by owner.** The page owns `guest` / `signed-in`; the form owns 5; the panel owns 6. | PAGE-2 and PAGE-3. One flag for the whole screen makes the fastest region wait on the slowest. |

## Owner-state coverage

Eleven scenarios, each with its own address (`?state=<id>`), driving one scene.

| Owner | States | Coverage |
|---|---|---|
| `page` `ContactPage` | `guest`, `signed-in` | rendered — `guest-ready`, `signed-in-ready` |
| `block` `ContactMessageForm` | ready, invalid, submitting, submitted, failed | rendered — `guest-*` |
| `block` `FounderConversationPanel` | resting, empty, ready, sending, send-failed, thread-failed | rendered — `signed-in-*` |
| `block` `ContactChannelTile` | ready | rendered in every scenario; it fetches nothing, so pending / empty / failed are **not-applicable** with source evidence — the four destinations are product constants, not a payload |

Measured on the running candidate at 1280×900: the strip resolves to `264px 264px 264px 264px`,
the page to `max-width: 1152px` with `24px` inset, no horizontal overflow. Message rows side
correctly (`other → flex-start`, `viewer → flex-end`) and a failed message keeps its text with its
retry. `guest-submitted` replaces the controls with the notice and one way back.

## Open items before a seal

1. **Zalo's mark.** The tile currently draws the `send` glyph. The owner is supplying the official
   Zalo SVG; it goes into `leaves/Icon/brands.tsx` the way Google's and GitHub's did. Until then the
   tile is honest but not final. ICON-7 refuses `react-icons`, which is what the legacy page used,
   so there was nothing to port.
2. **The Zalo destination itself.** `zalo.me/0828678897` was DERIVED from the phone number, not read
   from source. Every other contact fact is verbatim from `starci-academy/src/resources/contact.ts`.
3. **A contract change requested by the owner**, not yet named.
4. **Screenshots.** The browser pane would not composite during this run, so state evidence is
   measurement rather than images. A seal needs the images.

## A rule blind spot, reported rather than worked around

`no-vendor-icon-outside-icon-leaf` decides what is a glyph LIBRARY by asking whether the import
specifier is external, treating anything not starting with `.` or `@/` as external. The candidate
alias `~candidate/components/leaves/Icon` therefore reads to it as a third-party icon package, while
`@/components/leaves/Icon` — what the shipped `IconTile` writes — reads correctly. The candidate
imports its mirrored icon leaf relatively so the rule sees the truth; the durable fix belongs in the
rule and is recorded in [`proposed-canon-changes.md`](proposed-canon-changes.md).

## Concurrent work in the target during this run

Another session rewrote `src/components/contracts/index.ts`, deleted `branches/PressableTree` and
added `branches/PressableSurface` while this phase was running. Mid-run the target carried 315 type
errors from a half-finished edit; it now compiles clean. The candidate mirror was resynced from the
clean tree and every addition re-applied, which is also how `PressableSurface` reached this
candidate. Nothing in the target was edited by this phase.
