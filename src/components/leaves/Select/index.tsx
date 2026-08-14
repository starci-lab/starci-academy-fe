import { ListBox, Select as HeroSelect } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Select`: one choice out of a short closed set.
 *
 * Target path: `src/components/leaves/Select/index.tsx`.
 *
 * IT IS NOT `ChoiceTabs`, and the difference is a promise rather than a shape. Tabs show every
 * option at once and switch the panel beneath them; a select hides its options behind a trigger and
 * fills a field. Same data, opposite commitment - one says "here is everything you could be looking
 * at", the other says "answer this and move on".
 *
 * THE OPTIONS ARRIVE ALREADY RESOLVED. A caller passes ids with their words, never a translator and
 * never a vendor node, so the popover cannot end up holding a component nobody can constrain.
 */

/** One option, already worded. */
export type SelectOption = {
    /** The value reported on selection. */
    readonly id: string
    /** The already-resolved words for it. */
    readonly label: string
}

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type SelectData = {
    /** The id its label points at. */
    readonly id: string
    /** The form field name, for the submitted payload. */
    readonly name: string
    /** The already-resolved accessible name. */
    readonly label: string
    /** The closed set, in the order it should be read. */
    readonly options: ReadonlyArray<SelectOption>
    /** Which option is chosen. Absent means nothing is, and the placeholder shows instead. */
    readonly selectedKey?: string
    /** The already-resolved prompt shown while nothing is chosen. */
    readonly placeholder?: string
    /** Whether the line beneath it is a refusal. */
    readonly isInvalid?: boolean
    /** Whether the control refuses input. */
    readonly disabled?: boolean
}

/** What choosing reports. */
export type SelectActions = {
    /** Called with the chosen option's id. */
    readonly select?: (id: string) => void
}

/** Props for {@link Select}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type SelectProps = LeafProps<SelectData, SelectActions>

/**
 * Draw the choice.
 *
 * The trigger reads the CHOSEN OPTION'S WORDS rather than its id, which is why the lookup happens
 * here: the id is what the payload carries and what a reader would never recognise.
 *
 * @param input - {@link SelectProps}
 */
export const Select = ({ props, on }: SelectProps) => {
    const chosen = props.options.find((option) => option.id === props.selectedKey)

    return (
        <HeroSelect.Root<SelectOption, "single">
            data-tier="leaf"
            data-component="Select"
            fullWidth
            id={props.id}
            name={props.name}
            aria-label={props.label}
            selectedKey={props.selectedKey ?? null}
            isInvalid={props.isInvalid}
            isDisabled={props.disabled}
            onSelectionChange={(key) => {
                if (key !== null) on?.select?.(String(key))
            }}
        >
            <HeroSelect.Trigger aria-label={props.label}>
                <HeroSelect.Value>{chosen?.label ?? props.placeholder ?? ""}</HeroSelect.Value>
                <HeroSelect.Indicator />
            </HeroSelect.Trigger>
            <HeroSelect.Popover>
                <ListBox.Root aria-label={props.label}>
                    {props.options.map((option) => (
                        <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                            {option.label}
                        </ListBox.Item>
                    ))}
                </ListBox.Root>
            </HeroSelect.Popover>
        </HeroSelect.Root>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
