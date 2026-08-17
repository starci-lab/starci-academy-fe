import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { QueryMyLeagueResponse } from "./types/dashboard-learning-community"

const document = gql`query MyLeague { myLeague { success message error data { tier weekEndAt promoteCount demoteCount entries { userGlobalId username avatar weekPoints rank rankDelta } } } }`
/** Selects the current learner league in the shared GraphQL executor. */
export enum QueryMyLeague { Query1 = "query1" }
/** Fetch the viewer's weekly cohort standing. */
export const queryMyLeague = async ({ headers, signal, debug }: QueryParams<QueryMyLeague> = {}) => createApolloClient({ withAuth: true, headers, signal, debug }).query<QueryMyLeagueResponse>({ query: document })
