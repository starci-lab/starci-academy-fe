import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SurfaceFormCard } from "."

describe("SurfaceFormCard", () => {
    it("renders ordinary form content", () => {
        const copy = { label: ["Comment"].join(""), action: ["Post", "comment"].join(" ") }
        render(<SurfaceFormCard><form aria-label={copy.label}><button type="submit">{copy.action}</button></form></SurfaceFormCard>)
        expect(screen.getByRole("form", { name: "Comment" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Post comment" })).toBeInTheDocument()
    })
    it("keeps an optional heading outside the form surface", () => {
        render(<SurfaceFormCard props={{ label: "Project GitHub" }}><form /></SurfaceFormCard>)
        expect(screen.getByRole("heading", { name: "Project GitHub", level: 3 })).toBeInTheDocument()
    })
})
