/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { FollowButton, meta, type FollowButtonProps } from "@/components/blocks/community/FollowButton"

/**
 * What these tests guard: that a dense surface never grows twenty primaries, and that the
 * control reports the press rather than deciding the answer. A button that flipped its own
 * label would disagree with the server the first time a request failed.
 */

/** Render with the given props and hand back the button. */
const renderButton = (props: Partial<FollowButtonProps> = {}): HTMLButtonElement => {
    const merged: FollowButtonProps = {
        isFollowing: false,
        followLabel: "Follow",
        followingLabel: "Following",
        ...props,
    }
    const { container } = render(<FollowButton {...merged} />)
    const button = container.querySelector("button")
    if (!button) throw new Error("FollowButton rendered nothing")
    return button
}

afterEach(() => {
    cleanup()
})

describe("FollowButton", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "FollowButton" })
    })

    it("is the primary when it stands alone", () => {
        expect(renderButton().getAttribute("data-variant")).toBe("primary")
    })

    it("steps down once following, so the done state stops asking", () => {
        expect(renderButton({ isFollowing: true }).getAttribute("data-variant")).toBe("secondary")
    })

    it("gets out of the way on a dense surface, whichever state it is in", () => {
        expect(renderButton({ isQuiet: true }).getAttribute("data-variant")).toBe("ghost")
        cleanup()
        expect(renderButton({ isQuiet: true, isFollowing: true }).getAttribute("data-variant")).toBe("ghost")
    })

    it("reports the press rather than answering it", () => {
        const onToggle = vi.fn()
        fireEvent.click(renderButton({ onToggle }))
        expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it("refuses a second press while the first is still in flight", () => {
        const onToggle = vi.fn()
        const button = renderButton({ onToggle, isPending: true })
        fireEvent.click(button)
        expect(onToggle).not.toHaveBeenCalled()
    })
})
