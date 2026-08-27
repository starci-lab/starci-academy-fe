# `@starci/grammar`

`@starci/grammar` is a business-neutral React component package for StarCi Academy. It wraps
HeroUI primitives with stable, accessible presentation components and provides the Offset Pop
visual layer. It contains no application routes, data fetching, domain entities, or product state.

## Public entry points

- `@starci/grammar/common` — presentation-state helpers and shared CSS.
- `@starci/grammar/core` — `StateMark`, `LeadingNumber`, `StaticStateRow`, `SurfaceCard`,
  `SurfaceListCard`, `MarkdownArticle`, `SurfaceAccordionCard`, and `Rail`.
- `@starci/grammar/common/styles.css`, `@starci/grammar/core/styles.css`, and
  `@starci/grammar/offset-pop/styles.css` — package stylesheets. Short `.css` export aliases are
  also available.

Install the workspace package while developing locally:

```sh
npm install ./packages/grammar
```

Import components from the focused entry point:

```tsx
import { MarkdownArticle, SurfaceCard } from "@starci/grammar/core"
import "@starci/grammar/core/styles.css"
```

Core components accept ordinary typed React props and keep their own semantic DOM and accessibility
behavior. The consuming application remains responsible for translating business data into those
props. Offset Pop adds visual treatment only; it does not change ownership or business behavior.
The package deliberately exposes no rule registry, contract metadata, Tree DSL, projection, or
runtime visual-vocabulary object.

## Package checks

```sh
npm run typecheck
npm test
npm pack --dry-run
```

The package requires Node.js 20 or newer and has peer dependencies on React 18+ and
`@heroui/react` 3.2+.
