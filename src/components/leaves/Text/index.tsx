import { Typography, skeletonVariants } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Text`: one line of resolved copy, at one of two weights of attention.
 *
 * COPY IS DATA. It arrives already translated, in `props.content`, never as children - only a
 * branch assembles, and nothing below one accepts a child.
 *
 * `content` DOES NOT SURVIVE A LOADING PASS, and that answer is this leaf's alone: a text bar has
 * a declared measure of its own, so the line can rest without knowing what it will say. A control
 * whose width IS its label cannot do the same.
 */

/** Whether this is the content itself or a supporting fact beside it. */
export type TextTone = "default" | "muted"

/** The reading size. Two steps, because a third is a decision nobody makes consistently. */
export type TextSize = "sm" | "md"

/** How firmly the words are set. */
export type TextWeight = "normal" | "medium" | "semibold"

/** Whether a change to this line is announced, and how urgently. */
export type TextLive = "off" | "polite" | "assertive"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type TextData = {
    /** The already-resolved copy. Absent while loading - the bar has its own measure. */
    readonly content?: string
    /** Content itself, or a supporting fact beside it. */
    readonly tone?: TextTone
    /** The reading size. */
    readonly size?: TextSize
    /** How firmly the words are set. */
    readonly weight?: TextWeight
    /** The meaning drawn ahead of the words. It inherits this line's colour, never its own. */
    readonly icon?: IconName
    /** Whether a change to this line is announced, and how urgently. */
    readonly live?: TextLive
}

/** Props for {@link Text}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type TextProps = LeafProps<TextData>

/** The tone, said once, as the vendor's own token rather than as a colour. */
const TONE_COLORS = { default: "default", muted: "muted" } as const

/** The size step, as the vendor names it. */
const SIZE_STEPS = { sm: "sm", md: "base" } as const

/**
 * The role a live line carries. `off` is not a live region at all, so it takes no role - a
 * paragraph claiming `role="status"` while saying nothing would announce every re-render.
 */
const LIVE_ROLES = { off: undefined, polite: "status", assertive: "alert" } as const

/** Keeps the glyph on the text baseline without the line learning it is in a row. */
const WITH_ICON_CLASSES = "inline-flex items-center gap-2"

/** The resting shape - the same line box, wearing the vendor's skeleton, glyphs out. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * Draw one line of copy.
 *
 * @param input - {@link TextProps}
 */
export const Text = ({ props, isLoading = false }: TextProps) => {
    const tone = props.tone ?? "default"
    const size = props.size ?? "md"
    const live = props.live ?? "off"
    // The glyph drops while the line rests: the skeleton already covers the measure, and a glyph
    // shimmering beside it is a second thing to look at where there is nothing to read yet.
    const showsIcon = props.icon !== undefined && !isLoading
    return (
        <Typography.Paragraph
            data-tier="leaf"
            data-component="Text"
            data-tone={tone}
            data-size={size}
            data-live={live}
            data-loading={isLoading ? "true" : "false"}
            color={TONE_COLORS[tone]}
            size={SIZE_STEPS[size]}
            weight={props.weight ?? "normal"}
            role={LIVE_ROLES[live]}
            aria-live={live === "off" ? undefined : live}
            className={isLoading ? RESTING_CLASSES : (showsIcon ? WITH_ICON_CLASSES : undefined)}
        >
            {showsIcon && props.icon !== undefined ? <Icon props={{ name: props.icon, size: "sm" }} /> : null}
            {props.content ?? ""}
        </Typography.Paragraph>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
