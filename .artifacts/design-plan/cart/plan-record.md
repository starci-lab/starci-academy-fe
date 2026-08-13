# Plan record — cart, cart drawer, and the 3-cycle installment offer

`case-cart-system` · batch · mixed · **DIRECTIONAL — NOT AN APPLY BASELINE**

Status: **direction selected — `direction-legacy-full-default`** (parity-first). Lab:
`http://127.0.0.1:8096/` · `verify_plan_record.mjs` → `ok`. Arithmetic:
[installment-analysis.md](./installment-analysis.md).

## Selected: D — legacy default kept

Chosen explicitly ("D đi") one turn after asking for A and B to be inverted to an installment
default and being shown what that default costs. The exploration did its job: the inversion was
built, its price was measured, and the reference behaviour was kept.

**What D settles:** the cart and drawer state the pay-in-full price; `PaymentModal` opens on
"Trả một lần"; installments are a deliberate choice the buyer turns on. Stripe, PayPal and Crypto
stay in the gateway list because nothing has clamped the order to VND, and nobody is charged the
247.500₫ surcharge without asking for it.

**What D does NOT settle — installments are still built.** They are a choice rather than a default,
so every owner, contract and both backend enablers below remain in scope. Choosing D removes a
default, not a feature.

**Still open:** whether a plans surface (list, pay next cycle, locked-course recovery) joins this
scope. Recorded in `unknowns`.

## Pricing settled: markup 5%, first cycle 50%

The markup drops from 10% to **5%**. That changes the schedule, because shares must sum to
`100 + markup`: at 105 the original `50 + 30 + 30 = 110` overshoots by five points of base and would
charge 247.500₫ nobody owes. Keeping the instructed 50% first cycle, the remaining 55 splits evenly.

| cycle | share of base | amount | vs the 10% plan |
|---|---|---|---|
| 1, at checkout | 50% | **2.475.000₫** | unchanged |
| 2 | 27,5% | 1.361.250₫ | −123.750₫ |
| 3 | 27,5% | 1.361.250₫ | −123.750₫ |
| **total** | **105%** | **5.197.500₫** | −247.500₫ |

The first payment does not move — it is 50% of base either way — so the whole saving lands on the
two later cycles. `27,5%` is not a number to print; the copy is **"trả trước 50%, còn lại chia đôi"**.

**What 5% buys.** Effective rate on money actually borrowed falls from ~133% nominal annual (10%
front-loaded) to **~72%**, and lands below the ~109% of what ships today — the front-loading raised
the rate and the markup cut more than undid it. Financing cost of carrying ~2.042.000₫ for two
months is on the order of 30.000₫ against a 247.500₫ fee, so 5% still covers financing many times
over; the surplus pays for default risk and the enforcement machinery. Full working in
[installment-analysis.md](./installment-analysis.md).

**Existing buyers are not repriced.** `markup_percent` is already snapshotted per plan at checkout,
exactly so a later change never reaches a live plan. 5% applies to new plans only.

---

## What the backend already ships

Installments are **not a new feature**. The backend has the whole domain: `installment_plans`,
`InstallmentPlanService`, a daily enforcement cron, installment support on all three purchase entry
points, `myInstallmentPlans`, `payNextInstallment`, webhook and reconcile settlement, and reminder
and default emails. Exactly **one term** is offered — 3 months at **10%** markup — and the config
comment records that as a teacher decision of 2026-07-14 which removed the 6- and 12-month terms so
no term picker would be needed.

The frontend renders none of it, and has no cart at all.

## The one thing that does not exist

Today `computeInstallmentTotal` produces `total = base × 1.10` and `monthly = total / 3` — three
**equal** cycles of 36,67%. `computeMinPaymentVnd` for a Fixed plan returns that one stored number,
and `installment_plans` has no per-cycle column. **50/30/30 is not representable.**

| cycle | ships today | settled |
|---|---|---|
| 1, at checkout | 1.815.000₫ | **2.475.000₫** |
| 2 | 1.815.000₫ | 1.361.250₫ |
| 3 | 1.815.000₫ | 1.361.250₫ |
| total | 5.445.000₫ | **5.197.500₫** |

Two things move at once: the money is front-loaded, and the markup drops from 10% to 5%. See
*Pricing settled* above for why the shares became 50 / 27,5 / 27,5 rather than 50 / 30 / 30.

## Three findings that shape every direction

**Nothing auto-charges.** There is no card on file anywhere in this codebase. Cycles 2 and 3 are
manual `payNextInstallment` checkouts the learner starts. Choosing installments hands them homework,
and this frontend has nowhere to do it — whether a plans surface joins this scope is an open
question, not an assumption.

