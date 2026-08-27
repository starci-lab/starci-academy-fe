export type LeadingNumberProps = {
    /** One-based position of the item inside its authored sequence. */
    readonly position: number
}

/**
 * Product-neutral ordinal prefix for readable ordered rows.
 *
 * The punctuation and treatment are intentionally closed: an ordinal prefix is
 * quiet reading structure (`1.`), never a badge, chip, status, or decoration.
 */
export const LeadingNumber = ({ position }: LeadingNumberProps) => (
    <span
        className="starci-core-leading-number"
        data-component="LeadingNumber"
        data-grammar-leading-number="true"
    >
        {position}.
    </span>
)

export const meta = { shape: "leaf", grammar: "core" } as const
