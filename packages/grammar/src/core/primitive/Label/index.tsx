import type { ReactNode } from "react"
import { getLabelClassName } from "./classNames.js"

export type LabelProps = {
    readonly id?: string
    readonly children: ReactNode
    readonly depth?: "top" | "nested"
}

/** Names a bounded surface region without claiming document-outline heading rank. */
export const Label = ({ id, children, depth = "top" }: LabelProps) => (
    <span
        id={id}
        className={getLabelClassName(depth)}
        data-grammar-label="true"
        data-grammar-label-depth={depth}
    >
        {children}
    </span>
)
