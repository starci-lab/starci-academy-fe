import { type GraphQLResponse } from "../../types"

/**
 * One thing the learner can pick back up: a lesson they were reading, or a challenge they
 * started and have not passed.
 *
 * TWO FIELDS, AND THE BACK END OFFERS NO MORE. Both `myLearnedLessons` and
 * `myInProgressChallenges` answer with the same reference shape - an opaque id and an
 * already-resolved label - which is why one interface serves both and why the KIND cannot be
 * read off a row. It is known from WHICH query returned it, and nowhere else.
 */
export interface MyResumeRefRow {
    /** Opaque identifier; the React key, and what a route is resolved from. */
    globalId: string
    /** The lesson or challenge title, already resolved by the server. */
    label: string
}

/**
 * The response shape of the `myLearnedLessons` query, envelope included.
 *
 * A bare list, newest first, of what the asking learner has been reading. Empty means "nothing
 * read yet", which is a real answer: it is what a learner who has enrolled and not started looks
 * like, and it is not the same as the request having failed.
 */
export interface QueryMyLearnedLessonsResponse {
    /** The top-level field, wrapping the standard envelope. */
    myLearnedLessons: GraphQLResponse<Array<MyResumeRefRow>>
}

/**
 * The response shape of the `myInProgressChallenges` query, envelope included.
 *
 * Started and not yet passed - so a challenge leaves this list by being finished, and an empty
 * list is as often "nothing is outstanding" as it is "nothing was attempted".
 */
export interface QueryMyInProgressChallengesResponse {
    /** The top-level field, wrapping the standard envelope. */
    myInProgressChallenges: GraphQLResponse<Array<MyResumeRefRow>>
}
