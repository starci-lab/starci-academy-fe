import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type RouteProps = { readonly displayId: string }
vi.mock("@/components/blocks/learn/CoursePlaygroundCatalog", () => ({ CoursePlaygroundCatalog: ({ displayId }: RouteProps) => <output data-testid="route">{displayId}</output> }))
import { CoursePlaygroundPage } from "./index"
describe("CoursePlaygroundPage", () => { it("passes only route identity to the connected catalog", () => { render(<CoursePlaygroundPage displayId="course" />); expect(screen.getByTestId("route")).toHaveTextContent("course") }) })
