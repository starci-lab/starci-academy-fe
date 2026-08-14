import type { CoursePrerequisiteData } from "./blocks/CoursePrerequisiteList"
import type { CourseReviewData } from "./blocks/CourseReviewBlock"

/** What one rendered state claims, and what it needs to draw it. */
export interface CandidateState {
    /** Stable id; also the route segment. */
    readonly id: string
    /** The owner this state belongs to - coverage is classified by owner, not by page. */
    readonly owner: string
    /** What a reader should be able to check by looking at it. */
    readonly claim: string
    /** The prerequisites this state draws, if it draws any. */
    readonly prerequisites?: ReadonlyArray<CoursePrerequisiteData>
    /** The reviews this state draws, if it draws any. */
    readonly reviews?: ReadonlyArray<CourseReviewData>
    /** Mean across the whole population, which the projection serves. */
    readonly averageScore?: number
    /** How many reviews exist in total, across every page. */
    readonly total?: number
}

/** Three requirements, in the order the backend stores them. */
const PREREQUISITES: ReadonlyArray<CoursePrerequisiteData> = [
    { id: "p1", requirement: "Biet mot ngon ngu lap trinh o muc co ban" },
    { id: "p2", requirement: "Da tung dung git va dong lenh" },
    { id: "p3", requirement: "Doc hieu tai lieu ky thuat bang tieng Anh" },
]

/** Two reviews by the same learner, which the backend permits on purpose. */
const REVIEWS: ReadonlyArray<CourseReviewData> = [
    { id: "r1", author: "Minh", score: 5, body: "Module caching mot minh no da dang tien." },
    { id: "r2", author: "Lan", score: 4, body: "Hai module cuoi hoi luot, con lai rat chac." },
    { id: "r3", author: "Minh", score: 3 },
]

/**
 * The states this candidate renders, one per thing that can actually change.
 *
 * Classified by OWNER rather than by page: the page has one shape and its regions have several, so
 * a page-level checklist would render the same screen four times and prove nothing about the
 * region that varies. The scoreless review is deliberate - the backend makes the body optional, so
 * a row with no prose is a state the list must survive rather than an edge case.
 */
export const STATES: ReadonlyArray<CandidateState> = [
    {
        id: "reviews-populated",
        owner: "course-review-block",
        claim: "A rated course: the mean comes from the projection, not from the rows on screen, and the third review carries a score with no body.",
        reviews: REVIEWS,
        averageScore: 4.2,
        total: 18,
    },
    {
        id: "reviews-empty",
        owner: "course-review-block",
        claim: "A course nobody has reviewed. The projection answers zero rather than null, so the region must read as new rather than as broken - this is the open question the review is meant to settle.",
        reviews: [],
        averageScore: 0,
        total: 0,
    },
    {
        id: "prerequisites-present",
        owner: "course-prerequisite-list",
        claim: "Ordered requirements, numbered in the text rather than by the browser marker, because the list owns p-0 and its rows own the inset.",
        prerequisites: PREREQUISITES,
    },
    {
        id: "prerequisites-absent",
        owner: "course-prerequisite-list",
        claim: "A course with no prerequisites. The region is absent rather than an empty card, because an empty joined list draws a border around nothing.",
        prerequisites: [],
    },
]
