import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import {
    mutationStartMockInterviewSession,
    startMockInterviewSessionDocument,
} from "./mutation-start-mock-interview-session"
import {
    gradeMockInterviewSessionDocument,
    mutationGradeMockInterviewSession,
} from "./mutation-grade-mock-interview-session"
import {
    mutationSyncMockInterviewSessionTurns,
    syncMockInterviewSessionTurnsDocument,
} from "./mutation-sync-mock-interview-session-turns"
import {
    abandonMockInterviewSessionDocument,
    completeMockInterviewSessionDocument,
    mutationAbandonMockInterviewSession,
    mutationCompleteMockInterviewSession,
    mutationRetryMockInterviewSessionGrading,
    retryMockInterviewSessionGradingDocument,
} from "./mutation-mock-interview-session-lifecycle"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ mutate: mocks.mutate })
})

describe("mutationStartMockInterviewSession", () => {
    it("selects the durable session identity, the deadline and the question seed", () => {
        const document = print(startMockInterviewSessionDocument)
        expect(document).toContain("startMockInterviewSession(request: $request)")
        expect(document).toContain("sessionId")
        expect(document).toContain("deadlineAt")
        expect(document).toContain("seedTopics {")
        expect(document).toContain("givenCodes {")
    })

    it("draws a session on an authenticated client when transport options are omitted", async () => {
        const request = { courseId: "course-1", level: "mid", mode: "voice" }
        await mutationStartMockInterviewSession(request)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: startMockInterviewSessionDocument,
            variables: { request },
        })
    })

    it("carries the full draw configuration and merges supplied transport options", async () => {
        const signal = new AbortController().signal
        const request = {
            courseId: "course-1",
            level: "senior",
            mode: "text",
            lang: "vi",
            langs: ["vi", "en"],
            questionCount: 6,
            kinds: ["system-design"],
            countsToReadiness: true,
            name: "Vòng 1",
        }
        await mutationStartMockInterviewSession(request, { headers: { "x-trace": "draw" }, signal, debug: true })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace": "draw" },
            signal,
            debug: true,
        })
    })

    it("returns the draw envelope unchanged", async () => {
        mocks.mutate.mockResolvedValue({
            data: { startMockInterviewSession: { success: true, message: "ok", data: { sessionId: "s-1" } } },
        })
        await expect(
            mutationStartMockInterviewSession({ courseId: "course-1", level: "mid", mode: "voice" }),
        ).resolves.toEqual({
            data: { startMockInterviewSession: { success: true, message: "ok", data: { sessionId: "s-1" } } },
        })
    })
})

describe("mutationGradeMockInterviewSession", () => {
    it("selects the phase, attribute and per-question review breakdown the report renders", () => {
        const document = print(gradeMockInterviewSessionDocument)
        expect(document).toContain("gradeMockInterviewSession(request: $request)")
        expect(document).toContain("phaseScores {")
        expect(document).toContain("attributeScores {")
        expect(document).toContain("questionReviews {")
        expect(document).toContain("matchedContentIds")
        expect(document).toContain("followUpQuestion")
    })

    it("grades a minimal transcript on an authenticated client when options are omitted", async () => {
        const request = {
            courseId: "course-1",
            promptId: "prompt-1",
            promptTitle: "Design a feed",
            sessionId: "s-1",
            turns: [{ role: "user", phase: "intro", content: "Hello" }],
        }
        await mutationGradeMockInterviewSession(request)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: gradeMockInterviewSessionDocument,
            variables: { request },
        })
    })

    it("carries the level and model selection and merges transport options", async () => {
        const request = {
            courseId: "course-1",
            promptId: "prompt-1",
            promptTitle: "Design a feed",
            level: "senior",
            sessionId: "s-1",
            turns: [{ role: "assistant", phase: "deep-dive", content: "Why sharding?", questionIndex: 2 }],
            selectedModel: "qwen3",
            selectedModelProvider: "local",
        }
        await mutationGradeMockInterviewSession(request, { debug: true })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true, debug: true })
    })

    it("propagates a grading failure to the report surface", async () => {
        mocks.mutate.mockRejectedValue(new Error("model unavailable"))
        await expect(
            mutationGradeMockInterviewSession({
                courseId: "course-1",
                promptId: "prompt-1",
                promptTitle: "Design a feed",
                sessionId: "s-1",
                turns: [],
            }),
        ).rejects.toThrow("model unavailable")
    })
})

