import { Text } from "../Text/index.js"

export type DividerProps = {
    /** Visible, localized word naming the alternative boundary. */
    readonly label: string
}

/** Labelled alternative boundary with intrinsic separator semantics. */
export const Divider = ({ label }: DividerProps) => (
    <div
        data-tier="atom"
        data-component="Divider"
        role="separator"
        aria-label={label}
        className="flex flex-row items-center gap-3"
    >
        <span aria-hidden="true" className="h-px grow bg-border" />
        <Text as="span" size="sm" tone="muted">{label}</Text>
        <span aria-hidden="true" className="h-px grow bg-border" />
    </div>
)
