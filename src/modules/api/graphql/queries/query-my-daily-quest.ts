import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyDailyQuestResponse } from "./types/my-daily-quest"

/**
 * The asking learner's quest for today: the tasks, and whether the day has been collected for.
 *
 * THE DAY COMES FROM THE SERVER, not from the browser's clock. A quest is bounded by a calendar
 * day, and a client deciding which day it is would roll the board over at midnight in the reader's
 * own zone while the server was still counting yesterday. Required-auth, so the client always
 * carries the token.
 */
const query1 = gql`
    query MyDailyQuest {
        myDailyQuest {
            success
            message
            error
            data {
                date
                allDone
                claimed
                reward
                tasks {
                    key
                    current
                    target
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyDailyQuest {
    /** The day, its tasks, and the reward's standing. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyDailyQuestMap: Record<QueryMyDailyQuest, DocumentNode> = {
    [QueryMyDailyQuest.Query1]: query1,
}

/** Fetches the asking learner's daily quest. Always sends the bearer token. */
export const queryMyDailyQuest = async ({
    query = QueryMyDailyQuest.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyDailyQuest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyDailyQuestResponse>({
        query: queryMyDailyQuestMap[query],
    })
}
