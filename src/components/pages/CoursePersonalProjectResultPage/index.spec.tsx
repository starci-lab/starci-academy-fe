import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type RouteProps = { readonly displayId: string; readonly taskId: string }
vi.mock("@/components/blocks/learn/PersonalProjectResult", () => ({ PersonalProjectResult: ({ displayId, taskId }: RouteProps) => <output data-testid="route">{displayId}/{taskId}</output> }))
import { CoursePersonalProjectResultPage } from "./index"
describe("CoursePersonalProjectResultPage", () => {
    it("passes only route identity to the connected result block", () => { render(<CoursePersonalProjectResultPage displayId="course" taskId="task" />); expect(screen.getByTestId("route")).toHaveTextContent("course/task") })
})
