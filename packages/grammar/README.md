# `@starci/grammar`

Business-neutral UI contracts and versioned StarCi Grammar bundles.

## Public entry points

- `@starci/grammar/common` — contract kernel and runtime validation.
- `@starci/grammar/core` — batteries-included, product-neutral leaves, composites, branches, layout capabilities and base contracts.
- `@starci/grammar/offset-pop` — one declared visual extension of Core.
- `@starci/grammar/common/styles.css`, `core/styles.css`, `offset-pop/styles.css` — canonical cascade entries. Short `.css` aliases are also exported.

Install this workspace package while it is under development. Published consumers must pin one
exact version rather than a range:

```sh
npm install ./packages/grammar
# after publication: npm install --save-exact @starci/grammar@0.2.0
```

```ts
import { createContractRegistry } from "@starci/grammar/common"
import { CORE_COMPONENT_CONTRACTS } from "@starci/grammar/core"
import { offsetPopGrammar } from "@starci/grammar/offset-pop"
```

```css
@import "@starci/grammar/common/styles.css";
@import "@starci/grammar/core/styles.css";
@import "@starci/grammar/offset-pop/styles.css";
```

`common` contains no React, Next.js, business entity, operation or domain state. A Product Block translates domain state into `PresentationState`; Grammar consumes only that neutral state.

Core owners expose additive, business-neutral capabilities without opening their anatomy:

- `StateMark` is a Core leaf for neutral presentation-state marks.
- `StaticStateRow` is a Core composite for one non-interactive row in a Core-owned collection.
- `SurfaceCard` supports bounded/frameless frames, page/contained scrolling and one label-end slot.
- `SurfaceListCard` hosts one existing typed contract component with structured runtime props, an accessible hidden label and one footer; the contract registry remains the sole row/cell authority.
- `Rail` supports a Core-owned complementary landmark or one content-owned navigation landmark, plus expanded/collapsed and motion/reduced-motion declarations.

`CORE_LAYOUT_CLASS_NAMES` is the closed product-neutral layout vocabulary. Product breakpoints,
token names and selectors remain in the consuming application's contract registry.

Adapters must bind directly to the `core.*` contract identity and emit the canonical `data-grammar-*` anatomy. A product-prefixed contract with no resolved Core axis is not a substitute for conformance.

Contracts are immutable. Extensions may resolve only axes explicitly opened by the base contract. They cannot replace anatomy, mutate a closed invariant, substitute the owner or silently replace a duplicate registry key.

## Package checks

```sh
npm run typecheck
npm test
npm pack --dry-run
```
