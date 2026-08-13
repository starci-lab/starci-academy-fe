import { type GraphQLResponse, type PaginationFilters, type SortBy } from "../../types"

/**
 * One row of the course list.
 *
 * Deliberately NOT the back end's full course entity. The entity reaches into dozens of
 * related types, almost none of which a list row renders, and importing it would drag that
 * whole graph into a page that shows a title and a price. The rule is that this type carries
 * exactly the fields the document selects - if a field is added here it must be added to the
 * document in the same edit, and if it is not selected it does not belong here.
 */
export interface CourseRow {
    /** Stable primary key, used as the React key and in every deep link. */
    id: string
    /** Short human-facing identifier shown next to the title. */
    displayId: string
    /** Course title. */
    title: string
    /** URL segment for the course route. */
    slug: string
    /** One-paragraph summary for the card. */
    description: string
    /** Cover image URL; absent when the course has no artwork yet. */
    coverImageUrl?: string
    /** List price before any phase discount, in the smallest currency unit the API uses. */
    originalPrice: number
    /** How many learners have enrolled - the only social-proof number on the card. */
    enrollmentCount: number
    /**
     * Whether the ASKING viewer is enrolled. `null` for a guest, because the server cannot
     * answer the question without a token - which is different from a signed-in viewer who
     * is genuinely not enrolled, and the two must not render the same way.
     */
    isEnrolled?: boolean | null
    /**
     * The course's own promises, in the order it declares them.
     *
     * Selected because the catalog card shows them and nothing else in the payload does: the
     * description is one paragraph of prose, while these are the discrete claims a reader
     * compares between courses. Absent when a course has declared none, which is a real state
     * rather than a loading one.
     */
    valuePropositions?: ReadonlyArray<CourseValueProposition>
}

/** One promise a course makes, as the catalog card lists it. */
export interface CourseValueProposition {
    /** The already-authored claim. */
    text: string
    /** Declaration order, so the card lists them the way the course wrote them. */
    orderIndex: number
}

/** The paginated payload: the window of rows plus the total the window was cut from. */
export interface QueryCoursesPayload {
    /** Total rows matching the filter, across all pages. */
    count: number
    /** The rows on the requested page. */
    data: Array<CourseRow>
}

/** The single `request` argument the `courses` query declares. */
export interface QueryCoursesRequest {
    /** Page window and sort clauses. */
    filters: PaginationFilters<SortBy>
}

/** The response shape of the `courses` query, envelope included. */
export interface QueryCoursesResponse {
    /** The top-level field, wrapping the standard envelope. */
    courses: GraphQLResponse<QueryCoursesPayload>
}
