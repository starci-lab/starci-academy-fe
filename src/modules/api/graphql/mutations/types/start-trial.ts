import { type GraphQLResponse } from "../../types"

/** Result of starting or resolving a course trial. */
export type StartTrialData = {
    readonly isEnrolled: boolean
}

/** Standard GraphQL envelope returned by the start-trial mutation. */
export type MutationStartTrialResponse = {
    readonly startTrial: GraphQLResponse<StartTrialData>
}

/** Course whose preview enrollment should be started. */
export type MutationStartTrialRequest = {
    readonly courseId: string
}
