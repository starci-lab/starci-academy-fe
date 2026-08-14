import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type GraphQLHeaders } from "../types"
import type { SubmitCodingSolutionResponse } from "../queries/types/coding"

const mutation = gql`
    mutation SubmitCodingSolution($request: SubmitCodingSolutionRequest!) {
        submitCodingSolution(request: $request) {
            success
            message
            error
            data {
                submissionId
                jobId
            }
        }
    }
`

/** Behavioural telemetry the server scores an attempt's honesty with. All fields optional. */
export interface SubmitCodingTelemetry {
    pasteCount?: number
    pasteSizeMax?: number
    keystrokeCount?: number
    tabBlurCount?: number
    elapsedMs?: number
}

/** What a submission carries. */
export interface MutationSubmitCodingSolutionRequest {
    slug: string
    language: string
    sourceCode: string
    telemetry?: SubmitCodingTelemetry
}

/**
 * Send a solution for judging.
 *
 * IT DOES NOT RETURN A VERDICT, and a caller written as though it does will wait forever. The
 * response is a `submissionId` and a `jobId`; the verdict arrives later over Socket.IO on that job.
 * That is the server's own documented shape, not a limitation of this client.
 */
/** Transport options, mirroring the shape every other mutation in this folder takes. */
export interface SubmitCodingSolutionOptions {
    headers?: GraphQLHeaders
    signal?: AbortSignal
    debug?: boolean
}

export const mutationSubmitCodingSolution = async (
    request: MutationSubmitCodingSolutionRequest,
    options: SubmitCodingSolutionOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<SubmitCodingSolutionResponse>({ mutation, variables: { request } })
}
