import { cn } from "@heroui/react"
import type { ComponentPropsWithoutRef } from "react"

export type GrammarRootProps = Omit<ComponentPropsWithoutRef<"div">, "color"> & {
    /** `system` follows the reader unless an explicit light or dark scope is requested. */
    readonly theme?: "system" | "light" | "dark"
}

/**
 * Opt-in StarCi visual-DNA boundary.
 *
 * Core components remain compatible outside this boundary, while a complete
 * surface can opt into the packaged StarCi tokens with one stable root.
 */
export const GrammarRoot = ({ className, theme = "system", ...props }: GrammarRootProps) => (
    <div
        {...props}
        className={cn("starci-core-root", className)}
        data-grammar="starci-core"
        data-grammar-theme={theme}
    />
)
