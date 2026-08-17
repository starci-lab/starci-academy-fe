import { Icon } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/** Visual state for the native disclosure indicator. */
export type DisclosureIndicatorData = {
    readonly isOpen: boolean
}

/** Props for {@link DisclosureIndicator}. */
export type DisclosureIndicatorProps = LeafProps<DisclosureIndicatorData>

/** Draw the canonical foreground chevron and rotate it only while expanded. */
export const DisclosureIndicator = ({ props }: DisclosureIndicatorProps) => (
    <span
        data-component="DisclosureIndicator"
        className={props.isOpen
            ? "shrink-0 rotate-90 text-foreground transition-transform"
            : "shrink-0 rotate-0 text-foreground transition-transform"}
    >
        <Icon props={{ name: "disclosure", role: "chip" }} />
    </span>
)

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
