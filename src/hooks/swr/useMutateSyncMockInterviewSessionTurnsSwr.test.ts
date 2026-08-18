/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_SYNC_MOCK_INTERVIEW_SESSION_TURNS_SWR_KEY,
    useMutateSyncMockInterviewSessionTurnsSwr,
} from "./useMutateSyncMockInterviewSessionTurnsSwr"

/**
 * What these tests guard: the transcript is persisted per COURSE AND SESSION, so two interviews
 * running at once do not overwrite one another; and the course travels as the enrollment header the
 * backend guard reads rather than being taken from the payload.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever either half
 * is unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({
    useSWRMutation: vi.fn(),
    mutationSyncMockInterviewSessionTurns: vi.fn(),
}))

vi.mock("swr/mutation", () => ({ default: mocks.useSWRMutation }))
vi.mock("../../modules/api/graphql/mutations/mutation-sync-mock-interview-session-turns", () => ({
    mutationSyncMockInterviewSessionTurns: mocks.mutationSyncMockInterviewSessionTurns,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWRMutation.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): ((key: unknown, arg: { arg: unknown }) => Promise<unknown>) =>
    mocks.useSWRMutation.mock.calls.at(-1)?.[1]

/** What the transport answers for a persisted transcript. */
const persisted = {
    data: { syncMockInterviewSessionTurns: { success: true, message: "ok", data: { success: true } } },
}

/** What one persistence write carries. */
const request = {
    sessionId: "session-1",
    turns: [{ role: "user", phase: "requirements", content: "A million reads a day." }],
    questionIndex: 1,
    phaseIndex: 0,
}

beforeEach(() => {
    mocks.useSWRMutation.mockReset().mockReturnValue({ trigger: vi.fn() })
    mocks.mutationSyncMockInterviewSessionTurns.mockReset().mockResolvedValue(persisted)
})

describe("useMutateSyncMockInterviewSessionTurnsSwr", () => {
    it("holds the key null until both the course and the session are known", () => {
        useMutateSyncMockInterviewSessionTurnsSwr()
        expect(keyOf()).toBeNull()

        useMutateSyncMockInterviewSessionTurnsSwr("course-1")
        expect(keyOf()).toBeNull()

        useMutateSyncMockInterviewSessionTurnsSwr(undefined, "session-1")
        expect(keyOf()).toBeNull()
    })

    it("names the course and the session together in the key", () => {
        useMutateSyncMockInterviewSessionTurnsSwr("course-1", "session-1")
        expect(keyOf()).toEqual([
            MUTATE_SYNC_MOCK_INTERVIEW_SESSION_TURNS_SWR_KEY, "course-1", "session-1",
        ])

        useMutateSyncMockInterviewSessionTurnsSwr("course-2", "session-1")
        expect(keyOf()).toEqual([
            MUTATE_SYNC_MOCK_INTERVIEW_SESSION_TURNS_SWR_KEY, "course-2", "session-1",
        ])
    })

    it("sends the turns as given and the course as the enrollment header", async () => {
        useMutateSyncMockInterviewSessionTurnsSwr("course-1", "session-1")

        await expect(fetcherOf()(keyOf(), { arg: request })).resolves.toEqual(persisted)
        expect(mocks.mutationSyncMockInterviewSessionTurns).toHaveBeenCalledWith(
            request,
            { headers: { "X-Course-Id": "course-1" } },
        )
    })

    it("refuses to persist without a course to authorise it", async () => {
        useMutateSyncMockInterviewSessionTurnsSwr(undefined, "session-1")
        await expect(fetcherOf()(null, { arg: request })).rejects.toThrow("Course id not found")
        expect(mocks.mutationSyncMockInterviewSessionTurns).not.toHaveBeenCalled()
    })

    it("lets a transport failure through as a rejection, because persistence is best effort", async () => {
        mocks.mutationSyncMockInterviewSessionTurns.mockRejectedValue(new Error("offline"))
        useMutateSyncMockInterviewSessionTurnsSwr("course-1", "session-1")
        await expect(fetcherOf()(keyOf(), { arg: request })).rejects.toThrow("offline")
    })
})
