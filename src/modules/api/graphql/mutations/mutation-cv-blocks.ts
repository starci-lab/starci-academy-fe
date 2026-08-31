import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type {
    CreateCvBlocksRequest,
    MutateCreateCvBlocksResponse,
    MutateRenderCvBlocksResponse,
    MutateRewriteCvBlockResponse,
    MutateUpdateCvBlocksResponse,
    RenderCvBlocksRequest,
    RewriteCvBlockRequest,
    UpdateCvBlocksRequest,
} from "./types/cv-blocks"

const createDocument = gql`
    mutation CreateCvBlocks($request: CreateCvBlocksRequest!) {
        createCvBlocks(request: $request) {
            success message error
            data { id label blocks style pdfCdnKey createdAt updatedAt }
        }
    }
`
const updateDocument = gql`
    mutation UpdateCvBlocks($request: UpdateCvBlocksRequest!) {
        updateCvBlocks(request: $request) {
            success message error
            data { id label blocks style pdfCdnKey createdAt updatedAt }
        }
    }
`
const renderDocument = gql`
    mutation RenderCvBlocks($request: RenderCvBlocksRequest!) {
        renderCvBlocks(request: $request) { success message error data { url cdnKey format } }
    }
`
const rewriteBlock = gql`
    mutation RewriteCvBlock($request: RewriteCvBlockRequest!) {
        rewriteCvBlock(request: $request) { success message error data { block } }
    }
`
/** CV builder mutation documents. */
export enum MutationCvBlocks { Create = "create", Update = "update", Render = "render", Rewrite = "rewrite" }

/** Every mutation document consumed by the CV builder. */
export const mutationCvBlocksMap: Record<MutationCvBlocks, DocumentNode> = {
    [MutationCvBlocks.Create]: createDocument,
    [MutationCvBlocks.Update]: updateDocument,
    [MutationCvBlocks.Render]: renderDocument,
    [MutationCvBlocks.Rewrite]: rewriteBlock,
}

const client = () => createApolloClient({ withAuth: true })

/** Creates one CV document with its initial block schema. */
export const mutationCreateCvBlocks = async ({ request }: MutationParams<MutationCvBlocks, CreateCvBlocksRequest>) => client().mutate<MutateCreateCvBlocksResponse>({ mutation: createDocument, variables: { request } })
/** Autosaves one CV document. */
export const mutationUpdateCvBlocks = async ({ request }: MutationParams<MutationCvBlocks, UpdateCvBlocksRequest>) => client().mutate<MutateUpdateCvBlocksResponse>({ mutation: updateDocument, variables: { request } })
/** Compiles one LaTeX CV to PDF. */
export const mutationRenderCvBlocks = async ({ request }: MutationParams<MutationCvBlocks, RenderCvBlocksRequest>) => client().mutate<MutateRenderCvBlocksResponse>({ mutation: renderDocument, variables: { request } })
/** Rewrites one CV block with AI. */
export const mutationRewriteCvBlock = async ({ request }: MutationParams<MutationCvBlocks, RewriteCvBlockRequest>) => client().mutate<MutateRewriteCvBlockResponse>({ mutation: rewriteBlock, variables: { request } })
