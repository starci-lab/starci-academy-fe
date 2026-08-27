import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChallengeAttemptHistoryBase, type ChallengeAttemptHistoryBaseProps } from "./component"

const labels: ChallengeAttemptHistoryBaseProps["labels"] = {
    summary: (count) => `${count} attempts`,
    attempt: (number, score) => `Attempt ${number}: ${score ?? "pending"}`,
    outcome: { evaluating: "Evaluating", passed: "Passed", needsRevision: "Revise", unavailable: "Unavailable" },
    pending: "Loading history",
    empty: "No attempts",
    failed: "History failed",
}

describe("ChallengeAttemptHistoryBase", () => {
    it("renders selectable ready attempts", () => {
        const onSelect = vi.fn()
        const attempt = { id: "attempt-1", attemptNumber: 1, score: 90, outcome: "passed" as const, servedModel: "model", processedAt: "today" }
        render(<ChallengeAttemptHistoryBase state="ready" attempts={[attempt]} selectedAttemptId="attempt-1" labels={labels} onSelect={onSelect} />)
        fireEvent.click(screen.getByRole("button", { name: "Attempt 1: 90" }))
        expect(onSelect).toHaveBeenCalledWith(attempt)
        expect(screen.getByText("Passed · model · today")).toBeInTheDocument()
    })

    it.each([
        ["pending", "Loading history"],
        ["empty", "No attempts"],
        ["failed", "History failed"],
    ] as const)("renders the %s notice", (state, notice) => {
        render(<ChallengeAttemptHistoryBase state={state} attempts={[]} labels={labels} />)
        expect(screen.getByText(notice)).toBeInTheDocument()
    })
})
