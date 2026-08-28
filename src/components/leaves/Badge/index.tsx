import { Chip } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { badgeRestingClassName } from "./classNames"

/**
 * LEAF - `Badge`: a short figure or word set apart from the line it sits on.
 *
 * TONE IS A MEANING, NOT A COLOUR. `success` survives a theme change and a palette rewrite;
 * `green` survives neither, and the first screen to need a different green is the one where the
 * badge stops matching everything else that means the same thing.
 */

/** What the badge is saying about the thing it labels. */
export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type BadgeData = {
    /** The already-resolved figure or word. Absent while loading. */
    readonly content?: string
    /** What it is saying. */
    readonly tone?: BadgeTone
    /** Optional status glyph carried inside the same compact chip. */
    readonly icon?: IconName
}

/** Props for {@link Badge}. */
export type BadgeProps = { readonly props: BadgeData; readonly isLoading?: boolean }

/** The tone, said once, as the vendor's own token. */
const TONE_COLORS = {
    neutral: "default",
    accent: "accent",
    success: "success",
    warning: "warning",
    danger: "danger",
} as const

/**
 * Draw a badge.
 *
 * @param input - {@link BadgeProps}
 */
export const Badge = (props: BadgeProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    const tone = data.tone ?? "neutral"
    return (
        <Chip
            data-tone={tone}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            color={TONE_COLORS[tone]}
            variant="soft"
            size="sm"
            className={isLoading ? badgeRestingClassName : undefined}
        >
            {data.icon === undefined ? null : <Icon props={{ name: data.icon, role: "chip" }} />}
            {data.content ?? ""}
        </Chip>
    )
}
