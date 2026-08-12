import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { QueryMyUpcomingLivestreamsResponse } from "./types/dashboard-learning-community"

const document = gql`query MyUpcomingLivestreams { myUpcomingLivestreams { success message error data { courseGlobalId courseTitle courseDisplayId sessionTitle nextStartAt nextEndAt } } }`
export enum QueryMyUpcomingLivestreams { Query1 = "query1" }
/** Fetch the viewer's soonest live sessions. */
export const queryMyUpcomingLivestreams = async ({ headers, signal, debug }: QueryParams<QueryMyUpcomingLivestreams> = {}) => createApolloClient({ withAuth: true, headers, signal, debug }).query<QueryMyUpcomingLivestreamsResponse>({ query: document })
