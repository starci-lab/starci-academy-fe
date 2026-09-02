import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { getDisclosureIndicatorClassName } from "./classNames"

/** Visual state for the native disclosure indicator. */
export type DisclosureIndicatorData = {
    readonly isOpen: boolean
}

/** Props for {@link DisclosureIndicator}. */
export type DisclosureIndicatorProps = { readonly props: DisclosureIndicatorData; readonly isLoading?: boolean }

/** Draw the canonical foreground chevron and rotate it only while expanded. */
export const DisclosureIndicator = (props: DisclosureIndicatorProps) => (
    <span
        className={getDisclosureIndicatorClassName(props.props.isOpen)}
    >
        <Icon source={iconSourceFor("disclosure", "chip")} role={"chip"} />
    </span>
)
