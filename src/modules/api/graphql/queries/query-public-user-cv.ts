import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { LookupQueryParams } from "../types"
import type { QueryPublicUserCvResponse } from "./types/user-profile"

/** Public CV username lookup variables. */
export type PublicUserCvRequest = { readonly username: string }

const query1 = gql`
    query PublicUserCv($username: String!) {
        publicUserCv(username: $username) {
            success
            message
            error
            data { id label pdfUrl updatedAt }
        }
    }
`

export enum QueryPublicUserCv { Query1 = "query1" }

/** Supported public-CV documents. */
export const queryPublicUserCvMap: Record<QueryPublicUserCv, DocumentNode> = {
    [QueryPublicUserCv.Query1]: query1,
}

/** Resolve the one CV a profile owner marked public. */
export const queryPublicUserCv = async ({
    query = QueryPublicUserCv.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryPublicUserCv, PublicUserCvRequest>) => {
    const apollo = createApolloClient({ withAuth: false, headers, signal, debug })
    return apollo.query<QueryPublicUserCvResponse, PublicUserCvRequest>({
        query: queryPublicUserCvMap[query],
        variables: request,
        fetchPolicy: "no-cache",
    })
}
