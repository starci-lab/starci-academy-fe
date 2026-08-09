/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    SurfaceListCard,
    SurfaceListCardRow,
    meta,
    type SurfaceListCardItem,
    type SurfaceListCardProps,
} from "@/components/blocks/cards/SurfaceListCard"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that a settled-empty list SAYS SO instead of resting, which is the
 * bug the original carried (it rendered nothing at all and left a titled card with a hole in
 * it); and that a row's way on is an address rather than a pressable row, so it can be opened
 * in a new tab, copied, and read before it is followed.
 */

/** The way out of an empty list. */
const EmptyAction = () => <span data-testid="empty-action">browse</span>

/** Two settled rows. */
const ROWS: ReadonlyArray<SurfaceListCardItem> = [
    { id: "a", title: "Systems Design", fact: "40%", icon: "course", href: "/courses/a", hrefLabel: "Open" },
    { id: "b", title: "Full Stack", fact: "12%", icon: "course" },
]

/** Render the card with the given props and hand back the root node. */
const renderCard = (props: Partial<SurfaceListCardProps> = {}): Element => {
    const merged: SurfaceListCardProps = {
        label: "My courses",
        rows: ROWS,
        emptyTitle: "You have not enrolled in a course yet",
        emptyAction: EmptyAction,
        ...props,
    }
    const { container } = render(<SurfaceListCard {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("SurfaceListCard rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("SurfaceListCardRow", () => {
    it("draws the row key, and wears its classes rather than any of its own", () => {
        const { container } = render(<SurfaceListCardRow title="Systems Design" icon="course" />)
        const root = container.firstElementChild
        expect(root?.getAttribute("data-node")).toBe("list-row")
        expect(root?.getAttribute("data-roles")).toBe("media body action")
        expect(root?.getAttribute("class")).toBe(contractSpec("list-row").classes)
    })

    it("lines the fact up at the far end of the row rather than under the name", () => {
        const { container } = render(<SurfaceListCardRow title="Systems Design" fact="40%" icon="course" />)
        const line = container.querySelector("[data-node='key-value-row']")
        expect(line?.children[0].textContent).toBe("Systems Design")
        expect(line?.children[1].textContent).toBe("40%")
    })

    it("offers a real address rather than a row that navigates when pressed", () => {
        const { container } = render(
            <SurfaceListCardRow title="Systems Design" icon="course" href="/courses/a" hrefLabel="Open" />,
        )
        const link = container.querySelector("a")
        expect(link?.getAttribute("href")).toBe("/courses/a")
        expect(link?.textContent).toContain("Open")
    })

    it("offers no way on when there is nowhere to go", () => {
        const { container } = render(<SurfaceListCardRow title="Full Stack" icon="course" />)
        expect(container.querySelector("a")).toBeNull()
    })
})

describe("SurfaceListCard", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "SurfaceListCard" })
    })

    it("draws one bounded surface holding every row", () => {
        const root = renderCard({ meta: "2 enrolled" })
        expect(root.getAttribute("data-node")).toBe("surface-card")
        expect(root.querySelectorAll("[data-node='list-row']").length).toBe(2)
        expect(root.querySelector("[data-node='section-header']")?.children[1].textContent).toBe("2 enrolled")
    })

    it("rests as itself, at the height of a real list", () => {
        const root = renderCard({ isLoading: true })
        const rows = root.querySelectorAll("[data-node='list-row']")
        expect(rows.length).toBe(3)
        expect(root.querySelector("[data-component='IconTile']")?.getAttribute("data-loading")).toBe("true")
    })

    it("says what is missing when the list settles with nothing, rather than shimmering forever", () => {
        const root = renderCard({ rows: [] })
        const panel = root.querySelector("[data-node='empty-state']")
        expect(panel?.querySelector("h3")?.textContent).toBe("You have not enrolled in a course yet")
        expect(panel?.querySelector("[data-testid='empty-action']")).not.toBeNull()
        expect(root.querySelector("[data-node='list-row']")).toBeNull()
    })

    it("reads the wait before the emptiness, so a first load is never reported as nothing", () => {
        const root = renderCard({ rows: [], isLoading: true })
        expect(root.querySelector("[data-node='empty-state']")).toBeNull()
        expect(root.querySelectorAll("[data-node='list-row']").length).toBe(3)
    })
})
