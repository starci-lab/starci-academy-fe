# Context lock — plan (cart page and cart drawer)

| Field | Locked value | Evidence |
|---|---|---|
| Phase | `plan` | Invoked skill `starci-fe-design-plan` |
| Trust root | `D:\Repositories\starci-academy-backend\.claude` (`bc6d8b7`) | Root `CLAUDE.md` router |
| Primary target | `D:\Repositories\starci-academy-fe` — `main`, HEAD `8410a74` | Request + git |
| Reference | `D:\Repositories\starci-academy` — `mtp`, `9a19342` — `pages/CartPage`, `overlays/drawers/MiniCartDrawer`, `blocks/commerce/CartLine`, `blocks/commerce/AddToCartButton`, `layouts/Navbar/CartButton` | The user named the legacy cart as the thing to match |
| Business truth | `D:\Repositories\starci-academy-backend` — `mtp` | Six operations, all already shipped |
| Artifact root | `…\.artifacts\design-plan\cart` | Phase convention |
| Write boundary | The artifact root only | CONTEXT-LOCK-5 |
| Runtime | Direction lab from the first free port at `8080` | Phase rule |

> **Re-planned after the installment requirement.** The first pass of this lock said no backend
> enabler was needed. That was true of the cart and false of installments: the whole installment
> domain ships, but only as three EQUAL cycles, so 50/30/30 needs a bounded schedule change. See
> [`plan-record.md`](./plan-record.md) and [`installment-analysis.md`](./installment-analysis.md).

## Capability, already there

For the cart itself, nothing is missing:

| Operation | Path |
|---|---|
| `myCart` | `queries/courses/my-cart` — cart rows with the course relation, oldest first |
| `addToCart` / `removeFromCart` / `clearCart` | `mutations/courses/*` |
| `coursesCheckoutPreview` | `queries/courses/courses-checkout-preview` |
| `coursesCheckout` | `mutations/courses/courses-checkout` |

`coursesCheckoutPreview` returns per-line `listVnd`, `chargedVnd`, `discountPercent` — described by the
backend as the **combined loyalty and bundle discount** — plus `totalListVnd`, `totalChargedVnd` and
`savingsVnd`.

The frontend today has **no cart at all**: no route, no component, no hook, no query.

## One thing the legacy does that this plan will not copy blindly

`MiniCartDrawer` declares its own `BUNDLE_TIER = { 1: 5, 2: 10 }` and a `BUNDLE_MAX_ITEMS = 3`, with a
comment saying it mirrors the backend tiers. That is a pricing rule living in two places, and the copy
that nobody edits is the one that stops matching. The server already returns the resolved
`discountPercent` and `savingsVnd` per order, so any combo meter in this plan reads them rather than
recomputing them.

Whether the combo meter survives at all is a product decision, and it is one of the things the
directions differ on.

## Installments — where the enabler lives

`coursesCheckoutPreview` also returns `installmentOptions`, which the first reading of that file
missed. One term is offered: **3 months at 10%**, produced as `total = base × 1.10` and
`monthly = total / 3` — three equal cycles of 36,67%. `computeMinPaymentVnd(Fixed)` returns that one
stored number and `installment_plans` has no per-cycle column, so **50/30/30 is not representable
today**. Its total is, though: `50 + 30 + 30 = 110`, exactly the shipped markup.

## The choice this plan exists to settle

The legacy source states its own answer plainly in the `MiniCartDrawer` docblock: the drawer is *"the
PRIMARY affordance of the cart UX"* and `/cart` *"stays as the deep review"*. That is a real product
position, not an accident — and it is exactly the kind of thing worth putting back in front of the
user rather than inheriting silently, because it decides how many surfaces have to exist and which one
carries checkout.
