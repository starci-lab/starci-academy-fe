import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { RailDivider } from "."

const props = {
    label: "Resize course outline",
    storageKey: "test.course-outline.width",
    defaultWidth: 320,
    minWidth: 256,
    maxWidth: 560,
} as const

describe("RailDivider", () => {
    beforeEach(() => window.localStorage.clear())

    it("resizes its parent with keyboard controls and persists the width", () => {
        const { container } = render(<div><aside /><RailDivider props={props} /></div>)
        const separator = screen.getByRole("separator", { name: props.label })

        expect(separator).toHaveClass("w-0")
        expect(separator).not.toHaveClass("w-3")
        fireEvent.keyDown(separator, { key: "ArrowRight" })

        expect(separator).toHaveAttribute("aria-valuenow", "336")
        expect(container.querySelector("aside")).toHaveStyle({ width: "336px" })
        expect(window.localStorage.getItem(props.storageKey)).toBe("336")
    })

    it("clamps keyboard resizing to the declared bounds", () => {
        render(<div><aside /><RailDivider props={{ ...props, defaultWidth: 256 }} /></div>)
        const separator = screen.getByRole("separator", { name: props.label })

        fireEvent.keyDown(separator, { key: "ArrowLeft", shiftKey: true })

        expect(separator).toHaveAttribute("aria-valuenow", "256")
    })
})
