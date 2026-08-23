import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
type MockPageProps = { readonly displayId: string }
vi.mock("./component", () => ({ CourseFlashcardsQuizPageBase: ({ displayId }: MockPageProps) => <output data-testid="route">{displayId}</output> }))
import { CourseFlashcardsQuizPage } from "./index"
describe("CourseFlashcardsQuizPage route", () => { it("passes route identity to the page shell", () => { render(<CourseFlashcardsQuizPage displayId="course"  />); expect(screen.getByTestId("route")).toHaveTextContent("course") }) })
