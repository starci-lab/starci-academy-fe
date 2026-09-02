import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { destinationCueCaretClassName, destinationCueClassName, destinationCueLoadingClassName } from "./classNames"

/** Resolved copy for a destination already owned by a surrounding press target. */
export type DestinationCueData = { readonly label?: string }
/** Public input for the non-interactive destination cue. */
export type DestinationCueProps = { readonly props: DestinationCueData; readonly isLoading?: boolean }

/** Draw words first and the only permitted directional glyph after them. */
export const DestinationCue = (props: DestinationCueProps) => {
    const isLoading = props.isLoading ?? false
    if (isLoading) return <span className={destinationCueLoadingClassName} data-destination-cue="true" data-loading="true" aria-hidden>&nbsp;</span>
    return (
        <span className={destinationCueClassName} data-destination-cue="true">
            <span data-tone="accent">{props.props.label ?? ""}</span>
            <span className={destinationCueCaretClassName} data-destination-cue-caret="true" aria-hidden="true"><Icon source={iconSourceFor("next", "chip")} role={"chip"} /></span>
        </span>
    )
}
