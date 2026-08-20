import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { DomainMasteryGridBase, type DomainMastery } from "./component"

const domains: ReadonlyArray<DomainMastery> = [
    {
        id: "arrays",
        name: "Arrays",
        total: 12,
        solved: 9,
        countLabel: "9 / 12 problems",
        label: "Arrays, 9 of 12 solved",
        meterLabel: "Arrays mastery",
    },
    {
        id: "graphs",
        name: "Graphs",
        total: 8,
        countLabel: "0 / 8 problems",
        label: "Graphs, 0 of 8 solved",
        meterLabel: "Graphs mastery",
    },
    {
        id: "geometry",
        name: "Geometry",
        total: 0,
        solved: 0,
        countLabel: "No problems yet",
        label: "Geometry, no problems yet",
        meterLabel: "Geometry mastery",
    },
]

/** The glyph a mark actually draws, read as the outline the reader sees. */
const glyphOf = (host: Element | null) => Array.from(host?.querySelectorAll("path") ?? [])
    .map((path) => path.getAttribute("d"))
    .join("|")

/** The same reading taken from the named icon, so a test states which glyph it expects. */
const glyphNamed = (name: IconName) => {
    const view = render(<Icon props={{ name, role: "leading" }} />)
    const glyph = glyphOf(view.container)
    view.unmount()
    return glyph
}

const noticeMark = () => document.querySelector("[data-component=\"IconTile\"]")

const meterValues = () => screen.getAllByRole("progressbar").map((bar) => bar.getAttribute("aria-valuenow"))

describe("DomainMasteryGridBase", () => {
    it("rests six inert topic cards while both answers are in flight", () => {
        const open = vi.fn()
        render(<DomainMasteryGridBase state="pending" props={{ domains }} on={{ open }} />)

        const cards = screen.getAllByRole("button")
        expect(cards).toHaveLength(6)
        for (const card of cards) {
            expect(card).toBeDisabled()
            expect(card).toHaveAttribute("aria-busy", "true")
        }
        fireEvent.click(cards[0])
        expect(open).not.toHaveBeenCalled()
        expect(screen.queryByText("Arrays")).toBeNull()
        expect(screen.queryAllByRole("progressbar")).toHaveLength(0)
        expect(document.querySelectorAll("[data-component=\"Progress\"][data-loading=\"true\"]")).toHaveLength(6)
    })

    it("draws each topic's standing as a percentage of its own catalog", () => {
        render(<DomainMasteryGridBase state="ready" props={{ domains }} />)

        expect(screen.getByText("Arrays")).toHaveAttribute("data-weight", "semibold")
        expect(screen.getByText("9 / 12 problems")).toHaveAttribute("data-tone", "muted")
        expect(meterValues()).toEqual(["75", "0", "0"])
        expect(screen.getByLabelText("Arrays mastery")).toBeInTheDocument()
    })

    it("opens the topic the reader chose", () => {
        const open = vi.fn()
        render(<DomainMasteryGridBase state="ready" props={{ domains }} on={{ open }} />)

        fireEvent.click(screen.getByRole("button", { name: "Graphs, 0 of 8 solved" }))
        expect(open).toHaveBeenCalledWith("graphs")
        fireEvent.click(screen.getByRole("button", { name: "Arrays, 9 of 12 solved" }))
        expect(open).toHaveBeenCalledWith("arrays")
        expect(open).toHaveBeenCalledTimes(2)
    })

    it("keeps a card pressable when the page named no opener for it", () => {
        render(<DomainMasteryGridBase state="ready" props={{ domains }} on={{}} />)
        const card = screen.getByRole("button", { name: "Arrays, 9 of 12 solved" })
        fireEvent.click(card)
        expect(card).toBeEnabled()
        expect(screen.getByText("Arrays")).toBeInTheDocument()
    })

    it("keeps a card pressable when the page reported nothing at all", () => {
        render(<DomainMasteryGridBase state="ready" props={{ domains: [domains[0]] }} />)
        const card = screen.getByRole("button", { name: "Arrays, 9 of 12 solved" })
        fireEvent.click(card)
        expect(card).toBeEnabled()
        expect(screen.getByText("Arrays")).toBeInTheDocument()
    })

    it("empties the field rather than inventing topics when the catalog sent none", () => {
        render(<DomainMasteryGridBase state="ready" props={{}} />)
        const grid = document.querySelector("[data-node=\"domain-mastery-grid\"]")
        expect(grid).toBeInTheDocument()
        expect(grid?.children).toHaveLength(0)
        expect(screen.queryByRole("button")).toBeNull()
    })

    it("still names every topic when the personal figures failed, and claims no standing", () => {
        render(<DomainMasteryGridBase state="progress-failed" props={{ domains }} />)

        expect(screen.getByText("Arrays")).toBeInTheDocument()
        expect(screen.getByText("Geometry")).toBeInTheDocument()
        expect(meterValues()).toEqual(["0", "0", "0"])
    })

    it("asks a signed-out reader to sign in rather than drawing an empty field", () => {
        const recover = vi.fn()
        render(
            <DomainMasteryGridBase
                state="guest"
                props={{
                    noticeMessage: "Sign in to see your topics",
                    noticeDescription: "Your standing is personal to your account.",
                    noticeActionLabel: "Sign in",
                }}
                on={{ recover }}
            />,
        )

        expect(screen.getByText("Sign in to see your topics")).toBeInTheDocument()
        expect(screen.getByText("Your standing is personal to your account.")).toHaveAttribute("data-size", "xs")
        expect(glyphOf(noticeMark())).toBe(glyphNamed("signIn"))
        fireEvent.click(screen.getByRole("button", { name: "Sign in" }))
        expect(recover).toHaveBeenCalledTimes(1)
    })

    it("offers a failed catalog a retry, and keeps it inert without a handler", () => {
        render(
            <DomainMasteryGridBase
                state="catalog-failed"
                props={{ noticeMessage: "The topics could not be loaded", noticeActionLabel: "Try again" }}
            />,
        )

        expect(glyphOf(noticeMark())).toBe(glyphNamed("retry"))
        const action = screen.getByRole("button", { name: "Try again" })
        fireEvent.click(action)
        expect(action).toBeEnabled()
        expect(screen.getByText("The topics could not be loaded")).toBeInTheDocument()
    })

    it("settles an empty catalog with the practice mark and no words to show", () => {
        render(<DomainMasteryGridBase state="empty" props={{}} />)

        expect(glyphOf(noticeMark())).toBe(glyphNamed("practice"))
        expect(screen.queryByRole("button")).toBeNull()
        const lines = document.querySelectorAll("[data-component=\"Text\"]")
        expect(lines).toHaveLength(1)
        expect(lines[0]).toHaveTextContent("")
    })
})
