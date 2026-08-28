import { Icon, type IconName } from "@/components/leaves/Icon"
import { labelClassName, labelScreenReaderClassName } from "./classNames"

/**
 * LEAF - `Label`: the name of a box, tied to it.
 *
 * `htmlFor` IS REQUIRED. A label not tied to a control is decoration: the click does not focus the
 * box, and a screen reader announces an unnamed field. That is the whole reason this leaf exists
 * rather than a `Text` beside an `Input`.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LabelData = {
    /** The id of the control this names. */
    readonly htmlFor: string
    /** The already-resolved words. Copy, so it never rests. */
    readonly content: string
    /** The meaning drawn before the words. It inherits the label's colour, never its own. */
    readonly icon?: IconName
    /** Keep the accessible name while removing repeated visible copy. */
    readonly visibility?: "visible" | "screenReader"
}

/** Props for {@link Label}. Three fixed slots, no fourth. */
export type LabelProps = { readonly props: LabelData }

/**
 * Draw a control's name.
 *
 * @param input - {@link LabelProps}
 */
export const Label = (props: LabelProps) => {
    const data = props.props
    return (
        <label htmlFor={data.htmlFor} className={data.visibility === "screenReader" ? labelScreenReaderClassName : labelClassName}>
            {data.icon === undefined ? null : <Icon props={{ name: data.icon, role: "chip" }} />}
            {data.content}
        </label>
    )
}
