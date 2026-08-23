import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type MockPageProps = { readonly displayId: string; readonly companyId: string }
vi.mock("./component", () => ({
    CourseHeadhuntingCompanyPageBase: ({ displayId, companyId }: MockPageProps) => (
        <output data-testid="route">{displayId}:{companyId}</output>
    ),
}))

import { CourseHeadhuntingCompanyPage } from "./index"

describe("CourseHeadhuntingCompanyPage route", () => {
    it("passes route identity to the page shell", () => {
        render(<CourseHeadhuntingCompanyPage displayId="course" companyId="company" />)
        expect(screen.getByTestId("route")).toHaveTextContent("course:company")
    })
})
