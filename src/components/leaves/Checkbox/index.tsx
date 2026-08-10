import { Checkbox as HeroCheckbox } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Checkbox`: a choice the reader makes about the form around it.
 *
 * IT IS CONTROLLED, unlike the text boxes beside it. A tick is a decision the surface has to act
 * on immediately - a submit refused until terms are agreed cannot wait to read the value at
 * submit time - so this one reports on change while the boxes stay uncontrolled.
 *
 * THE LABEL IS PART OF THE CONTROL, not a `Text` beside it: the whole row has to be pressable, and
 * a label that only sits nearby leaves a target the width of the tick itself.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type CheckboxData = {
    /** The already-resolved words beside the tick. */
    readonly label: string
    /** Whether it is ticked. Controlled - see the file header. */
    readonly isSelected: boolean
    /** The form field name, for the submitted payload. */
    readonly name?: string
}

/** What ticking it does. */
export type CheckboxActions = {
    /** Called with the new value when the reader changes it. */
    readonly change?: (isSelected: boolean) => void
}

/** Props for {@link Checkbox}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type CheckboxProps = LeafProps<CheckboxData, CheckboxActions>

/** The tick and its words on one baseline, with the whole row pressable. */
const ROOT_CLASSES = "flex flex-row items-center gap-2 text-sm"

/**
 * Draw a choice.
 *
 * @param input - {@link CheckboxProps}
 */
export const Checkbox = ({ props, on }: CheckboxProps) => (
    <HeroCheckbox
        data-tier="leaf"
        data-component="Checkbox"
        data-selected={props.isSelected ? "true" : "false"}
        name={props.name}
        isSelected={props.isSelected}
        onChange={(isSelected: boolean) => on?.change?.(isSelected)}
        className={ROOT_CLASSES}
    >
        {props.label}
    </HeroCheckbox>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
