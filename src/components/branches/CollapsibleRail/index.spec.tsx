import { render } from "@testing-library/react"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"
import { CollapsibleRail } from "."

vi.mock("framer-motion", () => ({ motion: { div: (props: ComponentProps<"div">) => <div {...props} /> }, useReducedMotion: () => false }))

describe("CollapsibleRail", () => {
    it("keeps expanded navigation mounted", () => {
        const { container, getByRole } = render(<CollapsibleRail isCollapsed={false} expanded={<nav>Expanded</nav>} collapsed={<nav>Collapsed</nav>} />)
        expect(getByRole("navigation")).toHaveTextContent("Expanded")
        expect(container.firstElementChild).toHaveClass("h-full", "min-h-0")
    })
    it("switches to compact destinations", () => {
        const { getByRole } = render(<CollapsibleRail isCollapsed expanded={<nav>Expanded</nav>} collapsed={<nav>Collapsed</nav>} />)
        expect(getByRole("navigation")).toHaveTextContent("Collapsed")
    })
})
