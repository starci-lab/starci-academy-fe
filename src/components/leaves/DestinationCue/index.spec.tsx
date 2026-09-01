import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DestinationCue } from "."

describe("DestinationCue", () => {
    it("keeps the words before the trailing arrow and moves only that arrow", () => {
        const { container } = render(<DestinationCue props={{ label: "View course" }} />)
        const cue = container.querySelector("[data-destination-cue='true']")
        const caret = container.querySelector("[data-destination-cue-caret='true']")

        expect(cue?.firstElementChild).toHaveTextContent("View course")
        expect(cue?.lastElementChild).toBe(caret)
        expect(caret).toHaveClass("group-hover:translate-x-1", "group-focus-visible:translate-x-1")
    })

    it("rests without exposing the label or arrow", () => {
        const { container } = render(<DestinationCue props={{ label: "View course" }} isLoading />)
        expect(container.querySelector("[data-destination-cue='true']")).toHaveAttribute("data-loading", "true")
        expect(screen.queryByText("View course")).toBeNull()
        expect(container.querySelector("svg")).toBeNull()
    })
})
