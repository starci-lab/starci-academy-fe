import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Podium, type PodiumEntryData } from "./index"

const frame = { meLabel: "You", anonymousLabel: "Anonymous" } as const

const entry = (over: Partial<PodiumEntryData> & Pick<PodiumEntryData, "rank">): PodiumEntryData => ({
    username: `Learner ${over.rank}`,
    avatar: null,
    rankLabel: `Rank ${over.rank}`,
    pointsLabel: `${over.rank}00 XP`,
    isMe: false,
    ...over,
})

const places = (root: HTMLElement) => Array.from(root.firstElementChild?.children ?? [])

describe("Podium", () => {
    it("emits the top three best-first so a sequential reader hears first, second, third", () => {
        const { container } = render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 2 }), entry({ rank: 1 }), entry({ rank: 3 })],
        }} />)
        expect(places(container)).toHaveLength(3)
        expect(screen.getAllByText(/^[123]$/).map((step) => step.textContent)).toEqual(["1", "2", "3"])
        expect(screen.getAllByText(/^Learner [123]$/).map((name) => name.textContent))
            .toEqual(["Learner 1", "Learner 2", "Learner 3"])
        expect(screen.getAllByText(/^[123]00 XP$/).map((points) => points.textContent))
            .toEqual(["100 XP", "200 XP", "300 XP"])
    })

    it("gives the champion the larger portrait and the runners-up the ordinary one", () => {
        render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 1 }), entry({ rank: 2 }), entry({ rank: 3 })],
        }} />)
        const portraits = screen.getAllByRole("img")
        expect(portraits[0]?.closest(".avatar")).toHaveClass("avatar--lg")
        expect(portraits[1]?.closest(".avatar")).toHaveClass("avatar--md")
        expect(portraits[2]?.closest(".avatar")).toHaveClass("avatar--md")
    })

    it("keeps each finisher's numeric place on the mark it hands assistive technology", () => {
        render(<Podium props={{ ...frame, entries: [entry({ rank: 1 })] }} />)
        const mark = screen.getByLabelText("Rank 1")
        expect(mark.tagName).toBe("SPAN")
    })

    it("marks the viewer's own place and appends the suffix to their name", () => {
        render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 1, username: "Ada", isMe: true }), entry({ rank: 2 })],
        }} />)
        const ownName = screen.getByText("Ada · You")
        const otherName = screen.getByText("Learner 2")
        expect(ownName).toHaveAttribute("data-tone", "accent")
        expect(ownName).toHaveAttribute("data-weight", "semibold")
        expect(otherName).toHaveAttribute("data-tone", "default")
    })

    it("falls back to the anonymous name, and still says it is the viewer", () => {
        render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 1, username: null, isMe: true }), entry({ rank: 2, username: null })],
        }} />)
        expect(screen.getByText("Anonymous · You")).toBeInTheDocument()
        expect(screen.getByText("Anonymous")).toBeInTheDocument()
    })

    it("drops a place nobody finished rather than standing an empty step on the dais", () => {
        const { container } = render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 1 }), entry({ rank: 3 })],
        }} />)
        expect(places(container)).toHaveLength(2)
        expect(screen.getAllByText(/^[13]$/).map((step) => step.textContent)).toEqual(["1", "3"])
    })

    it("draws the whole three-step dais at rest, with nobody standing on it yet", () => {
        const { container } = render(<Podium props={{ ...frame, entries: [] }} isLoading />)
        expect(places(container)).toHaveLength(3)
        expect(container.querySelectorAll("[aria-hidden=\"true\"]").length).toBeGreaterThanOrEqual(6)
        expect(screen.queryByText(/^[123]$/)).toBeNull()
    })

    it("draws nothing at all once a settled week has no finishers", () => {
        const { container } = render(<Podium props={{ ...frame, entries: [] }} />)
        expect(places(container)).toHaveLength(0)
    })

    it("names each finisher's portrait so the dais is readable without the labels", () => {
        render(<Podium props={{
            ...frame,
            entries: [
                entry({ rank: 1, username: "Ada", avatar: "https://example.com/ada.png" }),
                entry({ rank: 2, username: null }),
            ],
        }} />)
        expect(screen.getByRole("img", { name: "Ada" })).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "Anonymous" })).toBeInTheDocument()
    })
})
