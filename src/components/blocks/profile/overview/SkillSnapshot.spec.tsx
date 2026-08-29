import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SkillSnapshot } from "./SkillSnapshot"

const rows = (root: HTMLElement) =>
    Array.from(
        root.querySelectorAll(".divide-y > *"),
        (row) => row.textContent,
    )

describe("SkillSnapshot", () => {
    it("leads with the headline fact and follows it with one count row per breakdown", () => {
        const { container } = render(
            <SkillSnapshot
                label="Challenge skills"
                totalLabel="Passed"
                totalValue="12"
                rows={[
                    {
                        id: "difficulty-easy",
                        title: "Easy",
                        value: "9",
                    },
                    {
                        id: "difficulty-hard",
                        title: "Hard",
                        value: "3",
                    },
                ]}
            />,
        )

        expect(
            screen.getByRole("heading", { name: "Challenge skills" }),
        ).toBeInTheDocument()
        expect(container.textContent).toContain("Passed12")
        expect(rows(container)).toEqual(["Easy9", "Hard3"])
        expect(screen.queryByRole("progressbar")).toBeNull()
    })

    it("replaces the whole control stack with the settled state message", () => {
        const { container } = render(
            <SkillSnapshot
                label="Challenge skills"
                totalLabel="Passed"
                totalValue="0"
                rows={[
                    {
                        id: "difficulty-easy",
                        title: "Easy",
                        value: "1",
                    },
                ]}
                stateMessage="No solved challenges yet"
            />,
        )

        expect(screen.getByText("No solved challenges yet")).toBeInTheDocument()
        expect(container.textContent).not.toContain("Passed")
        expect(rows(container)).toEqual([])
    })

    it("keeps populated totals and rows when supporting evidence is present", () => {
        const { container } = render(
            <SkillSnapshot
                label="Challenge skills"
                totalLabel="Passed"
                totalValue="3"
                rows={[{ id: "difficulty-easy", title: "Easy", value: "3" }]}
                supportingMessage="2 languages · TypeScript · Python"
            />,
        )

        expect(container.textContent).toContain("Passed3")
        expect(rows(container)).toEqual(["Easy3"])
        expect(screen.getByText("2 languages · TypeScript · Python")).toBeInTheDocument()
    })

    it("keeps the resting headline and rows while a state message is already known", () => {
        const { container } = render(
            <SkillSnapshot
                label="Challenge skills"
                totalLabel="Passed"
                rows={[{ id: "resting", title: "" }]}
                stateMessage="No solved challenges yet"
                isLoading
            />,
        )

        expect(screen.queryByText("No solved challenges yet")).toBeNull()
        expect(container.textContent).toContain("Passed")
        expect(rows(container)).toHaveLength(1)
        expect(screen.queryByRole("progressbar")).toBeNull()
    })
})
