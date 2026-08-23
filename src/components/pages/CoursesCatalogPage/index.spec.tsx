import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
vi.mock("./component", () => ({ CoursesCatalogPageBase: () => <output data-testid="route">catalog</output> }))
import { CoursesCatalogPage } from "./index"
describe("CoursesCatalogPage route", () => { it("composes the canonical catalog shell", () => { render(<CoursesCatalogPage />); expect(screen.getByTestId("route")).toHaveTextContent("catalog") }) })
