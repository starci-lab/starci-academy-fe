import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/learn/CourseFoundationCategoryBlock", () => ({ CourseFoundationCategoryBlock: () => <output data-testid="category-block">category-block</output> }))
import { CourseFoundationCategoryPageBase } from "./component"

describe("CourseFoundationCategoryPageBase", () => {
    it("renders the connected block and owns no block state", () => {
        render(<CourseFoundationCategoryPageBase displayId="course" categoryId="category" title="Resources" />)
        expect(screen.getByTestId("category-block")).toHaveTextContent("category-block")
    })
})
