import type { ReactNode } from "react"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { pricingRailScrollViewportClassName } from "./classNames"

/** Approved bounded region whose content owns its internal scrolling. */
export type ScrollViewportBoundary = "pricing-rail" | "learn-navigation-groups" | "content-map-modules" | "content-reader-main" | "content-outline-rail"
/** Traditional children API for a bounded viewport. */
export type ScrollViewportProps = { readonly boundary: ScrollViewportBoundary; readonly children: ReactNode }

/** Keep the pricing rail inside its card; other approved regions pass through unchanged. */
export const ScrollViewport = (props: ScrollViewportProps) => {
    const { boundary, children } = props
    return boundary === "pricing-rail"
        ? <SurfaceCard><div className={pricingRailScrollViewportClassName}>{children}</div></SurfaceCard>
        : children
}
