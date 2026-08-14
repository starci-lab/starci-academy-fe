import { type GraphQLResponse } from "../../types"

/**
 * The single course, as the detail page selects it.
 *
 * Deliberately NOT the back end's full `CourseEntity`. That type exposes twenty-six fields and
 * reaches into enrollments, translations, flashcard decks, Q&A and livestreams - almost none of
 * which this page draws. The rule is the same one `courses.ts` states: this type carries exactly
 * the fields the document selects, a field added here is added to the document in the same edit,
 * and a field not selected does not belong here.
 */

/** Which pricing phase a course is currently selling in. Mirrors the server's `PricingPhase` enum. */
export type CoursePricingPhase = "pioneer" | "earlyBird" | "regular"

/** How demanding a module is. Mirrors the server's `CourseContentTier` enum. */
export type CourseContentTier = "foundation" | "intermediate" | "advanced"

/** One phase of the price ladder. */
export interface CoursePricingPhaseRow {
    /** Stable key for the ladder row. */
    id: string
    /** Which phase this row is, so the open one can be found without relying on order. */
    phase: CoursePricingPhase
    /** The price this phase sells at, in the smallest unit the API uses. */
    price: number
    /**
     * Seats left in this phase.
     *
     * Selected because the rail's scarcity line is the only thing that reports it, and a number
     * running out is a reason to decide now - which is the one thing a buy box is for.
     */
    slotAvailable: number
    /** Declaration order, so the ladder reads in the sequence the course set. */
    orderIndex: number
}

/**
 * One condition a learner should already meet.
 *
 * Separate from a promise on purpose: a promise is what the course gives and a prerequisite is
 * what it asks for, and a reader scanning for one must not find the other.
 */
export interface CoursePrerequisiteRow {
    /** The requirement as the course wrote it. */
    text: string
    /** Declaration order - the backend stores these ordered, and the order carries meaning. */
    orderIndex: number
}

/** One promise the course makes. */
export interface CourseValueProposition {
    /** The already-authored claim. */
    text: string
    /** Declaration order, so the list reads the way the course wrote it. */
    orderIndex: number
}

/** One authored FAQ row on the public course landing page. */
export interface CourseFaqRow {
    /** Stable key from the backend FAQ entity. */
    id: string
    /** The learner's question. */
    question: string
    /** The course owner's answer. */
    answer: string
    /** Declaration order from the authored course source. */
    orderIndex: number
}

/** One content inside a module. Selected for its COUNTS, not to be listed. */
export interface CourseModuleContent {
    /** Stable key. */
    id: string
    /**
     * How long this content takes to read.
     *
     * Summed across the course into the "hours" trust chip. The legacy page computes it the same
     * way client-side, which is why it is selected rather than asked for as a server total.
     */
    minutesRead: number
    /** How many practice challenges hang off this content; summed into the "challenges" chip. */
    numChallenges: number
}

/** One preview bullet a module publishes before enrolment. */
export interface CourseModulePreview {
    /** Stable key. */
    id: string
    /** The claim itself - this is what the disclosure reveals when a module is opened. */
    text: string
    /** Declaration order. */
    orderIndex: number
}

/** One curriculum module. */
export interface CourseModule {
    /** Stable key. */
    id: string
    /** Module title, shown on the closed row. */
    title: string
    /** Declaration order - modules are ORDERED, and the curriculum renders them as an `ol`. */
    orderIndex: number
    /** Difficulty word shown as the row's badge. */
    contentTier: CourseContentTier
    /** How many contents this module holds; summed into the "contents" chip. */
    numContents: number
    /** The contents, selected for their counts only. */
    contents?: ReadonlyArray<CourseModuleContent>
    /** The preview bullets revealed on open, and whose count the closed row reports. */
    previewContents?: ReadonlyArray<CourseModulePreview>
}

/** The course the detail page draws. */
export interface CourseDetail {
    /** Stable primary key. */
    id: string
    /** Short human-facing identifier; the route segment. */
    displayId: string
    /** Course title - the page's `h1`. */
    title: string
    /** The one paragraph qualifying the title. */
    description: string
    /** Cover artwork; absent when the course has none, and the leaf draws its token fallback. */
    coverImageUrl?: string
    /** List price before any phase discount. */
    originalPrice: number
    /** How many learners have enrolled - the rail's proof line and the "learners" chip. */
    enrollmentCount: number
    /**
     * Whether the ASKING viewer is enrolled. `null` for a guest, because the server cannot answer
     * without a token - which is different from a signed-in viewer who genuinely is not, and the
     * two must not render the same way.
     */
    isEnrolled?: boolean | null
    /** The phase currently selling, which is the price a reader actually pays. */
    currentPhase?: CoursePricingPhase
    /** The promises, in declaration order. */
    valuePropositions?: ReadonlyArray<CourseValueProposition>
    /** The price ladder, in declaration order. */
    pricingPhases?: ReadonlyArray<CoursePricingPhaseRow>
    /** What a learner should already meet, in the order the course stores them. */
    prerequisites?: ReadonlyArray<CoursePrerequisiteRow>
    /** Authored FAQs, in declaration order. */
    qnas?: ReadonlyArray<CourseFaqRow>
    /** The curriculum, in declaration order. */
    modules?: ReadonlyArray<CourseModule>
}

/** The single `request` argument the `course` query declares: an id OR a displayId. */
export interface QueryCourseRequest {
    /** Course id. Omitted when addressing by slug. */
    id?: string
    /** Short human-facing identifier - what the route carries. */
    displayId?: string
}

/** The response shape of the `course` query, envelope included. */
export interface QueryCourseResponse {
    /** The top-level field, wrapping the standard envelope. */
    course: GraphQLResponse<CourseDetail>
}
