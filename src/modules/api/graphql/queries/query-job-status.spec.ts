import { print } from "graphql"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { queryJobStatus } from "./query-job-status"

const mocks = vi.hoisted(() => ({ createApolloClient: vi.fn(), query: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset()
    mocks.createApolloClient.mockReset()
    mocks.createApolloClient.mockReturnValue({ query: mocks.query })
})

describe("queryJobStatus", () => {
    it("reads the durable lifecycle and terminal recovery fields for one owned job", async () => {
        const job = { jobId: "job-1", status: "failed", retryable: true, failureReason: "Repository not found" }
        mocks.query.mockResolvedValue({ data: { jobStatus: { success: true, data: { job } } } })

        await expect(queryJobStatus("job-1")).resolves.toEqual(job)
        const operation = mocks.query.mock.calls[0][0]
        expect(print(operation.query)).toContain("query JobStatus")
        expect(print(operation.query)).toContain("failureReason")
        expect(print(operation.query)).toContain("result")
        expect(operation.variables).toEqual({ request: { jobId: "job-1" } })
        expect(operation.fetchPolicy).toBe("network-only")
    })

    it("returns null for an absent or foreign job", async () => {
        mocks.query.mockResolvedValue({ data: { jobStatus: { success: true, data: { job: null } } } })
        await expect(queryJobStatus("missing")).resolves.toBeNull()
    })
})
