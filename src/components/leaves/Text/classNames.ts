/** Colocated class name exports for Text. */
import { cn, skeletonVariants } from "@heroui/react"

/** Typography recipe for resolved text. */
export const textClassName = cn("text-base", "leading-6", "font-normal", "text-foreground", "data-[size=xs]:text-xs", "data-[size=xs]:leading-4", "data-[size=xs]:text-muted", "data-[size=sm]:text-sm", "data-[size=sm]:leading-5", "data-[tone=muted]:text-muted", "data-[tone=accent]:text-accent-soft-foreground", "data-[parent-emphasis=accent-soft]:group-data-[selected=true]:text-accent-soft-foreground", "data-[weight=medium]:font-medium", "data-[weight=semibold]:font-semibold", "data-[icon=true]:inline-flex", "data-[icon=true]:items-center", "data-[icon=true]:gap-2", "data-[superseded=true]:line-through", "data-[press-label=true]:underline-offset-4", "data-[press-label=true]:group-hover:underline")
/** Loading recipes preserving each text measure. */
export const textRestingClassNames = {
    xs: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("inline-block", "w-10", "select-none", "rounded", "text-xs", "leading-4", "text-muted", "text-transparent") }),
    sm: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("inline-block", "w-12", "select-none", "rounded", "text-sm", "leading-5", "text-transparent") }),
    md: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("inline-block", "w-40", "max-w-full", "select-none", "rounded", "text-base", "leading-6", "text-transparent") }),
} as const
