import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type RouteProps = { readonly displayId: string }
vi.mock("@/components/blocks/learn/CourseQa", () => ({ CourseQa: ({ displayId }: RouteProps) => <output data-testid="route">{displayId}</output> }))
import { CourseQaPage } from "./index"
describe("CourseQaPage", () => { it("passes only route identity to the connected QA block", () => { render(<CourseQaPage displayId="course" />); expect(screen.getByTestId("route")).toHaveTextContent("course") }) })
