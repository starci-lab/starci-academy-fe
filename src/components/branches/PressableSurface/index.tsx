import type { ReactNode } from "react"
import NextLink from "next/link"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { pressableHoverClassName } from "./classNames"

/**
 * BRANCH - `PressableSurface`: the semantic action or link around a node that opens something.
 *
 * IT DRAWS ITS OWN CONTROL AND PUTS THE KEY'S NODE INSIDE IT. The branch it replaces rendered
 * somebody else's key ON a button host, which is a caller choosing the element for a key - the one
 * decision rule refuses, because two call sites of one key would then disagree about what
 * element it is. Here the button is this branch's own, and the arranged node underneath is
 * unchanged: the same key can be pressed on one screen and inert on the next.
 *
 * THE BEHAVIOUR LIVES WITH THE THING THAT BEHAVES. A cursor, a hover answer and a pressed state are
 * claims about reacting to a pointer, and the thing that reacts is the control that owns the
 * handler and the disabled state. Written into the entry instead, the table goes on drawing a
 * pointer over a node whose call site passed no handler at all, and nothing can tell it to stop.
 *
 * ONE GESTURE, ONE ANSWER. A surface whose content NAMES its destination answers hover on that name
 * - the label underlines like the link it stands for - and must not also dim: told twice, the
 * reader learns the whole row is the link and then that one line is. A surface with no such name
 * dims instead, because something has to answer.
 */

/** Which part of the surface answers a hover. */
export type PressableSurfaceHover = "label" | "surface"

/** Props for one content node wrapped in a native press target. */
export type PressableSurfaceProps = {
    readonly children: ReactNode
    /** The accessible name of the destination. */
    readonly label: string
    readonly press?: () => void
    /** A resolved internal destination. Locale ownership stays with the connected caller. */
    readonly href?: string
    /** Prevent activation while a route is unavailable or already resolving. */
    readonly disabled?: boolean
    /**
     * Which answer this surface gives on hover.
     *
     * `label` when the content holds a line marked `isPressLabel` - that line underlines and the
     * surface stays put. `surface` when it does not, and the whole thing dims.
     */
    readonly hover?: PressableSurfaceHover
    /**
     * Whether the pressed thing stands on its own ground.
     *
     * A press target and a raised object are two different claims, and a card that opens something
     * makes both. It does NOT draw a second card of its own: it hands the node to `SurfaceCard`,
     * the branch that already owns the vendor surface, so a pressable tile and the inert tile
     * beside it in the same grid are the same card with the same radius and the same elevation.
     * Without this the two halves of one grid drew different objects, and the grid read as two
     * kinds of project rather than as one kind, some of which happen to link somewhere.
     */
    readonly isRaised?: boolean
}

/** The control fills its place and reads left, and the press answers back in both modes. */
/**
 * Wrap resolved content in one press target.
 *
 * @param input - {@link PressableSurfaceProps}
 */
export const PressableSurface = (props: PressableSurfaceProps) => {
    const {
        children,
        label,
        press,
        href,
        disabled = false,
        hover = "surface",
        isRaised = false,
    } = props
    const content = isRaised
        ? <SurfaceCard>{children}</SurfaceCard>
        : children
    if (href !== undefined && !disabled) {
        return (
            <NextLink
                href={href}
                aria-label={label}
                onClick={press}
                className={pressableHoverClassName(hover)}
            >
                {content}
            </NextLink>
        )
    }
    return (
        <button
            type="button"
            aria-label={label}
            onClick={press}
            disabled={disabled}
            aria-busy={disabled || undefined}
            className={pressableHoverClassName(hover)}
        >
            {content}
        </button>
    )
}
