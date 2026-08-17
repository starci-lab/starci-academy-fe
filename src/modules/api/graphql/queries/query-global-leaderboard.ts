import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { QueryGlobalLeaderboardResponse } from "./types/dashboard-learning-community"

const document = gql`query GlobalLeaderboard { globalLeaderboard { success message error data { myRank myPoints entries { userGlobalId username avatar points rank isFollowing } } } }`
/** Selects the global learner leaderboard in the shared GraphQL executor. */
export enum QueryGlobalLeaderboard { Query1 = "query1" }
/** Fetch top global learners and the viewer's standing. */
export const queryGlobalLeaderboard = async ({ headers, signal, debug }: QueryParams<QueryGlobalLeaderboard> = {}) => createApolloClient({ withAuth: true, headers, signal, debug }).query<QueryGlobalLeaderboardResponse>({ query: document })
