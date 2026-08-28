import type { ReactNode } from "react"
import { ScrollShadow } from "@heroui/react"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { authenticationFormScrollViewportClassName, pricingRailScrollViewportClassName } from "./classNames"

/** Approved bounded region whose content owns its internal scrolling. */
export type ScrollViewportBoundary = "form-surface" | "pricing-rail" | "learn-navigation-groups" | "content-map-modules" | "content-reader-main" | "content-outline-rail"
/** Traditional children API for a bounded viewport. */
export type ScrollViewportProps = { readonly boundary: ScrollViewportBoundary; readonly children: ReactNode }

/** Keep the pricing rail inside its card; other approved regions pass through unchanged. */
export const ScrollViewport = (props: ScrollViewportProps) => {
    const { boundary, children } = props
    if (boundary === "form-surface") {
        return (
            <ScrollShadow
                className={authenticationFormScrollViewportClassName}
                orientation="vertical"
            >
                {children}
            </ScrollShadow>
        )
    }
    return boundary === "pricing-rail"
        ? <SurfaceCard><div className={pricingRailScrollViewportClassName}>{children}</div></SurfaceCard>
        : children
}
