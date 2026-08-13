# Which installment shape is reasonable — the arithmetic

**Settled by the teacher:** markup **5%**, first cycle **50%**, term 3 months.
This document records how those numbers were reached and what they cost.

All figures use one worked cart: three courses, list `5.500.000₫`, charged after loyalty + bundle
`4.950.000₫`. Call the charged figure **P** (the backend calls it the base).

## What ships today

`installment.markupPercentByMonths` has exactly one key — `3`, at **10%** — and
`computeInstallmentTotal` produces:

```
totalAmountVnd   = P × 1.10          = 5.445.000₫
monthlyAmountVnd = total / 3         = 1.815.000₫   × 3 cycles
```

Three equal cycles of **36,67% of P**.

## Why 50/30/30 stopped closing

The first instruction was 50% then 30% then 30%. Read as shares of P that sums to **110**, which was
exactly the 10% markup — an accident of the two numbers matching, and it made the change a pure
reshaping with no price movement.

Dropping the markup to 5% breaks that. Shares must sum to `100 + markup`, so now **105**, and
`50 + 30 + 30 = 110` overshoots by five points of P — 247.500₫ of money that would be charged and
not owed.

Keeping the instructed **50% first**, the remaining 55 splits evenly:

| cycle | share of P | amount | when |
|---|---|---|---|
| 1, at checkout | 50% | **2.475.000₫** | today |
| 2 | 27,5% | 1.361.250₫ | +1 month |
| 3 | 27,5% | 1.361.250₫ | +2 months |
| **total** | **105%** | **5.197.500₫** | = P × 1,05 |

No rounding remainder. The first payment is unchanged from the 10% plan — 50% of P either way — so
the entire 247.500₫ saving lands on the two later cycles, which fall from 1.485.000₫ to 1.361.250₫.

`27,5%` is not a number to print. The honest copy is **"trả trước 50%, còn lại chia đôi"**, and the
lab renders it that way.

One alternative if the round later cycles matter more than the round first one: **45/30/30**, same
105 total, first payment 2.227.500₫. Lower barrier, less collected before the riskiest moment.

## What 5% actually buys the learner

Weighted outstanding balance — how much of P the school is carrying, averaged across the two months
between cycles:

```
today   (10%, equal thirds)  : 73,33% → 36,67%   mean 55,00%
earlier (10%, 50/30/30)      : 60,00% → 30,00%   mean 45,00%
now     ( 5%, 50/27,5/27,5)  : 55,00% → 27,50%   mean 41,25%
```

Fee as a rate on money actually borrowed, over the two months it is borrowed:

| plan | fee | mean exposure | rate / 2 months | nominal annual |
|---|---|---|---|---|
| ships today | 10% | 55,00% | 18,2% | ~109% |
| 10% + 50/30/30 | 10% | 45,00% | 22,2% | ~133% |
| **5% + 50/27,5/27,5** | **5%** | **41,25%** | **12,1%** | **~72%** |

So the drop to 5% roughly **halves** the effective rate, and lands well below what ships today
despite the schedule being front-loaded. The front-loading raised the rate; the markup cut more than
undid it. That is the "lãi ít" part, and it is real rather than cosmetic.

## Is 5% still above cost?

The school fronts a mean 41,25% of P — about 2.042.000₫ on this cart — for roughly two months.
At Vietnamese short-term commercial rates (~8–10%/yr) the financing cost of that is on the order of
**30.000₫**. The fee is **247.500₫**. So 5% covers financing many times over, and the surplus pays
for what installments actually cost this business: default risk on content that cannot be taken
back, plus the enforcement machinery (daily cron, three reminder emails, lockout and unlock).

5% is not below cost. It is a deliberately thin margin on a service that mostly exists to widen
access, which is the intent.

## What it costs the business

Per worked cart the fee halves: **495.000₫ → 247.500₫**. Whether that is affordable depends on how
many buyers choose installments, and nobody in this run has that number. Recorded as a decision
taken with eyes open, not as a rounding detail.

Note also that direction **D** was selected, so installments are **not** the default — the buyer
turns them on. That compounds with the halved fee: fewer buyers on the plan, and each paying less.
The trade is deliberate on both counts.

## Two facts about the shipped mechanism that shape any UI

**Nothing is charged automatically.** There is no card on file anywhere in the codebase. Cycles 2
and 3 are manual `payNextInstallment` checkouts the learner starts. Choosing installments creates a
homework assignment, and this frontend currently renders no surface where it can be done —
`myInstallmentPlans` and `payNextInstallment` both ship on the backend and have no consumer here.

**There is no calendar.** The plan holds one rolling `nextDueAt`, advanced `+1 month` from the
payment that just landed. So cycle 3's date genuinely does not exist until cycle 2 is paid. A
schedule printing hard dates for all three cycles would be inventing two of them; the lab shows
"sau 1 tháng / sau 2 tháng" for that reason.

**One plan gates the whole order.** `lockedCourseIds` is every course in the checkout, so missing a
cycle locks all three courses together. On a 3-course cart that has to be said before the buyer
chooses installments, not after.

## Existing buyers are not repriced

`markup_percent` is already snapshotted per plan at checkout, precisely so a later schedule change
never reaches a live plan. Someone who bought at 10% keeps owing 10%; the 5% applies to new plans
only. The same snapshot mechanism carries the new cycle vector, and a plan with no vector keeps the
even split it was sold under.
