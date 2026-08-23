import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type MindMapStubProps = { readonly displayId: string }
vi.mock("@/components/blocks/learn/CourseMindMap", () => ({ CourseMindMapBlock: ({ displayId }: MindMapStubProps) => <output data-testid="display-id">{displayId}</output> }))
import { CourseMindMapPage } from "./index"
describe("CourseMindMapPage route", () => {
    it("passes only route identity to the connected graph block", () => { render(<CourseMindMapPage displayId="course" />); expect(screen.getByTestId("display-id")).toHaveTextContent("course") })
})
