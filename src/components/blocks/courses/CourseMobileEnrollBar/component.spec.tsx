import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseMobileEnrollBarBase } from "./component"
describe("CourseMobileEnrollBarBase", () => { it("shows price and invokes CTA", () => { const act = vi.fn(); render(<CourseMobileEnrollBarBase state="ready" props={{ price: "$10", ctaLabel: "Enroll" }} on={{ act }} />); expect(screen.getByText("$10")).toBeInTheDocument(); fireEvent.click(screen.getByRole("button", { name: "Enroll" })); expect(act).toHaveBeenCalledOnce() }) })
