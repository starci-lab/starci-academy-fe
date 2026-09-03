import { forwardRef, type ComponentProps, type ReactNode } from "react"
import { ScrollShadow, cn } from "@heroui/react"

export type HorizontalScrollRegionProps = Omit<ComponentProps<"div">, "children"> & {
    readonly children: ReactNode
    /** Uses the ScrollShadow-owned no-chrome treatment while retaining horizontal reachability. */
    readonly hideScrollBar?: boolean
}

/** Preserve intrinsic inline content and expose HeroUI's horizontal overflow affordance. */
export const HorizontalScrollRegion = forwardRef<HTMLDivElement, HorizontalScrollRegionProps>((props, ref) => {
    const { hideScrollBar = true, className, ...regionProps } = props
    return (
        <ScrollShadow
            {...regionProps}
            ref={ref}
            className={cn("starci-core-horizontal-scroll-region", className)}
            data-contract="PADDING-1 MEASURE-3 OVERFLOW-3 OVERFLOW-5"
            hideScrollBar={hideScrollBar}
            orientation="horizontal"
        />
    )
})

HorizontalScrollRegion.displayName = "HorizontalScrollRegion"
