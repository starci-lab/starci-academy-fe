import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CoursePriceDetailBase } from "./component"
describe("CoursePriceDetailBase", () => {
    it("renders the price explanation", () => { render(<CoursePriceDetailBase state="ready" props={{ title: "Course", lines: [{ id: "payable", label: "Pay", value: "$10" }], reason: "Member price" }} />); expect(screen.getByText("Course")).toBeInTheDocument(); expect(screen.getByText("$10")).toBeInTheDocument(); expect(screen.getByText("Member price")).toBeInTheDocument() })
    it("renders the unavailable message", () => { render(<CoursePriceDetailBase state="unavailable" props={{ unavailableMessage: "Unavailable" }} />); expect(screen.getByText("Unavailable")).toBeInTheDocument() })
})
