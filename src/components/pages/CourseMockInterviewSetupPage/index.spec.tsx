import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type MockPageProps = { readonly displayId: string }
vi.mock("./component", () => ({ CourseMockInterviewSetupPageBase: ({ displayId }: MockPageProps) => <output data-testid="route">{displayId}</output> }))
import { CourseMockInterviewSetupPage } from "./index"

describe("CourseMockInterviewSetupPage route", () => {
    it("passes route identity to the page shell", () => {
        render(<CourseMockInterviewSetupPage displayId="course"  />)
        expect(screen.getByTestId("route")).toHaveTextContent("course")
    })
})
