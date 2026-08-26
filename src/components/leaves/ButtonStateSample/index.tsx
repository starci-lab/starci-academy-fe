import { buttonVariants } from "@heroui/styles"
import type { LeafProps } from "@/components/contracts/props"
import type { ButtonVariant } from "@/components/leaves/Button"

/** One non-interactive sample of the exact treatment used by a neighboring button state. */
export type ButtonStateSampleData = {
    readonly label: string
    readonly variant: ButtonVariant
    readonly disabled?: boolean
}

/** Closed leaf props for a button-treatment sample. */
export type ButtonStateSampleProps = LeafProps<ButtonStateSampleData>

/** Render button paint without creating a fake action in the accessibility tree. */
export const ButtonStateSample = ({ props }: ButtonStateSampleProps) => (
    <span
        aria-hidden="true"
        className={buttonVariants({ variant: props.variant, size: "sm" })}
        data-component="ButtonStateSample"
        data-variant={props.variant}
        data-disabled={props.disabled === true ? "true" : "false"}
    >
        {props.label}
    </span>
)

/** Source-level tier marker for the pure visual sample leaf. */
export const meta = { shape: "leaf", world: "pure" } as const
