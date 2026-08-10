import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyLearnedLessonsResponse } from "./types/my-resume"

/**
 * The lessons the asking learner has been reading, newest first.
 *
 * TWO FIELDS ARE SELECTED BECAUSE TWO ARE RENDERED. The reference carries an id and a label and
 * that is the whole of it - a resume card shows the title and goes somewhere when pressed, so
 * there is nothing else to ask for. Required-auth: the answer is the reader's own history, so the
 * client always carries the token.
 */
const query1 = gql`
    query MyLearnedLessons {
        myLearnedLessons {
            success
            message
            error
            data {
                globalId
                label
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyLearnedLessons {
    /** The lessons themselves, newest first. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyLearnedLessonsMap: Record<QueryMyLearnedLessons, DocumentNode> = {
    [QueryMyLearnedLessons.Query1]: query1,
}

/** Fetches the lessons the asking learner recently read. Always sends the bearer token. */
export const queryMyLearnedLessons = async ({
    query = QueryMyLearnedLessons.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyLearnedLessons> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyLearnedLessonsResponse>({
        query: queryMyLearnedLessonsMap[query],
    })
}
