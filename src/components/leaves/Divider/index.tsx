import { Text } from "@/components/leaves/Text"
import { dividerClassName, dividerRuleClassName } from "./classNames"

/**
 * LEAF - `Divider`: the line that says two things above and below it are alternatives.
 *
 * THE LABEL IS THE POINT. A bare rule says "these are separate"; a rule reading OR says "pick one
 * or the other", which is the whole reason it sits between a set of shortcuts and a form. A
 * divider without a word is decoration, so the word is required here rather than optional.
 *
 * IT IS `role="separator"` AND THE WORD IS PART OF IT, so a screen reader announces the boundary
 * rather than reading a stray syllable between two groups of controls.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type DividerData = {
    /** The already-resolved word that names the choice. */
    readonly label: string
}

/** Props for {@link Divider}. Three fixed slots, no fourth. */
export type DividerProps = { readonly props: DividerData }

/**
 * Draw a labelled boundary.
 *
 * @param input - {@link DividerProps}
 */
export const Divider = (props: DividerProps) => {
    const data = props.props
    return (
        <div role="separator" aria-label={data.label} className={dividerClassName}>
            <span aria-hidden="true" className={dividerRuleClassName} />
            <Text props={{ content: data.label, size: "sm", tone: "muted" }} />
            <span aria-hidden="true" className={dividerRuleClassName} />
        </div>
    )
}
