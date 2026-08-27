import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CourseReviewBlockBase } from "./component"
describe("CourseReviewBlockBase", () => { it("renders aggregate and review", () => { render(<CourseReviewBlockBase state="rated" props={{ averageScore: 4.5, total: 1, countLabel: "1 review", emptyLabel: "None", reviews: [{ id: "r", author: "Ada", score: 5, body: "Great" }] }} />); expect(screen.getByText("Ada")).toBeInTheDocument(); expect(screen.getByText("Great")).toBeInTheDocument() }) })
