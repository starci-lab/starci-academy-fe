import { cn } from "@heroui/react"

/** Container-query and floating-layer boundary for one dashboard composition. */
export const dashboardShellClassName = cn("starci-core-dashboard-shell")

/** Optional dashboard-wide context rendered before the working grid. */
export const dashboardShellHeaderClassName = cn("starci-core-dashboard-shell-header")

/** Responsive grid that owns navigation, primary, and supporting-rail placement. */
export const dashboardShellLayoutClassName = cn("starci-core-dashboard-shell-layout")

/** Optional leading navigation region. */
export const dashboardShellNavigationClassName = cn("starci-core-dashboard-shell-navigation")

/** Dominant dashboard region. */
export const dashboardShellPrimaryClassName = cn("starci-core-dashboard-shell-primary")

/** Optional supporting rail grid region; the nested Rail owns its landmark and sticky lifecycle. */
export const dashboardShellRailClassName = cn("starci-core-dashboard-shell-rail")

/** Optional full-height seam between a leading rail and the dominant region. */
export const dashboardShellLeadingRuleClassName = cn("starci-core-dashboard-shell-leading-rule")

/** Viewport-edge projection that does not participate in document or grid sizing. */
export const dashboardShellFloatingLayerClassName = cn("starci-core-dashboard-shell-floating-layer")
