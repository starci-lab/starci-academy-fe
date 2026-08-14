import type { CartPageProps } from "~candidate/components/pages/CartPage/component"
import type { CartDrawerProps } from "~candidate/components/overlays/commerce/CartDrawer/component"
import type { CheckoutOverlayProps } from "~candidate/components/overlays/commerce/CheckoutOverlay/component"
import fixture from "~candidate/fixtures/cart.json"

/**
 * THE STATE INVENTORY, as data rather than as a table in a document.
 *
 * One entry per rendered state. The route generator, the index and the sealed record read THIS, so
 * a state cannot be claimed in the record and absent from the build: there is one list and it is
 * the thing that renders.
 *
 * EVERY STATE OPENS ITS OWN DOCUMENT, because a page holds the document's one main landmark and
 * nine scenarios on one page would be nine of them.
 *
 * NO JSX HERE. The route that enumerates states is a server component while every StarCi leaf
 * reaches HeroUI and therefore `client-only`; the type imports above are erased, so naming the
 * shapes pulls nothing client-side into the server file.
 */

const money = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
})

const labels = fixture.labels

/** The lines as the reader receives them once the request has settled. */
const lines = fixture.lines.map((line) => ({
    courseId: line.courseId,
    title: line.title,
    tier: line.tier,
    cover: null,
    price: money.format(line.chargedVnd),
    originalPrice: money.format(line.listVnd),
    discountLabel: `-${line.discountPercent}%`,
    removeLabel: labels.remove,
}))

/** The summary copy both surfaces share. */
const summaryLabels = {
    subtotal: labels.subtotal,
    savings: labels.savings,
    surcharge: labels.installmentFee,
    total: labels.total,
    unavailable: "—",
}

const pageLabels = {
    navHome: labels.navHome,
    navCart: labels.navCart,
    title: labels.title,
    summary: summaryLabels,
    installmentHint: labels.installmentHint,
    checkout: `${labels.checkout} (${String(fixture.itemCount)})`,
    clearAll: labels.clearAll,
    confirmClearAll: labels.confirmClearAll,
    emptyMessage: labels.emptyMessage,
    emptyAction: labels.emptyAction,
}

const drawerLabels = {
    title: `${labels.drawerTitle} · ${String(fixture.itemCount)}`,
    summary: summaryLabels,
    checkout: labels.checkout,
    viewFullCart: labels.viewFullCart,
    emptyMessage: labels.emptyMessage,
    emptyAction: labels.emptyAction,
}

/** The settled money figures, formatted once. */
const settled = {
    subtotal: money.format(fixture.totalListVnd),
    savings: `-${money.format(fixture.savingsVnd)}`,
    total: money.format(fixture.totalChargedVnd),
}

const checkoutLabels = {
    title: labels.checkout,
    planLabel: labels.payFull,
    payFull: labels.payFull,
    payInstalments: labels.payInstalments,
    summary: summaryLabels,
    terms: labels.manualWarning,
    gateways: labels.gateways,
    action: `${labels.checkout} ${money.format(fixture.totalChargedVnd)}`,
}

/*
 * The share is formatted, not stringified. `String(27.5)` prints a full stop, and in this locale
 * the decimal separator is a comma - so the raw conversion produced "27.5%" beside prices already
 * grouped the Vietnamese way, in the one place the reader is being asked to trust an arithmetic.
 */
const percent = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 })

/** The cycles, named the way a reader would read them rather than as percentages. */
const cycles = fixture.installmentOption.cycles.map((cycle) => ({
    id: `cycle-${String(cycle.ordinal)}`,
    name: `${labels.cycleOrdinal.replace("{ordinal}", String(cycle.ordinal))} · ${
        cycle.dueOffsetMonths === 0
            ? labels.cycleToday
            : labels.cycleAfterMonths.replace("{months}", String(cycle.dueOffsetMonths))
    } · ${percent.format(cycle.percent)}%`,
    amount: money.format(cycle.amountVnd),
    isCurrent: cycle.ordinal === 1,
}))

/** One rendered state: which surface, in which situation, and why it is in the matrix. */
export type RenderedState = {
    /** Route segment and sealed `stateId`. */
    readonly id: string
    /** What the reviewer is being asked to look at. */
    readonly note: string
} & (
    | { readonly surface: "page"; readonly page: CartPageProps }
    | { readonly surface: "drawer"; readonly drawer: CartDrawerProps }
    | { readonly surface: "checkout"; readonly checkout: CheckoutOverlayProps }
)

