/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_JOB_STATUS_SWR_KEY, useQueryJobStatusSwr } from "./useQueryJobStatusSwr"

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryJobStatus: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-job-status", () => ({ queryJobStatus: mocks.queryJobStatus }))

beforeEach(() => {
    setSessionToken("viewer-token")
    mocks.useSWR.mockReset()
    mocks.queryJobStatus.mockReset()
})

describe("useQueryJobStatusSwr", () => {
    it("waits until viewer and job identity are known", () => {
        renderHook(() => useQueryJobStatusSwr())
        expect(mocks.useSWR.mock.calls[0][0]).toBeNull()
    })

    it("binds the viewer and job id and polls only non-terminal jobs", async () => {
        renderHook(() => useQueryJobStatusSwr("job-1"))
        const [key, fetcher, options] = mocks.useSWR.mock.calls[0]
        expect(key).toEqual([QUERY_JOB_STATUS_SWR_KEY, expect.any(String), "job-1"])
        await fetcher()
        expect(mocks.queryJobStatus).toHaveBeenCalledWith("job-1")
        expect(options.refreshInterval({ status: "queued" })).toBe(2000)
        expect(options.refreshInterval({ status: "processing" })).toBe(2000)
        expect(options.refreshInterval({ status: "failed" })).toBe(0)
        expect(options.refreshInterval({ status: "completed" })).toBe(0)
    })
})
