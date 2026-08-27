/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { useQueryContentChallengeSubmissionsSwr } from "./useQueryContentChallengeSubmissionsSwr"

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), query: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-content-challenge-submissions", () => ({
    queryContentChallengeSubmissions: mocks.query,
}))

const intervalFor = (data: unknown): number => {
    const options = mocks.useSWR.mock.calls.at(-1)?.[2] as {
        refreshInterval: (rows: unknown) => number
    }
    return options.refreshInterval(data)
}

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.query.mockReset()
})

describe("useQueryContentChallengeSubmissionsSwr", () => {
    it("polls evaluating drafts only while the realtime channel is unavailable", () => {
        const evaluating = [{ userSubmission: { lastAttempt: { status: "evaluating" } } }]
        renderHook(() => useQueryContentChallengeSubmissionsSwr("course-1", "challenge-1"))
        expect(intervalFor(evaluating)).toBe(3_000)

        renderHook(() => useQueryContentChallengeSubmissionsSwr("course-1", "challenge-1", true))
        expect(intervalFor(evaluating)).toBe(0)
    })
})
