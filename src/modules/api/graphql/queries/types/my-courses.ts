import { type GraphQLResponse } from "../../types"

/**
 * One enrolled course, as the dashboard progress list reads it.
 *
 * The back end's `MyCourseItemData` carries eleven fields - the content and challenge
 * counters, the thumbnail, the enrolment flag. Three are selected, because three are
 * rendered. The rest describe a card this surface does not draw, and a field selected but
 * unread is a field the next author has to check before changing anything upstream.
 */
export interface MyCourseRow {
    /** Opaque identifier of the course; the React key and the deep-link segment. */
    globalId: string
    /** Course title, already resolved by the server. */
    label: string
    /**
     * Overall completion, 0 to 100, aggregated by the server across content and challenges.
     * It is a whole number: the back end declares it `Int`, so no rounding happens here.
     */
    completionPercent: number
    thumbnailUrl?: string | null
    contentCompleted?: number
    contentTotal?: number
    challengeCompleted?: number
    challengeTotal?: number
    completed?: number
    total?: number
    isEnrolled?: boolean
}

/**
 * The response shape of the `myCourses` query, envelope included.
 *
 * The payload is a bare LIST rather than a paginated window - the query takes no arguments
 * and answers with every course the asking learner is enrolled in. An empty array therefore
 * means "enrolled in nothing", which is a real answer and not a missing one.
 */
export interface QueryMyCoursesResponse {
    /** The top-level field, wrapping the standard envelope. */
    myCourses: GraphQLResponse<Array<MyCourseRow>>
}
