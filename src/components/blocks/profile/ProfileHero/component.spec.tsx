import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProfileHeroBase } from "./component"

describe("ProfileHeroBase", () => {
    it("renders the approved identity card with separated identity, profession, and evidence groups", () => {
        render(<ProfileHeroBase state="ready" props={{ name: "Ada", handle: "ada", role: "Full-stack Developer", location: "Ho Chi Minh City, Vietnam", followerLabel: "128 followers", followingLabel: "42 following", primaryLabel: "Follow", primaryPending: false, shareLabel: "Share", joinedLabel: "Joined", evidenceLabel: "Evidence highlights", evidenceItems: ["3 challenges", "5 practice problems", "Learning Fullstack Mastery"] }} />)
        const heading = screen.getByRole("heading", { name: "Ada" })
        const nameHandle = heading.parentElement
        const identity = nameHandle?.parentElement
        const grid = identity?.parentElement

        expect(screen.getByText("128 followers")).toBeInTheDocument()
        expect(nameHandle).toHaveClass("flex", "min-w-0", "flex-col", "gap-1")
        expect(identity).toHaveClass("flex", "min-w-0", "flex-col", "gap-4")
        expect(screen.getByRole("heading", { name: "Full-stack Developer" }).parentElement).toHaveClass("gap-2")
        expect(grid).toHaveClass("grid", "grid-cols-[auto_minmax(0,1fr)]", "gap-4")
        expect(screen.getByRole("button", { name: "Follow" }).parentElement).toHaveClass("flex", "w-full", "gap-2")
        expect(screen.getByText("Ho Chi Minh City, Vietnam")).not.toHaveAttribute("data-slot", "base")
        expect(screen.getByText("128 followers")).toHaveClass("font-normal")
        expect(screen.getByText("Evidence highlights").parentElement).toHaveClass("bg-accent-soft", "p-3")
        expect(screen.getByText("Learning Fullstack Mastery")).toBeInTheDocument()
    })
})
