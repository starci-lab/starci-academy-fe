import { type GraphQLResponse } from "../../types"

/**
 * One offered instalment term for the order.
 *
 * `cycles` is NOT here yet. The approved design draws a front-loaded schedule - half at checkout,
 * the rest split across two later cycles - and the server today returns one `monthlyAmountVnd` for
 * an even split. Adding the field to this type before the server sends it would make every caller
 * type-check against a promise nothing keeps.
 */
export type InstallmentOption = {
    /** Number of monthly cycles. */
    readonly months: number
    /** Markup percent this term adds over the discounted price. */
    readonly markupPercent: number
    /** Whole amount owed across the schedule, markup already applied. */
    readonly totalAmountVnd: number
    /** Amount charged each cycle under the server's current even split. */
    readonly monthlyAmountVnd: number
}

/** One priced line of the order. Every amount is already display-ready. */
export type CoursesCheckoutPreviewLine = {
    /** Which course this line prices. */
    readonly courseId: string
    /** The struck list price, in VND. */
    readonly listVnd: number
    /** What the viewer actually pays for this line, in VND. */
    readonly chargedVnd: number
    /** Combined loyalty and bundle reduction for this line. */
    readonly discountPercent: number
}

/**
 * What the whole order costs.
 *
 * EVERY FIGURE IS THE SERVER'S. The totals are summed there, the saving is derived there, and the
 * instalment total already carries its markup. Nothing on this side adds, subtracts or applies a
 * percentage - the legacy drawer re-declared the bundle tiers as client constants and that is the
 * copy nobody edits when the server's changes.
 */
export type CoursesCheckoutPreviewData = {
    /** One entry per purchasable course; already-owned courses are dropped server-side. */
    readonly lines: Array<CoursesCheckoutPreviewLine>
    /** Summed list price across the order. */
    readonly totalListVnd: number
    /** Summed payable price across the order. */
    readonly totalChargedVnd: number
    /** What the order saves against list. */
    readonly savingsVnd: number
    /** The multi-course bonus percent this order earned. */
    readonly bundleBonusPercent: number
    /** How many purchasable lines there are. */
    readonly itemCount: number
    /** Offered instalment terms; empty for a free order. */
    readonly installmentOptions: Array<InstallmentOption>
}

/** Standard GraphQL envelope returned by the checkout-preview query. */
export type QueryCoursesCheckoutPreviewResponse = {
    readonly coursesCheckoutPreview: GraphQLResponse<CoursesCheckoutPreviewData>
}

/** What the caller varies: which courses are being priced together. */
export type QueryCoursesCheckoutPreviewRequest = {
    /** Ids of the cart courses to price as one order. */
    readonly courseIds: Array<string>
}
