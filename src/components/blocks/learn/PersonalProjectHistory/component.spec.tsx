import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectHistoryBase, type PersonalProjectHistoryProps } from "./component"

const labels: PersonalProjectHistoryProps["props"]["labels"] = {
    summary: (count) => `${count} attempts`,
    selectAttempt: (number, score) => `Attempt ${number} · ${score}`,
    passed: "Passed",
    needsWork: "Needs work",
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
})
