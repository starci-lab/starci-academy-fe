import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectHistoryBase, type PersonalProjectHistoryProps } from "./component"

const labels: PersonalProjectHistoryProps["props"]["labels"] = {
    summary: (count) => `${count} attempts`,
    selectAttempt: (number, score) => `Attempt ${number} · ${score}`,
    passed: "Passed",
    needsWork: "Needs work",
    selected: "Viewing",
    previous: "Previous",
    next: "Next",
    pending: "Loading history",
    empty: "No attempts yet",
    failed: "History unavailable",
    retry: "Try again",
}

const baseProps: PersonalProjectHistoryProps["props"] = {
    attempts: [],
    attemptCount: 0,
    page: 0,
    pageSize: 20,
    labels,
}

describe("PersonalProjectHistoryBase", () => {
    it("renders a deliberate empty state", () => {
        render(<PersonalProjectHistoryBase state="empty" props={baseProps} />)
        expect(screen.getByText("No attempts yet")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
    })

    it("offers recovery when history loading fails", () => {
        const retry = vi.fn()
        render(<PersonalProjectHistoryBase state="failed" props={baseProps} on={{ retry }} />)
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("marks the selected attempt and keeps provider/model evidence together", () => {
        render(<PersonalProjectHistoryBase state="ready" props={{
            ...baseProps,
            attempts: [{ id: "attempt-1", attemptNumber: 1, score: 0, passed: false, servedProvider: "openrouter", servedModel: "review-pro" }],
            attemptCount: 1,
            selectedAttemptId: "attempt-1",
        }} />)

        expect(screen.getByText("Viewing")).toBeInTheDocument()
        expect(screen.getByText(/openrouter · review-pro/u)).toBeInTheDocument()
        expect(screen.getByText("Attempt 1 · 0")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Attempt 1 · 0" })).not.toBeInTheDocument()
    })
})
