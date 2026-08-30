import { forwardRef, type ComponentProps, type ReactNode } from "react"
import { ScrollShadow } from "@heroui/react"

export type HorizontalScrollRegionProps = Omit<ComponentProps<"div">, "children"> & {
    readonly children: ReactNode
    /** Uses the ScrollShadow-owned no-chrome treatment while retaining horizontal reachability. */
    readonly hideScrollBar?: boolean
}

/** Preserve intrinsic inline content and expose HeroUI's horizontal overflow affordance. */
export const HorizontalScrollRegion = forwardRef<HTMLDivElement, HorizontalScrollRegionProps>((props, ref) => (
    <ScrollShadow {...props} ref={ref} orientation="horizontal" />
))

HorizontalScrollRegion.displayName = "HorizontalScrollRegion"
