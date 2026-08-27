import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLearnAiDrawerBase } from "./component"

describe("CourseLearnAiDrawerBase", () => {
    it("renders the supplied course chat in the drawer", () => {
        const Chat = () => <output>course chat</output>
        render(<CourseLearnAiDrawerBase isOpen placement="right" title="AI" onDismiss={vi.fn()} chat={Chat} />)
        expect(screen.getByText("course chat")).toBeInTheDocument()
    })
})
