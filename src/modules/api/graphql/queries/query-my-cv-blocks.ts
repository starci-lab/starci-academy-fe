import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { QueryMyCvBlocksResponse } from "./types/cv-blocks"

const query1 = gql`
    query MyCvBlocks {
        myCvBlocks {
            success message error
            data { id label blocks style pdfCdnKey createdAt updatedAt }
        }
    }
`

/** Selects authenticated CV-block documents. */
export enum QueryMyCvBlocks { Query1 = "query1" }

/** Supported authenticated CV-block documents. */
export const queryMyCvBlocksMap: Record<QueryMyCvBlocks, DocumentNode> = { [QueryMyCvBlocks.Query1]: query1 }

/** Loads every block-editor CV owned by the signed-in learner. */
export const queryMyCvBlocks = async ({ query = QueryMyCvBlocks.Query1, headers, signal, debug }: QueryParams<QueryMyCvBlocks>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyCvBlocksResponse>({ query: queryMyCvBlocksMap[query], fetchPolicy: "no-cache" })
}
