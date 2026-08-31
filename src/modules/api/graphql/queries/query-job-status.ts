import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"

/** Durable lifecycle states exposed by the owner-authorized job query. */
export type AsyncJobStatus = "queued" | "processing" | "completed" | "failed"

/** Safe status fields required by asynchronous product-result surfaces. */
export type AsyncJobStatusItem = {
    readonly jobId: string
    readonly status: AsyncJobStatus
    readonly currentStep: number
    readonly maxSteps: number
    readonly updatedAt: string
    readonly retryable: boolean
    readonly failureReason?: string | null
    readonly result?: { readonly kind: string; readonly id: string } | null
}

type QueryJobStatusResponse = {
    readonly jobStatus: GraphQLResponse<{ readonly job: AsyncJobStatusItem | null }>
}

const jobStatusQuery = gql`
    query JobStatus($request: JobStatusRequest!) {
        jobStatus(request: $request) {
            success
            message
            error
            data {
                job {
                    jobId
                    status
                    currentStep
                    maxSteps
                    updatedAt
                    retryable
                    failureReason
                    result { kind id }
                }
            }
        }
    }
`

/** Reads one durable async job without exposing another viewer's work. */
export const queryJobStatus = async (jobId: string) => {
    const apollo = createApolloClient({ withAuth: true })
    const result = await apollo.query<QueryJobStatusResponse>({
        query: jobStatusQuery,
        variables: { request: { jobId } },
        fetchPolicy: "network-only",
    })
    return result.data?.jobStatus?.data?.job ?? null
}