describe("mutationSyncMockInterviewSessionTurns", () => {
    it("selects the authoritative revision and transcript snapshot", () => {
        const document = print(syncMockInterviewSessionTurnsDocument)
        expect(document).toContain("syncMockInterviewSessionTurns(request: $request)")
        expect(document).toContain("data {")
        expect(document).toContain("conflict")
        expect(document).toContain("revision")
        expect(document).toContain("turns {")
    })

    it("persists the transcript and both resume cursors on an authenticated client", async () => {
        const request = {
            sessionId: "s-1",
            turns: [{ role: "user", phase: "intro", content: "Hi", artifactHint: null }],
            questionIndex: 1,
            phaseIndex: 0,
        }
        await mutationSyncMockInterviewSessionTurns(request)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: true })
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: syncMockInterviewSessionTurnsDocument,
            variables: { request },
        })
    })

    it("strips Apollo cache metadata from restored turns before mutation serialization", async () => {
        const request = {
            sessionId: "s-1",
            expectedRevision: 2,
            turns: [{
                role: "interviewer",
                phase: "requirements",
                content: "Explain the trade-off",
                questionIndex: 0,
                artifactHint: null,
                __typename: "MyInProgressMockInterviewSessionTurnItem",
            }],
            questionIndex: 0,
            phaseIndex: 0,
        }

        await mutationSyncMockInterviewSessionTurns(request)

        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: syncMockInterviewSessionTurnsDocument,
            variables: {
                request: {
                    sessionId: "s-1",
                    expectedRevision: 2,
                    turns: [{
                        role: "interviewer",
                        phase: "requirements",
                        content: "Explain the trade-off",
                        questionIndex: 0,
                        artifactHint: null,
                    }],
                    questionIndex: 0,
                    phaseIndex: 0,
                },
            },
        })
    })

    it("merges transport options on the periodic write", async () => {
        const signal = new AbortController().signal
        await mutationSyncMockInterviewSessionTurns(
            { sessionId: "s-1", turns: [], questionIndex: 0, phaseIndex: 0 },
            { headers: { "x-trace": "sync" }, signal },
        )
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace": "sync" },
            signal,
        })
    })

    it("returns the acknowledgement envelope unchanged", async () => {
        mocks.mutate.mockResolvedValue({
            data: { syncMockInterviewSessionTurns: { success: true, message: "ok", data: { success: true } } },
        })
        await expect(
            mutationSyncMockInterviewSessionTurns({ sessionId: "s-1", turns: [], questionIndex: 0, phaseIndex: 0 }),
        ).resolves.toEqual({
            data: { syncMockInterviewSessionTurns: { success: true, message: "ok", data: { success: true } } },
        })
    })
})

describe("mock interview lifecycle mutations", () => {
    it("selects durable state for complete, abandon and grading retry", () => {
        expect(print(completeMockInterviewSessionDocument)).toContain("gradingJobId")
        expect(print(completeMockInterviewSessionDocument)).toContain("revision")
        expect(print(abandonMockInterviewSessionDocument)).toContain("status")
        expect(print(retryMockInterviewSessionGradingDocument)).toContain("gradingJobId")
    })

    it("sends each optimistic lifecycle command unchanged", async () => {
        const request = { courseId: "course-1", sessionId: "s-1", expectedRevision: 4 }

        await mutationCompleteMockInterviewSession(request)
        await mutationAbandonMockInterviewSession(request)
        await mutationRetryMockInterviewSessionGrading(request)

        expect(mocks.mutate).toHaveBeenNthCalledWith(1, {
            mutation: completeMockInterviewSessionDocument,
            variables: { request },
        })
        expect(mocks.mutate).toHaveBeenNthCalledWith(2, {
            mutation: abandonMockInterviewSessionDocument,
            variables: { request },
        })
        expect(mocks.mutate).toHaveBeenNthCalledWith(3, {
            mutation: retryMockInterviewSessionGradingDocument,
            variables: { request },
        })
    })
})
