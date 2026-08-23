import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/learn/CourseFoundationCategoryBlock", () => ({ CourseFoundationCategoryBlock: () => <output data-testid="category-block">category-block</output> }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
import { CourseFoundationCategoryPage } from "./index"

describe("CourseFoundationCategoryPage route", () => {
    it("composes the connected category block", () => {
        render(<CourseFoundationCategoryPage displayId="course" categoryId="category" />)
        expect(screen.getByTestId("category-block")).toHaveTextContent("category-block")
    })
})
