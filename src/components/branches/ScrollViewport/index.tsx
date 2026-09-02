import type { ReactNode } from "react"
import { VerticalScrollRegion } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { aiTranscriptScrollViewportClassName, authenticationFormScrollViewportClassName, learnNavigationGroupsScrollViewportClassName, pricingRailScrollViewportClassName } from "./classNames"

/** Approved bounded region whose content owns its internal scrolling. */
export type ScrollViewportBoundary = "form-surface" | "pricing-rail" | "ai-transcript" | "learn-navigation-groups" | "content-map-modules" | "content-reader-main" | "content-outline-rail"
/** Traditional children API for a bounded viewport. */
export type ScrollViewportProps = { readonly boundary: ScrollViewportBoundary; readonly children: ReactNode }

/** Keep the pricing rail inside its card; other approved regions pass through unchanged. */
export const ScrollViewport = (props: ScrollViewportProps) => {
    const { boundary, children } = props
    if (boundary === "form-surface") {
        return (
            <VerticalScrollRegion className={authenticationFormScrollViewportClassName} isScrollable>
                {children}
            </VerticalScrollRegion>
        )
    }
    if (boundary === "ai-transcript") return <VerticalScrollRegion className={aiTranscriptScrollViewportClassName} isScrollable>{children}</VerticalScrollRegion>
    if (boundary === "learn-navigation-groups") return <VerticalScrollRegion className={learnNavigationGroupsScrollViewportClassName} data-learn-navigation-scroll="true" isScrollable>{children}</VerticalScrollRegion>
    return boundary === "pricing-rail"
        ? <SurfaceCard composition="joined"><VerticalScrollRegion className={pricingRailScrollViewportClassName} isScrollable>{children}</VerticalScrollRegion></SurfaceCard>
        : children
}