**There is no calendar.** The plan holds one rolling `nextDueAt`, advanced `+1 month` from the
payment that just landed. Cycle 3's date does not exist until cycle 2 is paid, so the lab shows
offsets, not dates.

**One plan gates the whole order.** `lockedCourseIds` is every course in the checkout. Missing a
cycle locks all three courses together — which the buyer has to be told before choosing, not after.

## Installments as the default — what that costs

A, B and C now all **open on installments**. Legacy does not: `PaymentModal` initialises
`installmentMonths` to `null`, the comment reads *"pay in full (unchanged default)"*, and it resets
to `null` on every open. So this is a real departure, and it carries a consequence that is not
obvious from any mockup:

> `hasUsd = (…) && !installmentActive && !flatVoucherActive`

Installments are VND-only per the capability matrix, so **an installment default hides Stripe,
PayPal and Crypto** from the gateway list until the buyer switches back to paying in full. Any
buyer who would have paid in USD has to undo the default first.

The second cost is plainer: pre-selecting the option that costs 5% more collects 247.500₫ extra from
every buyer on the worked cart who does not notice. **Direction D declines both costs** — it is why
it was chosen.

## The four directions

Surface topology is held at legacy parity in all four (drawer primary, `/cart` as the deep review),
because the legacy source states that position about itself. What they differ on is **where the
installment decision is made and how loudly the cart is reframed around it**.

| id | posture | default | where the choice lives |
|---|---|---|---|
| `direction-installment-at-payment` | conservative | installments | payment modal; the cart shows an installment-led total |
| `direction-installment-in-cart` | balanced | installments | in the cart, on both surfaces, with the schedule |
| `direction-entry-price-leads` | bold | installments | the cart leads with the entry price |
| **`direction-legacy-full-default`** | **parity-first** | **pay in full** | **payment modal, exactly as legacy — SELECTED** |

**D is kept on purpose.** The other three depart from the reference, and a migration that cannot see
what it is leaving behind can only assert the departure, not review it. It is also the only
direction where nobody is charged the surcharge without asking and the international gateways stay
visible.

Note for A: legacy builds its hint from the *cheapest* `monthlyAmountVnd` and prints "chỉ từ
X/tháng". Under 50/30/30 the first cycle is the **most** expensive, so that line becomes a false
floor. Unavoidable in every direction.

## Proposal shelf (identical across all four)

| tier | owner | why |
|---|---|---|
| shell | `DrawerShell` | Canon names two shells that may expose children; only `ModalShell` was built. |
| block | `CartLine` | The same row on both surfaces; two copies drift the first time pricing changes. |
| block | `OrderSummary` | Figures that only mean anything together, and the place the surcharge is stated rather than hidden. |
| block | `InstallmentSchedule` | A front-loaded schedule has no single per-month number, and the same rows later carry a live plan's paid/due/overdue. |
| block | `AddToCartButton` | Where the flow starts and the only owner that must know what a signed-out press means. |

New contracts: `cart-line-row`, `order-summary-stack`, `installment-cycle-row`.

## Backend enablers — two, both bounded

1. **`installment-weighted-schedule`** (behaviour change + schema). `INSTALLMENT_MARKUP_PERCENT_3M`
   to `5`, plus a **basis-point** share vector `INSTALLMENT_SCHEDULE_BPS_3M = 5000,2750,2750` —
   basis points because 27,5 is not an integer and the surrounding columns are `int`. Snapshotted
   per plan in a `cycle_bps` jsonb column beside the existing `markup_percent` snapshot, with
   `computeMinPaymentVnd(Fixed)` reading `cycles[installmentsPaid]`. Live plans with a null vector
   keep their even split at their snapshotted 10% — which is what they were sold under.
2. **`installment-preview-schedule`** (additive field). `cycles[]` on `InstallmentOptionItem`, with
   month offsets rather than dates, since the server holds no calendar.

## Other findings worth carrying

- `coursesCheckoutPreview` already returns `installmentOptions` — the earlier reading of that file
  in this run missed it.
- A locked-for-non-payment enrollment and a never-paid trial are the same `is_enrolled = false` with
  nothing recording why; a locked state can only be rendered by cross-referencing
  `myInstallmentPlans` for a `Defaulted` plan.
- `TransactionStatus.Cancelled` and `.Failed` are declared but never assigned; every real failure
  lands on `Unpaid`. A frontend branch on the first two would be dead code.
- Cart checkout accepts no `voucherCode`; only single-course `courseEnroll` does.
- Outside production every VND amount is divided by 100 before it reaches the frontend. Amounts
  arrive display-ready and must never be re-scaled locally.
