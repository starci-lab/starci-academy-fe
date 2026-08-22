import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type MockPageProps = { readonly displayId: string }
vi.mock("./component", () => ({ CourseFlashcardsReviewPageBase: ({ displayId }: MockPageProps) => <output data-testid="route">{displayId}</output> }))
import { CourseFlashcardsReviewPage } from "./index"
describe("CourseFlashcardsReviewPage route", () => { it("passes route identity to the page shell", () => { render(<CourseFlashcardsReviewPage displayId="course"  />); expect(screen.getByTestId("route")).toHaveTextContent("course") }) })
