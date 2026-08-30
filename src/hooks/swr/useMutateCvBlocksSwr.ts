import useSWRMutation from "swr/mutation"
import {
    mutationCreateCvBlocks,
    mutationRenderCvBlocks,
    mutationRewriteCvBlock,
    mutationSetCvBlocksPublic,
    mutationUpdateCvBlocks,
} from "@/modules/api/graphql/mutations/mutation-cv-blocks"
import type {
    CreateCvBlocksRequest,
    RenderCvBlocksRequest,
    RewriteCvBlockRequest,
    SetCvBlocksPublicRequest,
    UpdateCvBlocksRequest,
} from "@/modules/api/graphql/mutations/types/cv-blocks"

type Trigger<T> = { readonly arg: T }

/** Creates one block-editor CV. */
export const useMutateCreateCvBlocksSwr = () => useSWRMutation("MUTATE_CREATE_CV_BLOCKS_SWR", (_key: string, { arg }: Trigger<CreateCvBlocksRequest>) => mutationCreateCvBlocks({ request: arg }))
/** Autosaves one block-editor CV. */
export const useMutateUpdateCvBlocksSwr = () => useSWRMutation("MUTATE_UPDATE_CV_BLOCKS_SWR", (_key: string, { arg }: Trigger<UpdateCvBlocksRequest>) => mutationUpdateCvBlocks({ request: arg }))
/** Compiles a CV's current LaTeX source. */
export const useMutateRenderCvBlocksSwr = () => useSWRMutation("MUTATE_RENDER_CV_BLOCKS_SWR", (_key: string, { arg }: Trigger<RenderCvBlocksRequest>) => mutationRenderCvBlocks({ request: arg }))
/** Rewrites one CV block without blocking sibling sections. */
export const useMutateRewriteCvBlockSwr = () => useSWRMutation("MUTATE_REWRITE_CV_BLOCK_SWR", (_key: string, { arg }: Trigger<RewriteCvBlockRequest>) => mutationRewriteCvBlock({ request: arg }))
/** Chooses whether one CV is the learner's public version. */
export const useMutateSetCvBlocksPublicSwr = () => useSWRMutation("MUTATE_SET_CV_BLOCKS_PUBLIC_SWR", (_key: string, { arg }: Trigger<SetCvBlocksPublicRequest>) => mutationSetCvBlocksPublic({ request: arg }))
