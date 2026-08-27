import { Button as HeroButton } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { iconButtonClassName } from "./classNames"

/**
 * LEAF - `IconButton`: a control the bar has room for only as a glyph.
 *
 * `label` IS REQUIRED AND IS NOT DRAWN. A glyph alone is unreadable to a screen reader and
 * ambiguous to everyone else, so the name is mandatory and becomes the accessible name and the
 * tooltip. A control that could be nameless is a control somebody will ship nameless.
 *
 * IT IS A SEPARATE LEAF FROM `Button` because the two differ in what they owe: a button owes a
 * visible label, and this one owes an invisible one. Collapsing them would make the visible label
 * optional, which is the exact hole this file exists to close.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type IconButtonData = {
    /** The meaning drawn. */
    readonly icon: IconName
    /** The already-resolved name. Read, never seen. */
    readonly label: string
    /** Whether this control is currently the active one, for a toggle that has a state. */
    readonly isActive?: boolean
}

/** What pressing it does. */
export type IconButtonActions = {
    /** Called on press. */
    readonly press?: () => void
}

/** Props for {@link IconButton}. */
export type IconButtonProps = { readonly props: IconButtonData; readonly on?: IconButtonActions; readonly isLoading?: boolean }

/**
 * Draw a glyph that acts.
 *
 * @param input - {@link IconButtonProps}
 */
export const IconButton = (props: IconButtonProps) => {
    const data = props.props
    const on = props.on
    return (
        <HeroButton
            data-active={data.isActive === true ? "true" : "false"}
            type="button"
            variant="tertiary"
            className={iconButtonClassName}
            isIconOnly
            aria-label={data.label}
            onPress={on?.press}
        >
            <Icon props={{ name: data.icon, role: "leading" }} />
        </HeroButton>
    )
}
