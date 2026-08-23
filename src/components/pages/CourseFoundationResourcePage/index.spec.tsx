import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/learn/CourseFoundationResourceBlock", () => ({ CourseFoundationResourceBlock: () => <output data-testid="resource-block">resource-block</output> }))
import { CourseFoundationResourcePage } from "./index"

describe("CourseFoundationResourcePage route", () => {
    it("composes the connected resource block", () => {
        render(<CourseFoundationResourcePage displayId="course" categoryId="category" foundationId="foundation" />)
        expect(screen.getByTestId("resource-block")).toHaveTextContent("resource-block")
    })
})
