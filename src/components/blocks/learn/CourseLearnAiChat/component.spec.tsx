import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type SharedChatInput = { readonly state: string }

vi.mock("@/components/blocks/ai/StarCiAiChat/component", () => ({
    StarCiAiChatBase: ({ state }: SharedChatInput) => <output>{state}</output>,
}))

import { CourseLearnAiChatBase } from "./component"

describe("CourseLearnAiChatBase", () => {
    it("projects the course-owned state through the shared renderer", () => {
        render(<CourseLearnAiChatBase state="ready" props={{} as never} />)
        expect(screen.getByText("ready")).toBeInTheDocument()
    })
})
