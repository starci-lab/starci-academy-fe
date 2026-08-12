import { type GraphQLResponse } from "../../types"

/** One active calendar day and its contribution counts. */
export type MyContributionDay = {
    readonly date: string
    readonly contents: number
    readonly challenges: number
    readonly milestones: number
    readonly total: number
}

/** Optional year filter understood by the contribution-calendar query. */
export type MyContributionCalendarRequest = {
    readonly year?: number
}

/** Standard GraphQL envelope returned by the self-scoped calendar query. */
export type QueryMyContributionCalendarResponse = {
    readonly myContributionCalendar: GraphQLResponse<Array<MyContributionDay>>
}
