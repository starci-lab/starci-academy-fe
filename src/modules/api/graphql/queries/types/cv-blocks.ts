import type { GraphQLResponse } from "../../types"
import type { CvDocument } from "@/modules/types/cv"

/** Authenticated CV-document list response. */
export type QueryMyCvBlocksResponse = {
    readonly myCvBlocks: GraphQLResponse<ReadonlyArray<CvDocument>>
}
