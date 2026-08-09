import { labelVariants } from "@heroui/react"
import type { ReactNode } from "react"
import { Icon, type IconName } from "@/components/atoms/Icon"

/**
 * ATOM - `Label`: the name of the control beneath it.
 *
 * The registry's `form-field` key declares `heading`, `field` and `meta`, and this atom is what
 * the `heading` role is drawn with when the thing being named is a control rather than a
 * section. It is not the `Heading` atom, and the difference is not cosmetic: a form label
 * belongs to ONE input and must carry `for`, while a heading belongs to a region of the document
 * outline and must not. Drawing a label as a heading puts three extra entries in the outline of
 * a sign-in form and still leaves the control unnamed.
 *
 * WHAT IT DRAWS. A real `<label>` wearing HeroUI's own label style, so the weight, the size and
 * the disabled treatment match every other field in the product without this file spelling any
 * of them.
 *
 * WHY `htmlFor` IS REQUIRED. A label with no control is decoration that happens to look like a
 * label: a screen reader reads the input as unnamed, and clicking the word does not focus the
 * box. Making the link required means there is no code path that produces one.
 */

/** Props for {@link Label}. */
export interface LabelProps {
    /** The already-resolved label text. */
    children: ReactNode
    /** The id of the control this names. Required - a label with no control names nothing. */
    htmlFor: string
    /** The meaning drawn before the words. It inherits the label's colour, never its own. */
    icon?: IconName
}

/**
 * Keeps the glyph on the label's baseline. The gap is the atom's own business, not the registry
 * node's: an icon and the word it marks are one label, not two children of the field above.
 */
const BASE_CLASSES = labelVariants().concat(" inline-flex items-center gap-2")

/**
 * Draw the name of a control.
 *
 * @param props - {@link LabelProps}
 */
export const Label = ({ children, htmlFor, icon }: LabelProps) => (
    <label data-tier="atom" data-component="Label" htmlFor={htmlFor} className={BASE_CLASSES}>
        {icon === undefined ? null : <Icon name={icon} size="sm" />}
        {children}
    </label>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Label" } as const
