import type { GraphQLResponse } from "../../types"
import type { CvBlock, CvDocument, CvStyle } from "@/modules/types/cv"

/** Creates one learner-owned CV document. */
export type CreateCvBlocksRequest = {
    readonly label?: string
    readonly blocks?: ReadonlyArray<CvBlock>
    readonly style?: CvStyle
}

/** Autosaves a learner-owned CV document. */
export type UpdateCvBlocksRequest = {
    readonly id: string
    readonly label?: string
    readonly blocks?: ReadonlyArray<CvBlock>
    readonly style?: CvStyle
}

/** Compiles raw LaTeX and persists the generated artifact. */
export type RenderCvBlocksRequest = {
    readonly id: string
    readonly tex: string
    readonly format?: "pdf"
}

/** AI-assisted rewrite of one block. */
export type RewriteCvBlockRequest = {
    readonly block: CvBlock
    readonly capstoneAttemptId?: string
    readonly instruction?: string
}

/** Selects the one CV visible on the public profile. */
export type SetCvBlocksPublicRequest = { readonly id: string; readonly isPublic: boolean }

/** CV create response. */
export type MutateCreateCvBlocksResponse = { readonly createCvBlocks: GraphQLResponse<CvDocument> }
/** CV update response. */
export type MutateUpdateCvBlocksResponse = { readonly updateCvBlocks: GraphQLResponse<CvDocument> }
/** CV compile response. */
export type MutateRenderCvBlocksResponse = { readonly renderCvBlocks: GraphQLResponse<{ readonly url: string; readonly cdnKey: string; readonly format: "pdf" }> }
/** CV AI rewrite response. */
export type MutateRewriteCvBlockResponse = { readonly rewriteCvBlock: GraphQLResponse<{ readonly block: CvBlock }> }
/** CV public-state response. */
export type MutateSetCvBlocksPublicResponse = { readonly setCvBlocksPublic: GraphQLResponse<{ readonly id: string; readonly isPublic: boolean }> }
