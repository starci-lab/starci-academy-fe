import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ category: "challenge" }))
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: () => mocks.category }) }))
type PageShellStub = { readonly displayId: string; readonly selectedCategory: string }
vi.mock("./component", () => ({ CourseLeaderboardPageBase: (input: PageShellStub) => <><output data-testid="display-id">{input.displayId}</output><output data-testid="category">{input.selectedCategory}</output></> }))
import { CourseLeaderboardPage } from "./index"

describe("CourseLeaderboardPage route", () => {
    it("passes route identity to the page base without owning block data", () => { render(<CourseLeaderboardPage displayId="course" />); expect(screen.getByTestId("display-id")).toHaveTextContent("course"); expect(screen.getByTestId("category")).toHaveTextContent("challenge") })
})
