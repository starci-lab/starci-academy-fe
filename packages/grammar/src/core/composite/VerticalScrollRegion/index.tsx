import type { ComponentProps, ReactNode } from "react"
import { ScrollShadow } from "@heroui/react"

export type VerticalScrollRegionProps = Omit<ComponentProps<"div">, "children"> & {
    readonly children: ReactNode
    readonly isScrollable: boolean
}

/** Use HeroUI's Vertical ScrollShadow without making consumers own its DOM contract. */
export const VerticalScrollRegion = (props: VerticalScrollRegionProps) => {
    const { children, isScrollable, ...regionProps } = props
    return isScrollable
        ? <ScrollShadow {...regionProps} orientation="vertical">{children}</ScrollShadow>
        : <div {...regionProps}>{children}</div>
}
