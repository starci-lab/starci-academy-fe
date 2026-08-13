import { type GraphQLResponse } from "../../types"

/**
 * What one course costs THIS viewer, and why.
 *
 * Deliberately narrower than the server's own preview type, which also carries instalment plans,
 * USD prices and voucher arithmetic. The rule is the one the course list already follows: this type
 * carries exactly the fields the document selects, and a field added here is added to the document
 * in the same edit.
 *
 * IT IS A PER-VIEWER ANSWER, which is why it is not part of the catalog list. The loyalty discount
 * depends on how many courses the asking learner already joined, so the server answers it behind a
 * token and cannot answer it at all for a guest.
 */
export interface CoursePricePreview {
    /** The list price, before any phase or loyalty reduction. */
    originalPriceVnd: number
    /** What the current selling phase charges, before loyalty. */
    phasePriceVnd: number
    /** What this viewer actually pays. */
    discountedPriceVnd: number
    /** How far below the list price that lands, as a whole percentage. */
    discountPercent: number
    /**
     * Why the reduction exists. The wire names are the enum VALUES, not the identifiers:
     * `createEnumType` republishes the backend enum keyed by its own values before registering it.
     */
    discountReason: "none" | "enrolledCount" | "diligent" | "both"
    /** How many courses this learner already joined; the loyalty tier reads from it. */
    enrolledCount: number
    /** The phase now selling. */
    currentPhase: string
    /** The phase after it, when one is scheduled. */
    nextPhase?: string | null
    /** Seats left before the current phase closes, when the phase is seat-bounded. */
    seatsRemainingInCurrentPhase?: number | null
    /** What the next phase will charge, when one is scheduled. */
    nextPhasePriceVnd?: number | null
}

/** The envelope the query returns. */
export interface QueryCoursePricePreviewResponse {
    coursePricePreview: GraphQLResponse<CoursePricePreview>
}

/** What the caller varies: which course, and optionally a voucher to preview on top. */
export interface QueryCoursePricePreviewRequest {
    /** Course to price. */
    courseId: string
}
