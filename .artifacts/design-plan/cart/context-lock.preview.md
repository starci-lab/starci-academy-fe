# Context lock — preview (cart)

Inherits [`context-lock.plan.json`](./context-lock.plan.json). Relocked on the user's explicit
instruction after drift was printed and shown.

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `preview` | Invoked `starci-fe-design-preview` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` — `main`, `3bcbe95` | Root `CLAUDE.md` |
| Primary target | `D:\Repositories\starci-academy-fe` — `main`, **`f06071e`** | git |
| Reference | `D:\Repositories\starci-academy` — `mtp`, `9a19342` (read-only) | Named legacy cart |
| Business truth | `D:\Repositories\starci-academy-backend` — `mtp`, `945dfba5` | Six shipped operations |
| Case | `case-cart-system` | Plan record |
| Selected direction | `direction-legacy-full-default` (parity-first) | `selectionKind: explicit`, "D đi" |
| Artifact root | `…\.artifacts\design-plan\cart` | Phase convention |
| Write boundary | The artifact root only | CONTEXT-LOCK-6 |
| Read-only | `starci-academy-fe/src`, `starci-academy`, the backend, the trust tree | Evidence roles |
| Runtime | Candidate served from the first free port at `8080` | Phase rule |

## Drift from the Plan lock, and what it changes

| Field | Plan | Preview | |
|---|---|---|---|
| Target HEAD | `8410a74` | `f06071e` | changed |
| Trust root | `bc6d8b7` | `3bcbe95` | changed |
| Branch, remote, reference, direction | — | unchanged | — |

The HEAD move is not cosmetic. **Plan's first evidence line is now false.** It read:

> starci-academy-fe/src has no cart and no installment surface of any kind: no route, component,
> hook or query.

Since `8410a74`, part of the cart shipped:

| Capability | State at `f06071e` |
|---|---|
| `useMutateAddToCartSwr` | exists |
| `mutation-add-to-cart` and its types | exists |
| The add-to-cart control | exists, **inside `CourseCatalogCard`** — `cartLabel`, `isInCart`, `addToCart` |
| `/cart` route, cart drawer, `myCart` query, `DrawerShell` | still absent |

So one Plan proposal changes tier before a line of candidate source is written: **`AddToCartButton`
is no longer a new owner.** `CourseCatalogCard` already draws it and holds `isInCart` in local state,
for a reason its own comment states — *"there is no cart query here to revalidate"*. That reason
expires the moment `myCart` exists, which makes it a consolidation verdict this phase owes rather
than a detail it may inherit.

The remaining four proposals stay NEW: nothing at `f06071e` draws a drawer shell, a cart line, an
order summary or an installment schedule.

Returning to Plan was considered and refused: the selected direction is untouched. D still means
pay-in-full default, drawer primary, `/cart` as the deep review. What moved is the INVENTORY, and
re-checking inventory against the tree as it actually is today is this phase's own instruction.

## Canon reaches the candidate

`npx eslint --print-config` on an existing candidate file resolves **58 `starci-fe/*` rules** with
`noInlineConfig: true`. The candidate path is governed by the same rules as `src/`, so the
ungoverned-candidate defect this phase is told to report first does not apply here.

## Pricing settled before this phase opened

Markup **5%**, first cycle **50%** of base, later cycles **half the remainder each** — the vector is
`50 / 27.5 / 27.5`, summing to 105. On the worked cart of `4.950.000₫`: `2.475.000₫`, then
`1.361.250₫` twice, totalling `5.197.500₫`. Recorded in
[`installment-analysis.md`](./installment-analysis.md); the candidate's fixture uses these figures
and does not recompute them.
