# `@starci/grammar`

Business-neutral UI contracts and versioned StarCi Grammar bundles.

## Public entry points

- `@starci/grammar/common` — contract kernel and runtime validation.
- `@starci/grammar/core` — generic StarCi owners and base contracts.
- `@starci/grammar/offset-pop` — one declared visual extension of Core.
- `@starci/grammar/common/styles.css`, `core/styles.css`, `offset-pop/styles.css` — canonical cascade entries. Short `.css` aliases are also exported.

Install this workspace package while it is under development. Published consumers must pin one
exact version rather than a range:

```sh
npm install ./packages/grammar
# after publication: npm install --save-exact @starci/grammar@0.1.0
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

Contracts are immutable. Extensions may resolve only axes explicitly opened by the base contract. They cannot replace anatomy, mutate a closed invariant, substitute the owner or silently replace a duplicate registry key.

## Package checks

```sh
npm run typecheck
npm test
npm pack --dry-run
```
