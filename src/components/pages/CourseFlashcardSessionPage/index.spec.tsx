import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type MockPageProps = { readonly displayId: string; readonly sessionId: string; readonly mode: string }
vi.mock("./component", () => ({ CourseFlashcardSessionPageBase: ({ displayId, sessionId, mode }: MockPageProps) => <output data-testid="route">{`${displayId}:${sessionId}:${mode}`}</output> }))
import { CourseFlashcardSessionPage } from "./index"
describe("CourseFlashcardSessionPage route", () => { it("passes route identity to the page shell", () => { render(<CourseFlashcardSessionPage displayId="course" sessionId="session" mode="review" />); expect(screen.getByTestId("route")).toHaveTextContent("course:session:review") }) })
