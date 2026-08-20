import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Podium, type PodiumEntryData } from "./index"

vi.mock("@iconify/react", () => ({
    Icon: (props: Readonly<Record<string, unknown>>) => <span {...props} />,
}))

const frame = { meLabel: "You", anonymousLabel: "Anonymous" } as const

const entry = (over: Partial<PodiumEntryData> & Pick<PodiumEntryData, "rank">): PodiumEntryData => ({
    username: `Learner ${over.rank}`,
    avatar: null,
    rankLabel: `Rank ${over.rank}`,
    pointsLabel: `${over.rank}00 XP`,
    isMe: false,
    ...over,
})

const places = (root: HTMLElement) => root.querySelectorAll("[data-node=\"podium-place\"]")

describe("Podium", () => {
    it("emits the top three best-first so a sequential reader hears first, second, third", () => {
        const { container } = render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 2 }), entry({ rank: 1 }), entry({ rank: 3 })],
        }} />)
        expect(places(container)).toHaveLength(3)
        expect(Array.from(container.querySelectorAll("[data-component=\"PodiumStep\"]"), (step) => step.textContent))
            .toEqual(["1", "2", "3"])
        expect(Array.from(container.querySelectorAll("[data-component=\"Text\"][data-size=\"sm\"]"), (name) => name.textContent))
            .toEqual(["Learner 1", "Learner 2", "Learner 3"])
        expect(Array.from(container.querySelectorAll("[data-component=\"Text\"][data-size=\"xs\"]"), (points) => points.textContent))
            .toEqual(["100 XP", "200 XP", "300 XP"])
    })

    it("gives the champion the larger portrait and the runners-up the ordinary one", () => {
        const { container } = render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 1 }), entry({ rank: 2 }), entry({ rank: 3 })],
        }} />)
        expect(Array.from(container.querySelectorAll("[data-component=\"Avatar\"]"), (avatar) => avatar.getAttribute("data-size")))
            .toEqual(["lg", "md", "md"])
    })

    it("keeps each finisher's numeric place on the mark it hands assistive technology", () => {
        const { container } = render(<Podium props={{ ...frame, entries: [entry({ rank: 1 })] }} />)
        const mark = container.querySelector("[data-component=\"RankMark\"]")
        expect(mark).toHaveAttribute("aria-label", "Rank 1")
        expect(mark).toHaveAttribute("data-placement", "row")
    })

    it("marks the viewer's own place and appends the suffix to their name", () => {
        const { container } = render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 1, username: "Ada", isMe: true }), entry({ rank: 2 })],
        }} />)
        const names = container.querySelectorAll("[data-component=\"Text\"][data-size=\"sm\"]")
        expect(names[0]?.textContent).toBe("Ada · You")
        expect(names[0]).toHaveAttribute("data-tone", "accent")
        expect(names[0]).toHaveAttribute("data-weight", "semibold")
        expect(names[1]?.textContent).toBe("Learner 2")
        expect(names[1]).toHaveAttribute("data-tone", "default")
    })

    it("falls back to the anonymous name, and still says it is the viewer", () => {
        const { container } = render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 1, username: null, isMe: true }), entry({ rank: 2, username: null })],
        }} />)
        expect(Array.from(container.querySelectorAll("[data-component=\"Text\"][data-size=\"sm\"]"), (name) => name.textContent))
            .toEqual(["Anonymous · You", "Anonymous"])
    })

    it("drops a place nobody finished rather than standing an empty step on the dais", () => {
        const { container } = render(<Podium props={{
            ...frame,
            entries: [entry({ rank: 1 }), entry({ rank: 3 })],
        }} />)
        expect(places(container)).toHaveLength(2)
        expect(Array.from(container.querySelectorAll("[data-component=\"PodiumStep\"]"), (step) => step.textContent))
            .toEqual(["1", "3"])
    })

    it("draws the whole three-step dais at rest, with nobody standing on it yet", () => {
        const { container } = render(<Podium props={{ ...frame, entries: [] }} isLoading />)
        expect(places(container)).toHaveLength(3)
        expect(Array.from(container.querySelectorAll("[data-component=\"RankMark\"]"), (mark) => mark.getAttribute("data-loading")))
            .toEqual(["true", "true", "true"])
        expect(container.querySelectorAll("[data-component=\"Avatar\"][data-loading=\"true\"]")).toHaveLength(3)
        expect(container.querySelector("[data-component=\"Text\"]")).toHaveAttribute("data-loading", "true")
    })

    it("draws nothing at all once a settled week has no finishers", () => {
        const { container } = render(<Podium props={{ ...frame, entries: [] }} />)
        expect(places(container)).toHaveLength(0)
    })

    it("names each finisher's portrait so the dais is readable without the labels", () => {
        const { container } = render(<Podium props={{
            ...frame,
            entries: [
                entry({ rank: 1, username: "Ada", avatar: "https://example.com/ada.png" }),
                entry({ rank: 2, username: null }),
            ],
        }} />)
        expect(Array.from(container.querySelectorAll("[data-component=\"Avatar\"] img"), (image) => image.getAttribute("alt")))
            .toEqual(["Ada", "Anonymous"])
    })
})
