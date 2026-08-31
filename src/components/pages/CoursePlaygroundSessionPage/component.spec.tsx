import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { PlaygroundStep } from "@/modules/api/graphql/queries/query-playground"
import { PlaygroundSessionBase as CoursePlaygroundSessionPageBase, type PlaygroundSessionProps as CoursePlaygroundSessionPageProps } from "@/components/blocks/learn/PlaygroundSession/component"

/**
 * What these tests guard: progress in this workspace belongs to the server. The verify action is
 * the reader's only way to ask for it, so every state that cannot honour a verification - a relay
 * that is not live, a step with nothing selected, a step already passed, a settled session - has to
 * withhold that action rather than offer a press the server will refuse.
 */

const step = (overrides: Partial<PlaygroundStep> = {}): PlaygroundStep => ({
    id: "step-1",
    sortIndex: 0,
    title: "Run a container",
    body: "Create the container.",
    commandHint: "docker run -it alpine",
    actionHint: "Open a terminal on the paired machine.",
    ...overrides,
})

const copy = {
    title: "Docker lab",
    connectionText: "Agent connected",
    submitLabel: "Verify this step",
    leaveLabel: "Back to setup",
    retryLabel: "Try again",
    completedTitle: "Playground completed",
    completedText: "Every step passed.",
    failedText: "Session unavailable.",
    stepLabel: "Step",
    passedLabel: "Passed",
}

const handlers = (): CoursePlaygroundSessionPageProps["on"] => ({
    step: vi.fn(),
    submit: vi.fn(),
    leave: vi.fn(),
    retry: vi.fn(),
})

const draw = (
    state: CoursePlaygroundSessionPageProps["state"],
    props: Partial<CoursePlaygroundSessionPageProps["props"]> = {},
    on: CoursePlaygroundSessionPageProps["on"] = handlers(),
) => render(
    <CoursePlaygroundSessionPageBase
        state={state}
        props={{ ...copy, steps: [step()], selectedStepIndex: 0, passedStepIndexes: [], ...props }}
        on={on}
    />,
)

describe("CoursePlaygroundSessionPageBase", () => {
    it("titles the workspace by the selected step and shows the command and hint it needs", () => {
        draw("live")
        expect(screen.getByRole("heading", { name: "Run a container" })).toBeInTheDocument()
        expect(screen.getByText("docker run -it alpine")).toBeInTheDocument()
        expect(screen.getByText("Open a terminal on the paired machine.")).toBeInTheDocument()
        expect(screen.getByText("Agent connected")).toBeInTheDocument()
    })

    it("asks the server to verify the selected step, and offers no local way to advance", () => {
        const on = handlers()
        draw("live", {}, on)

        fireEvent.click(screen.getByRole("button", { name: "Verify this step" }))

        expect(on.submit).toHaveBeenCalledTimes(1)
        expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument()
    })

    it("keeps the instruction on screen but withholds verification while the relay is not live", () => {
        draw("reconnecting")

        expect(screen.getByText("Create the container.")).toBeInTheDocument()
        expect(screen.getByText("docker run -it alpine")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Verify this step" })).not.toBeInTheDocument()
    })

    it("withholds verification for a step the server has already passed", () => {
        draw("live", { passedStepIndexes: [0] })

        expect(screen.queryByRole("button", { name: "Verify this step" })).not.toBeInTheDocument()
    })

    it("falls back to the playground name and rests the body until a step is selected", () => {
        draw("live", { steps: [] })

        expect(screen.getByRole("heading", { name: "Docker lab" })).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Verify this step" })).not.toBeInTheDocument()
    })

    it("drops the command and hint for a step the author wrote neither for", () => {
        const { container } = draw("live", { steps: [step({ commandHint: null, actionHint: null })] })

        expect(container.querySelector("pre")).toBeNull()
        expect(screen.queryByText("Open a terminal on the paired machine.")).not.toBeInTheDocument()
        expect(screen.getByText("Create the container.")).toBeInTheDocument()
    })

    it("marks the steps the server passed and reaches only as far as the server has opened", () => {
        const on = handlers()
        const steps = [
            step(),
            step({ id: "step-2", sortIndex: 1, title: "Inspect the container" }),
            step({ id: "step-3", sortIndex: 2, title: "Remove the container" }),
        ]
        draw("live", { steps, selectedStepIndex: 1, passedStepIndexes: [0] }, on)

        expect(screen.getByRole("button", { name: "Step 1 · Passed · Run a container" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Step 2 · Inspect the container" })).toHaveAttribute("aria-current", "step")

        fireEvent.click(screen.getByRole("button", { name: "Step 3 · Remove the container" }))
        expect(on.step).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole("button", { name: "Step 1 · Passed · Run a container" }))
        expect(on.step).toHaveBeenCalledWith(0)
    })

    it("hands the reader back to setup when they leave the workspace", () => {
        const on = handlers()
        draw("live", {}, on)

        fireEvent.click(screen.getByRole("button", { name: "Back to setup" }))

        expect(on.leave).toHaveBeenCalledTimes(1)
    })

    it("reports a completed session and offers a clear exit without retry", () => {
        const on = handlers()
        draw("completed", {}, on)

        expect(screen.getByText("Playground completed")).toBeInTheDocument()
        expect(screen.getByText("Every step passed.")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Verify this step" })).not.toBeInTheDocument()
        fireEvent.click(screen.getAllByRole("button", { name: "Back to setup" }).at(-1)!)
        expect(on.leave).toHaveBeenCalledTimes(1)
    })

    it("reports a failed session and offers the one action that can fix it", () => {
        const on = handlers()
        draw("failed", {}, on)

        expect(screen.getByText("Session unavailable.")).toBeInTheDocument()
        expect(screen.queryByText("Every step passed.")).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(on.retry).toHaveBeenCalledTimes(1)
    })
})
