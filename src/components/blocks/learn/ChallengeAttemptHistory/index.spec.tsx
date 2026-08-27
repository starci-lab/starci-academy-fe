import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    query: { data: undefined as unknown, error: undefined as unknown },
    select: vi.fn(),
}))

type HistoryBaseInput = {
    readonly state: string
    readonly attempts: ReadonlyArray<{ readonly id: string; readonly outcome: string; readonly processedAt?: string }>
    readonly labels: { readonly attempt: (number: number, score?: number) => string }
    readonly onSelect?: (attempt: { readonly id: string }) => void
}

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string, values?: Record<string, unknown>) => `${key}:${JSON.stringify(values ?? {})}`,
}))
vi.mock("@/hooks/swr/useQueryContentChallengeAttemptsSwr", () => ({
    useQueryContentChallengeAttemptsSwr: () => mocks.query,
}))
vi.mock("./component", () => ({
    ChallengeAttemptHistoryBase: (input: HistoryBaseInput) => (
        <>
            <output data-testid="state">{input.state}</output>
            <output data-testid="attempts">{JSON.stringify(input.attempts)}</output>
            <output data-testid="labels">{input.labels.attempt(1)}|{input.labels.attempt(2, 90)}</output>
            <button onClick={() => input.onSelect?.(input.attempts[0]!)}>select</button>
        </>
    ),
}))

import { ChallengeAttemptHistory } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.query.data = undefined
    mocks.query.error = undefined
})

describe("ChallengeAttemptHistory", () => {
    it("maps every attempt outcome and preserves selection", () => {
        mocks.query.data = [
            { id: "a", attemptGroupId: null, attemptNumber: 1, score: null, status: "evaluating", platformDecision: null, servedModel: null, processedAt: null },
            { id: "b", attemptGroupId: "g", attemptNumber: 2, score: 90, status: "evaluation_unavailable", platformDecision: null, servedModel: "model", processedAt: "2026-08-27T00:00:00.000Z" },
            { id: "c", attemptGroupId: "g", attemptNumber: 3, score: 80, status: "completed", platformDecision: "passed", servedModel: "model", processedAt: "2026-08-27T00:00:00.000Z" },
            { id: "d", attemptGroupId: "g", attemptNumber: 4, score: 40, status: "completed", platformDecision: "needs_revision", servedModel: "model", processedAt: "2026-08-27T00:00:00.000Z" },
        ]
        render(<ChallengeAttemptHistory courseId="course" submissionId="submission" onSelect={mocks.select} />)

        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        expect(screen.getByTestId("attempts")).toHaveTextContent("evaluating")
        expect(screen.getByTestId("attempts")).toHaveTextContent("unavailable")
        expect(screen.getByTestId("attempts")).toHaveTextContent("passed")
        expect(screen.getByTestId("attempts")).toHaveTextContent("needsRevision")
        expect(screen.getByTestId("labels")).toHaveTextContent("challengeHistoryAttemptPending")
        fireEvent.click(screen.getByText("select"))
        expect(mocks.select).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }))
    })

    it("distinguishes pending, empty and failed query states", () => {
        const view = render(<ChallengeAttemptHistory />)
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
        mocks.query.data = []
        view.rerender(<ChallengeAttemptHistory />)
        expect(screen.getByTestId("state")).toHaveTextContent("empty")
        mocks.query.error = new Error("offline")
        view.rerender(<ChallengeAttemptHistory />)
        expect(screen.getByTestId("state")).toHaveTextContent("failed")
    })
})
