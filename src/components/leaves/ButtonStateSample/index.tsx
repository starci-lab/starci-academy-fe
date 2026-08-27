import type { ButtonVariant } from "@/components/leaves/Button"
import { getButtonStateSampleClassName } from "./classNames"

/** One non-interactive sample of the exact treatment used by a neighboring button state. */
export type ButtonStateSampleData = {
    readonly label: string
    readonly variant: ButtonVariant
    readonly disabled?: boolean
}

/** Closed leaf props for a button-treatment sample. */
export type ButtonStateSampleProps = { readonly props: ButtonStateSampleData; readonly isLoading?: boolean }

/** Render button paint without creating a fake action in the accessibility tree. */
export const ButtonStateSample = (props: ButtonStateSampleProps) => (
    <span
        aria-hidden="true"
        className={getButtonStateSampleClassName(props.props.variant)}
    >
        {props.props.label}
    </span>
)
