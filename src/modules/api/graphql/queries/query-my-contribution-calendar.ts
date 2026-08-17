import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import {
    type MyContributionCalendarRequest,
    type QueryMyContributionCalendarResponse,
} from "./types/my-contribution-calendar"

const query1 = gql`
    query MyContributionCalendar($year: Int) {
        myContributionCalendar(year: $year) {
            success
            message
            error
            data { date contents challenges milestones total }
        }
    }
`

/** Selects the current learner contribution calendar in the shared GraphQL executor. */
export enum QueryMyContributionCalendar { Query1 = "query1" }
/** Every supported contribution-calendar document keyed by its public variant. */
export const queryMyContributionCalendarMap: Record<QueryMyContributionCalendar, DocumentNode> = {
    [QueryMyContributionCalendar.Query1]: query1,
}

/** Fetches the authenticated viewer's contribution days for one calendar year. */
export const queryMyContributionCalendar = async ({
    query = QueryMyContributionCalendar.Query1,
    request,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyContributionCalendar, MyContributionCalendarRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyContributionCalendarResponse>({
        query: queryMyContributionCalendarMap[query],
        variables: { year: request?.year ?? null },
    })
}
