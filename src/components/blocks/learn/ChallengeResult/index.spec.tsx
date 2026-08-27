import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type ResultInput = {
    readonly blockState: string
    readonly props: Record<string, unknown>
    readonly on: Record<string, ((first?: string, second?: string) => void) | undefined>
}

const mocks = vi.hoisted(() => ({
    params: new Map<string, string>(),
    content: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    module: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    attempts: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    submissions: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    feedbacks: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    submit: { trigger: vi.fn() },
    router: { push: vi.fn() },
}))

vi.mock("next/navigation", () => ({
    useSearchParams: () => ({
        get: (key: string) => mocks.params.get(key) ?? null,
        toString: () => new URLSearchParams(Object.fromEntries(mocks.params)).toString(),
    }),
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => mocks.router }))
vi.mock("@/hooks/swr/useQueryContentSwr", () => ({ useQueryContentSwr: () => mocks.content }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryModuleSwr", () => ({ useQueryModuleSwr: () => mocks.module }))
vi.mock("@/hooks/swr/useQueryContentChallengeAttemptsSwr", () => ({ useQueryContentChallengeAttemptsSwr: () => mocks.attempts }))
vi.mock("@/hooks/swr/useQueryContentChallengeSubmissionsSwr", () => ({ useQueryContentChallengeSubmissionsSwr: () => mocks.submissions }))
vi.mock("@/hooks/swr/useQueryContentChallengeFeedbacksSwr", () => ({ useQueryContentChallengeFeedbacksSwr: () => mocks.feedbacks }))
vi.mock("@/hooks/swr/useMutateSubmitContentChallengeSwr", () => ({ useMutateSubmitContentChallengeSwr: () => mocks.submit }))
vi.mock("./component", () => ({
    ChallengeResultBase: ({ blockState, props, on }: ResultInput) => (
        <>
            <output data-testid="state">{blockState}</output>
            <output data-testid="props">{JSON.stringify(props)}</output>
            <button onClick={() => on.reload?.()}>reload</button>
            <button onClick={() => on.retry?.()}>retry</button>
            <button onClick={() => on.next?.()}>next</button>
            <button onClick={() => on.openHistory?.()}>open-history</button>
            <button onClick={() => on.closeHistory?.()}>close-history</button>
            <button onClick={() => on.selectHistoryAttempt?.("attempt-2", "group-2")}>select-group</button>
            <button onClick={() => on.selectHistoryAttempt?.("attempt-3")}>select-single</button>
        </>
    ),
}))

import { ChallengeResultBlock } from "./index"

const route = { displayId: "course", moduleId: "module", contentId: "content", challengeId: "challenge" }
const readyAttempt = {
    id: "attempt-1", attemptGroupId: null, status: "completed", updatedAt: "2026-08-27T00:00:00.000Z",
    score: 80, platformDecision: "passed", confidence: 0.8, shortFeedback: "Good", uncertainty: null,
    nextAction: "Continue", evaluationJobId: "job-1", submissionUrl: "https://github.com/example/repo",
}

beforeEach(() => {
    vi.clearAllMocks()
    mocks.params = new Map([["submission", "submission-1"]])
    mocks.content.data = { challenges: [{ id: "challenge", displayId: "challenge-display", title: "Challenge", description: "Brief", score: 100, submissions: [{ id: "submission-1", title: "Deliverable", score: 100 }] }] }
    mocks.content.error = undefined
    mocks.course.data = { id: "course-1" }
    mocks.course.error = undefined
    mocks.module.data = { contents: [{ id: "content", orderIndex: 1 }, { id: "next", orderIndex: 2 }] }
    mocks.module.error = undefined
    mocks.attempts.data = [readyAttempt]
    mocks.attempts.error = undefined
    mocks.submissions.data = [{ id: "submission-1", score: 100, userSubmission: { submissionUrl: readyAttempt.submissionUrl, lastAttempt: readyAttempt } }]
    mocks.submissions.error = undefined
    mocks.feedbacks.data = [{ id: "feedback", message: "Improve tests", detail: null, severity: "warning", location: null, suggestion: "Add cases", sortIndex: 1 }]
    mocks.feedbacks.error = undefined
    mocks.submit.trigger.mockResolvedValue({})
})

describe("ChallengeResultBlock", () => {
    it("projects a ready result and all navigation/history actions", () => {
        render(<ChallengeResultBlock {...route} />)
        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(screen.getByTestId("props")).toHaveTextContent("80/100")
        expect(screen.getByTestId("props")).toHaveTextContent("challengePassed")
        expect(screen.getByTestId("props")).toHaveTextContent("Improve tests")

        fireEvent.click(screen.getByText("next"))
        fireEvent.click(screen.getByText("retry"))
        fireEvent.click(screen.getByText("open-history"))
        expect(screen.getByTestId("props")).toHaveTextContent("\"isHistoryOpen\":true")
        fireEvent.click(screen.getByText("close-history"))
        fireEvent.click(screen.getByText("select-group"))
        fireEvent.click(screen.getByText("select-single"))

        expect(mocks.router.push).toHaveBeenCalledWith(expect.stringContaining("/contents/next"))
        expect(mocks.router.push).toHaveBeenCalledWith(expect.stringContaining("/challenges/challenge"))
        expect(mocks.router.push).toHaveBeenCalledWith(expect.stringContaining("attempt=attempt-2"))
        expect(mocks.router.push).toHaveBeenCalledWith(expect.stringContaining("attempt=attempt-3"))
    })

    it("retries unavailable evaluation with the immutable job identity", async () => {
        const unavailableAttempt = { ...readyAttempt, status: "evaluation_unavailable", platformDecision: null, score: null, attemptGroupId: "group-1" }
        mocks.attempts.data = [unavailableAttempt]
        mocks.submissions.data = [{ id: "submission-1", score: 100, userSubmission: { submissionUrl: unavailableAttempt.submissionUrl, lastAttempt: unavailableAttempt } }]
        render(<ChallengeResultBlock {...route} />)
        expect(screen.getByTestId("state")).toHaveTextContent("unavailable")
        fireEvent.click(screen.getByText("reload"))

        await waitFor(() => expect(mocks.submit.trigger).toHaveBeenCalledWith({
            courseId: "course-1",
            request: {
                challengeSubmissionId: "submission-1",
                githubUrl: unavailableAttempt.submissionUrl,
                idempotencyKey: "job-1",
                attemptGroupId: "group-1",
            },
        }))
        expect(mocks.attempts.mutate).toHaveBeenCalled()
        expect(mocks.submissions.mutate).toHaveBeenCalled()
        expect(mocks.feedbacks.mutate).toHaveBeenCalled()
    })

    it("distinguishes pending and failed loading and reloads every owner", async () => {
        mocks.attempts.data = undefined
        mocks.submissions.data = undefined
        mocks.feedbacks.data = undefined
        const view = render(<ChallengeResultBlock {...route} />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")

        mocks.attempts.data = [readyAttempt]
        mocks.submissions.data = [{ id: "submission-1", score: 100, userSubmission: { lastAttempt: readyAttempt } }]
        mocks.feedbacks.data = []
        mocks.content.error = new Error("offline")
        view.rerender(<ChallengeResultBlock {...route} />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        expect(screen.getByTestId("props")).toHaveTextContent("offline")
        fireEvent.click(screen.getByText("reload"))
        await waitFor(() => expect(mocks.content.mutate).toHaveBeenCalled())
        expect(mocks.course.mutate).toHaveBeenCalled()
        expect(mocks.module.mutate).toHaveBeenCalled()
    })
})
