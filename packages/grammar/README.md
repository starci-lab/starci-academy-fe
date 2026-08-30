# `@starci/grammar`

`@starci/grammar` packages StarCi's reusable React components and visual DNA. It wraps HeroUI
primitives with stable, accessible presentation components, provides ready-made Core primitives and
compositions, and keeps the palette, geometry, rhythm, elevation and motion of the StarCi product
family together. It contains no application routes, data fetching, domain entities, product state,
or UI-law registry.

## Public entry points

- `@starci/grammar/common` — presentation-state helpers and shared CSS.
- `@starci/grammar/core` — StarCi DNA/tokens; `GrammarRoot`, `PageContainer`, `SectionHeader`,
  `MediaFrame`, `IncludedMark`, `SurfaceCopyGroup`, and `PrimaryRailLayout`; plus the existing `StateMark`, `LeadingNumber`,
  `StaticStateRow`, `SurfaceCard`, `SurfaceListCard`, `MarkdownArticle`,
  `SurfaceAccordionCard`, and `Rail` components.
- `@starci/grammar/common/styles.css`, `@starci/grammar/core/styles.css`, and
  `@starci/grammar/offset-pop/styles.css` — package stylesheets. Short `.css` export aliases are
  also available.

Install the workspace package while developing locally:

```sh
npm install ./packages/grammar
```

Import components from the focused entry point:

```tsx
import {
  GrammarRoot,
  PageContainer,
  PrimaryRailLayout,
  SurfaceCard,
} from "@starci/grammar/core"
import "@starci/grammar/core/styles.css"

export const ProductSurface = () => (
  <GrammarRoot>
    <PageContainer>
      <PrimaryRailLayout
        primary={<SurfaceCard ariaLabel="Main">...</SurfaceCard>}
        rail={<SurfaceCard ariaLabel="Progress">...</SurfaceCard>}
      />
    </PageContainer>
  </GrammarRoot>
)
```

`GrammarRoot` is the explicit StarCi-DNA boundary. Existing Core consumers continue to work without
it; new or reconstructed product surfaces wrap their composition once to receive the packaged light,
dark, system, forced-colour and HeroUI-compatible tokens. `STARCI_CORE_DNA` exposes the immutable
design values, `STARCI_CORE_TOKEN_NAMES` exposes their CSS adaptation contract, and
`STARCI_CORE_TOKEN_DEFAULTS` / `STARCI_CORE_DARK_TOKEN_DEFAULTS` expose the exact packaged values.

`IncludedMark` is the purpose-named 20px outlined circle-check for included offering content; it
inherits foreground and never claims completion. `SurfaceCopyGroup` packages Core's compact `0.5rem`
title/explanation rhythm. A `SurfaceCard` without `wholeAction` identifies itself as `static`, which
is the appropriate comparison surface when its short facts must remain visible together.

Core components accept ordinary typed React props and keep their own semantic DOM and accessibility
behavior. The consuming application remains responsible for translating business data into those
props. `MediaFrame` gives approved illustrations and AI-generated bitmap assets a consistent product
frame; it does not decide whether an image should be generated. Offset Pop adds an alternative visual
treatment only; it does not change ownership or business behavior. Mandatory UI laws remain in the
StarCi runtime knowledge layer, not in this package. The package deliberately exposes no law registry,
contract metadata, Tree DSL, or projection runtime.

## Package checks

```sh
npm run typecheck
npm test
npm pack --dry-run
```

The package requires Node.js 20 or newer and has peer dependencies on React 18+ and
`@heroui/react` 3.2+.
