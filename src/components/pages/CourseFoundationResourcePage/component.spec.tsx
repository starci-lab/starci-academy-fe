import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/learn/CourseFoundationResourceBlock", () => ({ CourseFoundationResourceBlock: () => <output data-testid="resource-block">resource-block</output> }))
import { CourseFoundationResourcePageBase } from "./component"

describe("CourseFoundationResourcePageBase", () => {
    it("renders the connected block and owns no block state", () => {
        render(<CourseFoundationResourcePageBase displayId="course" categoryId="category" foundationId="foundation" />)
        expect(screen.getByTestId("resource-block")).toHaveTextContent("resource-block")
    })
})
