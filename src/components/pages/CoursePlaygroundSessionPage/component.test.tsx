import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CoursePlaygroundSessionPage, type CoursePlaygroundSessionPageProps } from "./component"

const props = (overrides: Partial<CoursePlaygroundSessionPageProps> = {}): CoursePlaygroundSessionPageProps => ({
    state: "live",
    props: {
        title: "Docker lab",
        steps: [{ id: "step-1", sortIndex: 0, title: "Run a container", body: "Create the container.", commandHint: "docker run", actionHint: null }],
        selectedStepIndex: 0,
        passedStepIndexes: [],
        connectionText: "Agent connected",
        submitLabel: "Verify this step",
        leaveLabel: "Setup",
        retryLabel: "Try again",
        completedTitle: "Playground completed",
        completedText: "Every step passed.",
        failedText: "Session unavailable.",
        stepLabel: "Step",
    },
    on: { step: vi.fn(), submit: vi.fn(), leave: vi.fn(), retry: vi.fn() },
    ...overrides,
})

describe("_CoursePlaygroundSessionPage", () => {
    it("requests server verification without exposing a local next-step action", () => {
        const input = props()
        render(<_CoursePlaygroundSessionPage {...input} />)

        fireEvent.click(screen.getByRole("button", { name: "Verify this step" }))

        expect(input.on.submit).toHaveBeenCalledOnce()
        expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument()
    })

    it("shows completion only when the connected owner supplies completed state", () => {
        const input = props({ state: "completed" })
        render(<_CoursePlaygroundSessionPage {...input} />)

        expect(screen.getByText("Playground completed")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Verify this step" })).not.toBeInTheDocument()
    })
})
