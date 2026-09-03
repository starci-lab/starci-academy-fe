import type { ComponentProps, ReactNode } from "react"
import { ScrollShadow } from "@heroui/react"

export type VerticalScrollRegionProps = Omit<ComponentProps<"div">, "children"> & {
    readonly children: ReactNode
    readonly isScrollable: boolean
    /** Hide scrollbar chrome by default while retaining wheel, touch and keyboard scrolling. */
    readonly hideScrollBar?: boolean
}

/** Use HeroUI's Vertical ScrollShadow without making consumers own its DOM contract. */
export const VerticalScrollRegion = (props: VerticalScrollRegionProps) => {
    const { children, isScrollable, hideScrollBar = true, ...regionProps } = props
    return isScrollable
        ? <ScrollShadow {...regionProps} data-contract="MEASURE-7 OVERFLOW-3" hideScrollBar={hideScrollBar} orientation="vertical">{children}</ScrollShadow>
        : <div {...regionProps}>{children}</div>
}
