/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { UserCell, meta, type UserCellProps } from "@/components/composites/lists/UserCell"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that a person is never anonymous. The name is the identity - it seeds
 * the initials and it is the alternative text - so no branch of this component can produce the
 * empty grey circle. The second guard is the trailing position, which is where a list puts its
 * own business and where the handle falls back to when a list puts nothing there.
 */

/** A stand-in for whatever a list pins to the end of the row. */
const Trailing = () => <span data-part="trailing">1st</span>

/** Render with the given props and hand back the row. */
const renderCell = (props: Partial<UserCellProps> = {}): Element => {
    const merged: UserCellProps = { name: "Ada Lovelace", ...props }
    const { container } = render(<UserCell {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("UserCell rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("UserCell", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "UserCell" })
    })

    it("draws the registry key, and wears its classes rather than any of its own", () => {
        const root = renderCell()
        expect(root.getAttribute("data-node")).toBe("card-header")
        expect(root.getAttribute("class")).toBe(contractSpec("card-header").classes)
    })

    it("identifies the person even with no picture to show", () => {
        const root = renderCell()
        expect(root.children[0].getAttribute("data-component")).toBe("Avatar")
        expect(root.children[0].textContent).toBe("AL")
        expect(root.children[1].textContent).toBe("Ada Lovelace")
    })

    it("puts the handle at the end when the list pins nothing there", () => {
        expect(renderCell({ handle: "@ada" }).children[2].textContent).toBe("@ada")
    })

    it("gives the trailing position to the list when it wants it", () => {
        const root = renderCell({ handle: "@ada", trailing: Trailing })
        expect(root.children[2].getAttribute("data-part")).toBe("trailing")
    })

    it("rests as the same row, keeping its footprint", () => {
        const root = renderCell({ isLoading: true })
        expect(root.getAttribute("data-node")).toBe("card-header")
        expect(root.children[0].getAttribute("data-loading")).toBe("true")
        expect(root.children[1].getAttribute("data-loading")).toBe("true")
    })

    it("offers no className door", () => {
        const backDoor = { className: "back-door" } as unknown as UserCellProps
        const { container } = render(<UserCell {...backDoor} name="Ada Lovelace" />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("card-header").classes)
    })
})
