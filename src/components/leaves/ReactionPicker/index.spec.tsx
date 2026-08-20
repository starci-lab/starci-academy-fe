import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { ReactionPicker, type ReactionLabels } from "./index"

const labels: ReactionLabels = {
    [ReactionType.Like]: "Like",
    [ReactionType.Love]: "Love",
    [ReactionType.Haha]: "Haha",
    [ReactionType.Wow]: "Wow",
    [ReactionType.Sad]: "Sad",
    [ReactionType.Angry]: "Angry",
}

const assets = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("img"), (image) => image.getAttribute("src"))

describe("ReactionPicker", () => {
    it("draws nothing at all for a reader who cannot react to an unreacted activity", () => {
        const { container } = render(<ReactionPicker props={{ label: "React", count: 0, labels }} />)
        expect(container.firstElementChild).toBeNull()
    })

    it("summarises a reacted activity as its winning asset beside the tally", () => {
        const { container } = render(
            <ReactionPicker props={{ label: "React", count: 7, selected: ReactionType.Love, labels }} />,
        )
        const summary = container.querySelector("[data-component=\"ReactionPicker\"]")
        expect(summary?.textContent).toBe("7")
        expect(assets(container)).toEqual(["/reactions/love.svg"])
        expect(screen.queryByRole("button")).toBeNull()
    })

    it("summarises a tally with no reaction of the viewer's own as the number alone", () => {
        const { container } = render(<ReactionPicker props={{ label: "React", count: 3, selected: null, labels }} />)
        expect(container.querySelector("[data-component=\"ReactionPicker\"]")?.textContent).toBe("3")
        expect(assets(container)).toEqual([])
    })

    it("offers the word rather than an asset while the viewer has not reacted", () => {
        const select = vi.fn()
        const { container } = render(
            <ReactionPicker props={{ label: "React", count: 0, labels }} on={{ select }} />,
        )
        const trigger = screen.getByRole("button", { name: "React" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        expect(trigger.textContent).toBe("React")
        expect(assets(container)).toEqual([])
    })

    it("replaces the word with the viewer's own asset and keeps the tally beside it", () => {
        const select = vi.fn()
        const { container } = render(
            <ReactionPicker props={{ label: "React", count: 4, selected: ReactionType.Haha, labels }} on={{ select }} />,
        )
        const trigger = screen.getByRole("button", { name: "React" })
        expect(trigger.textContent).toBe("4")
        expect(assets(container)).toEqual(["/reactions/haha.svg"])
    })

    it("refuses the press while a reaction is still in flight", () => {
        const select = vi.fn()
        render(
            <ReactionPicker props={{ label: "React", count: 1, labels, isPending: true }} on={{ select }} />,
        )
        const trigger = screen.getByRole("button", { name: "React" })
        expect(trigger).toBeDisabled()
        fireEvent.click(trigger)
        expect(screen.queryByRole("button", { name: "Love" })).toBeNull()
    })

    it("opens all six choices on the trigger and closes them on a second press", async () => {
        const select = vi.fn()
        const { container } = render(
            <ReactionPicker props={{ label: "React", count: 0, labels }} on={{ select }} />,
        )
        const trigger = screen.getByRole("button", { name: "React" })
        fireEvent.click(trigger)
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(screen.getAllByRole("button").map((button) => button.getAttribute("aria-label")))
            .toEqual(["React", "Like", "Love", "Haha", "Wow", "Sad", "Angry"])
        expect(assets(container)).toEqual([
            "/reactions/like.svg",
            "/reactions/love.svg",
            "/reactions/haha.svg",
            "/reactions/wow.svg",
            "/reactions/sad.svg",
            "/reactions/angry.svg",
        ])
        fireEvent.click(trigger)
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        await waitForElementToBeRemoved(() => screen.queryByRole("button", { name: "Love" }))
    })

    it("reports the chosen reaction and shuts the picker", () => {
        const select = vi.fn()
        render(<ReactionPicker props={{ label: "React", count: 0, labels }} on={{ select }} />)
        fireEvent.click(screen.getByRole("button", { name: "React" }))
        fireEvent.click(screen.getByRole("button", { name: "Wow" }))
        expect(select).toHaveBeenCalledExactlyOnceWith(ReactionType.Wow)
        expect(screen.getByRole("button", { name: "React" })).toHaveAttribute("aria-expanded", "false")
    })

    it("reports removal when the viewer presses the reaction they already gave", () => {
        const select = vi.fn()
        render(
            <ReactionPicker props={{ label: "React", count: 2, selected: ReactionType.Like, labels }} on={{ select }} />,
        )
        fireEvent.click(screen.getByRole("button", { name: "React" }))
        const chosen = screen.getByRole("button", { name: "Like" })
        expect(chosen.className).toContain("bg-accent-soft")
        expect(screen.getByRole("button", { name: "Love" }).className).not.toContain("bg-accent-soft")
        fireEvent.click(chosen)
        expect(select).toHaveBeenCalledExactlyOnceWith(null)
    })

    it("closes the open picker on Escape and ignores any other key", async () => {
        const select = vi.fn()
        render(<ReactionPicker props={{ label: "React", count: 0, labels }} on={{ select }} />)
        const trigger = screen.getByRole("button", { name: "React" })
        fireEvent.click(trigger)
        fireEvent.keyDown(document, { key: "a" })
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        fireEvent.keyDown(document, { key: "Escape" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        await waitForElementToBeRemoved(() => screen.queryByRole("button", { name: "Love" }))
    })

    it("closes on a pointer outside itself and stays open on one inside", async () => {
        const select = vi.fn()
        const { container } = render(
            <ReactionPicker props={{ label: "React", count: 0, labels }} on={{ select }} />,
        )
        const trigger = screen.getByRole("button", { name: "React" })
        fireEvent.click(trigger)
        fireEvent.pointerDown(container.querySelector("[data-component=\"ReactionPicker\"]")!)
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        fireEvent.pointerDown(document.body)
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        await waitForElementToBeRemoved(() => screen.queryByRole("button", { name: "Love" }))
    })
})
