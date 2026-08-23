import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type MockPageProps = { readonly displayId: string; readonly moduleId: string; readonly contentId: string }
vi.mock("./component", () => ({ CourseLearnContentPageBase: ({ displayId, moduleId, contentId }: MockPageProps) => <output data-testid="route">{displayId}:{moduleId}:{contentId}</output> }))
import { CourseLearnContentPage } from "./index"

describe("CourseLearnContentPage route", () => {
    it("passes route identity to the page shell", () => {
        render(<CourseLearnContentPage displayId="course" moduleId="module" contentId="content" />)
        expect(screen.getByTestId("route")).toHaveTextContent("course:module:content")
    })
})
