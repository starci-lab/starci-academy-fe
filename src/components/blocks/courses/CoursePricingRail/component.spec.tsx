import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CoursePricingRailBase } from "./component"
describe("CoursePricingRailBase", () => { it("renders the purchase action and price", () => { render(<CoursePricingRailBase state="ready" props={{ title: "React", price: "$10", ctaLabel: "Enroll" }} />); expect(screen.getByText("$10")).toBeInTheDocument(); expect(screen.getByRole("button", { name: "Enroll" })).toBeInTheDocument() }) })
