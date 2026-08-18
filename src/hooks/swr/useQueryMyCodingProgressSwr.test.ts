/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QUERY_MY_CODING_PROGRESS_SWR_KEY,
    useQueryMyCodingProgressSwr,
} from "./useQueryMyCodingProgressSwr"

/**
 * What these tests guard: the unwrapping, and the fact that this key carries NO viewer even though
 * the answer is personal. That is worth pinning rather than assuming: the hook is written this way
 * today, and a test that says so is what makes a future change to it a decision rather than an
 * accident.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryMyCodingProgress: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("../../modules/api/graphql/queries/query-my-coding-progress", () => ({
    queryMyCodingProgress: mocks.queryMyCodingProgress,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** The progress, trimmed to the fields the document selects. */
const progress = { solvedCount: 12, attemptedCount: 20 }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryMyCodingProgress.mockReset()
    mocks.queryMyCodingProgress.mockResolvedValue({
        data: { myCodingProgress: { success: true, message: "ok", data: progress } },
    })
})

describe("useQueryMyCodingProgressSwr", () => {
    it("reads under one plain key", () => {
        renderHook(() => useQueryMyCodingProgressSwr())
        expect(keyOf()).toBe(QUERY_MY_CODING_PROGRESS_SWR_KEY)
    })

    it("hands back the progress, not the envelope", async () => {
        renderHook(() => useQueryMyCodingProgressSwr())
        await expect(fetcherOf()()).resolves.toEqual(progress)
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyCodingProgress.mockResolvedValue({
            data: { myCodingProgress: { success: false, message: "unauthorised" } },
        })
        renderHook(() => useQueryMyCodingProgressSwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyCodingProgress.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryMyCodingProgressSwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("lets a transport failure through as a rejection rather than as no progress", async () => {
        mocks.queryMyCodingProgress.mockRejectedValue(new Error("offline"))
        renderHook(() => useQueryMyCodingProgressSwr())
        await expect(fetcherOf()()).rejects.toThrow("offline")
    })
})
