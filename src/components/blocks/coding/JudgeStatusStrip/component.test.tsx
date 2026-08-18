import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _JudgeStatusStrip, type JudgeVerdictState } from "./component"

const props = {
    verdictLabel: "Accepted",
    detailLabel: "12 / 12 cases · 84 ms · 18 MB",
}

const mark = () => document.querySelector("[data-component=\"StatusDot\"]")

describe("_JudgeStatusStrip", () => {
    it.each([
        ["idle", "accent"],
        ["pending", "accent"],
        ["judging", "accent"],
        ["accepted", "success"],
        ["wrongAnswer", "danger"],
        ["timeLimitExceeded", "danger"],
        ["memoryLimitExceeded", "danger"],
        ["runtimeError", "danger"],
        ["compileError", "danger"],
        ["internalError", "warning"],
        ["socket-lost", "warning"],
    ] as ReadonlyArray<readonly [JudgeVerdictState, string]>)(
        "draws %s in the %s tone beside the words it stands for",
        (state, tone) => {
            render(<_JudgeStatusStrip state={state} props={{ verdictLabel: "Wrong answer" }} />)
            expect(mark()).toHaveAttribute("data-tone", tone)
            expect(mark()).toHaveAttribute("aria-label", "Wrong answer")
            expect(screen.getByText("Wrong answer")).toHaveAttribute("data-weight", "semibold")
        },
    )

    it("carries the verdict detail as the quiet line beside the verdict", () => {
        render(<_JudgeStatusStrip state="accepted" props={props} />)
        const detail = screen.getByText("12 / 12 cases · 84 ms · 18 MB")
        expect(detail).toHaveAttribute("data-size", "xs")
        expect(detail).toHaveAttribute("data-tone", "muted")
    })

    it("leaves the detail line empty when the judge has said nothing yet", () => {
        render(<_JudgeStatusStrip state="idle" props={{ verdictLabel: "Not submitted" }} />)
        const lines = document.querySelectorAll("[data-component=\"Text\"]")
        expect(lines).toHaveLength(2)
        expect(lines[1]).toHaveAttribute("data-size", "xs")
        expect(lines[1]).toHaveTextContent("")
    })

    it("offers the accepted verdict a forward-pointing primary way on", () => {
        const act = vi.fn()
        render(
            <_JudgeStatusStrip
                state="accepted"
                props={{ ...props, actionLabel: "Next problem" }}
                on={{ act }}
            />,
        )
        const action = screen.getByRole("button", { name: "Next problem" })
        expect(action).toHaveAttribute("data-variant", "primary")
        expect(action).toHaveAttribute("data-icon-placement", "trailing")
        expect(action.querySelector("svg")).toBeInTheDocument()
        fireEvent.click(action)
        expect(act).toHaveBeenCalledTimes(1)
    })

    it("offers a lost socket a plain re-read rather than a second submission", () => {
        const act = vi.fn()
        render(
            <_JudgeStatusStrip
                state="socket-lost"
                props={{ verdictLabel: "Connection lost", actionLabel: "Check the result" }}
                on={{ act }}
            />,
        )
        const action = screen.getByRole("button", { name: "Check the result" })
        expect(action).toHaveAttribute("data-variant", "outline")
        expect(action.querySelector("svg")).toBeNull()
        fireEvent.click(action)
        expect(act).toHaveBeenCalledTimes(1)
    })

    it("keeps the action inert when the page wired no handler to it", () => {
        render(
            <_JudgeStatusStrip
                state="wrongAnswer"
                props={{ verdictLabel: "Wrong answer", actionLabel: "Try again" }}
            />,
        )
        const action = screen.getByRole("button", { name: "Try again" })
        fireEvent.click(action)
        expect(action).toBeEnabled()
        expect(screen.getByText("Wrong answer")).toBeInTheDocument()
    })

    it("draws no action at all while the judge is still working", () => {
        render(<_JudgeStatusStrip state="judging" props={{ verdictLabel: "Judging" }} on={{}} />)
        expect(screen.queryByRole("button")).toBeNull()
    })
})