/**
 * Every state this candidate actually renders, and the only list that decides so.
 *
 * The route generator, the index page and the sealed design record all read this array, which is
 * what stops the record claiming coverage the build does not produce. A state removed here stops
 * existing everywhere at once.
 */
export const STATES: ReadonlyArray<RenderedState> = [
    {
        id: "cart-populated",
        note: "Three lines, pricing settled, paying at once — the direction's default. The instalment hint names the FIRST payment, not a per-month figure.",
        surface: "page",
        page: { state: "ready", props: { labels: pageLabels, lines, ...settled } },
    },
    {
        id: "cart-one-line",
        note: "Volume cell: one item. Whether a basket of one reads as a mistake, and whether the summary still earns its rule.",
        surface: "page",
        page: {
            state: "ready",
            props: {
                labels: pageLabels,
                lines: lines.slice(0, 1),
                subtotal: money.format(fixture.lines[0].listVnd),
                savings: `-${money.format(fixture.lines[0].listVnd - fixture.lines[0].chargedVnd)}`,
                total: money.format(fixture.lines[0].chargedVnd),
            },
        },
    },
    {
        id: "cart-empty",
        note: "The commonest state. Every region below the header is an ABSENT slot, not an emptied one, and the notice takes their place.",
        surface: "page",
        page: { state: "empty", props: { labels: pageLabels } },
    },
    {
        id: "cart-pricing-pending",
        note: "Volume cell: the answer lands after first paint. Rows are real and the figures rest — the two requests are independent, so a whole-page loader would blank rows that already arrived.",
        surface: "page",
        page: { state: "pending", props: { labels: pageLabels, lines } },
    },
    {
        id: "cart-pricing-failed",
        note: "The state the legacy cart already handles: the lines stand while the totals are unknown. The figures are replaced rather than rested, and the instalment hint is withheld because it quotes a number the summary cannot show.",
        surface: "page",
        page: { state: "ready", props: { labels: pageLabels, lines, hasPricingFailed: true } },
    },
    {
        id: "cart-removing",
        note: "Pending action on ONE row. The other two stay pressable: a basket that froze every row for a single-row operation would report something that is not happening.",
        surface: "page",
        page: {
            state: "ready",
            props: { labels: pageLabels, lines, ...settled, removingCourseId: lines[1].courseId },
        },
    },
    {
        id: "cart-populated-narrow",
        note: "The same settled basket at a phone measure. Whether the fixed artwork track, the name and the price still share a line, and whether the removal stays reachable without the row wrapping.",
        surface: "page",
        page: { state: "ready", props: { labels: pageLabels, lines, ...settled } },
    },
    {
        id: "cart-populated-light",
        note: "The same settled basket in the light theme. The total's rule and the struck original price both depend on tokens that invert.",
        surface: "page",
        page: { state: "ready", props: { labels: pageLabels, lines, ...settled } },
    },
    {
        id: "drawer-populated",
        note: "The same two blocks at the drawer's measure, over the vendor's own panel. No heading inside — the shell already names it.",
        surface: "drawer",
        drawer: {
            state: "ready",
            props: { labels: drawerLabels, isOpen: true, lines, ...settled },
        },
    },
    {
        id: "drawer-empty",
        note: "The overlay's empty state, which is not the page's: there is no header above it to carry the meaning, so the notice is the whole interior.",
        surface: "drawer",
        drawer: { state: "empty", props: { labels: drawerLabels, isOpen: true } },
    },
    {
        id: "checkout-full",
        note: "The payment step as it OPENS: paying at once, no surcharge line, no schedule, and every gateway still available.",
        surface: "checkout",
        checkout: {
            props: {
                labels: checkoutLabels,
                isOpen: true,
                plan: "full",
                subtotal: settled.subtotal,
                savings: settled.savings,
                total: settled.total,
            },
        },
    },
    {
        id: "checkout-instalments",
        note: "Instalments turned on deliberately: the surcharge line appears, the ladder lists three cycles with only the due one marked, the terms state that nothing auto-charges, and the gateways narrow to the domestic pair.",
        surface: "checkout",
        checkout: {
            props: {
                labels: {
                    ...checkoutLabels,
                    gateways: "PayOS · Sepay",
                    action: `${labels.checkout} ${money.format(fixture.installmentOption.cycles[0].amountVnd)}`,
                },
                isOpen: true,
                plan: "instalments",
                subtotal: settled.subtotal,
                savings: settled.savings,
                surcharge: `+${money.format(fixture.installmentOption.totalAmountVnd - fixture.totalChargedVnd)}`,
                total: money.format(fixture.installmentOption.totalAmountVnd),
                cycles,
            },
        },
    },
]
