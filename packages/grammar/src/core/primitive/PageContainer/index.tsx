import { cn } from "@heroui/react"
import type { ComponentPropsWithoutRef } from "react"

export type PageContainerProps = ComponentPropsWithoutRef<"div"> & {
    readonly measure?: "reading" | "product" | "full"
}

/** Centred responsive page inset using the packaged StarCi measure scale. */
export const PageContainer = ({ className, measure = "product", ...props }: PageContainerProps) => (
    <div
        {...props}
        className={cn("starci-core-page-container", className)}
        data-grammar-page-measure={measure}
    />
)
