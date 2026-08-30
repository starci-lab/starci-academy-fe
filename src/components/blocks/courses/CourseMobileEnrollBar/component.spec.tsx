import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseMobileEnrollBarBase } from "./component"
describe("CourseMobileEnrollBarBase", () => { it("shows price, preserves bottom safe-area padding, and invokes CTA", () => { const act = vi.fn(); render(<CourseMobileEnrollBarBase state="ready" props={{ price: "$10", ctaLabel: "Enroll" }} on={{ act }} />); expect(screen.getByText("$10")).toBeInTheDocument(); const bar = screen.getByRole("button", { name: "Enroll" }).parentElement; expect(bar).toHaveClass("pt-3", "pb-[max(0.75rem,env(safe-area-inset-bottom))]"); fireEvent.click(screen.getByRole("button", { name: "Enroll" })); expect(act).toHaveBeenCalledOnce() }) })
