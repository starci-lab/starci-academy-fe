import { cn } from "@heroui/react"
import type { ReactNode } from "react"
import { Rail } from "../../branch/Rail/index.js"
import {
    dashboardShellClassName,
    dashboardShellFloatingLayerClassName,
    dashboardShellHeaderClassName,
    dashboardShellLayoutClassName,
    dashboardShellLeadingRuleClassName,
    dashboardShellNavigationClassName,
    dashboardShellPrimaryClassName,
    dashboardShellRailClassName,
} from "./classNames.js"

type SlotContent = Exclude<ReactNode, null | undefined | boolean>

type ShellOwnedMain = (
    | {
        readonly primaryLabel: string
        readonly primaryLabelledBy?: never
    }
    | {
        readonly primaryLabel?: never
        readonly primaryLabelledBy: string
    }
) & {
    /** The shell renders the page's single main landmark around `primary`. */
    readonly mainLandmark?: "shell"
}

type CallerOwnedMain = {
    /** `primary` contains the page's single main landmark; the shell adds no second one. */
    readonly mainLandmark: "caller"
    readonly primaryLabel?: never
    readonly primaryLabelledBy?: never
}

type WithNavigation = {
    readonly navigation: SlotContent
    /** Accessible name for the shell-owned navigation landmark. */
    readonly navigationLabel: string
}

type WithoutNavigation = {
    readonly navigation?: undefined
    readonly navigationLabel?: never
}

type WithRail = {
    readonly rail: SlotContent
    /** Accessible name for the complementary rail. */
    readonly railLabel: string
    readonly railMode?: "flow" | "sticky"
    readonly railWidth?: "compact" | "standard" | "wide"
    readonly railInset?: "none" | "content"
    /** Place the supporting rail before or after the dominant region. */
    readonly railPosition?: "leading" | "trailing"
    /** Keep the landmark name available to assistive technology without drawing another heading. */
    readonly isRailLabelHidden?: boolean
}

type WithoutRail = {
    readonly rail?: undefined
    readonly railLabel?: never
    readonly railMode?: never
    readonly railWidth?: never
    readonly railInset?: never
    readonly railPosition?: never
    readonly isRailLabelHidden?: never
}

export type DashboardShellProps = (ShellOwnedMain | CallerOwnedMain) &
    (WithNavigation | WithoutNavigation) &
    (WithRail | WithoutRail) & {
        /** Optional dashboard-wide context. Product headings and actions remain caller-owned. */
        readonly header?: ReactNode
        /** The dominant dashboard content. Business blocks remain caller-owned. */
        readonly primary: ReactNode
        /** Stable target for skip links, tab relationships, and programmatic focus. */
        readonly primaryId?: string
        /** Optional viewport-edge control, assistant, or other caller-owned floating interaction. */
        readonly floatingLayer?: ReactNode
        readonly align?: "start" | "stretch"
        readonly className?: string
    }

/**
 * Generic dashboard anatomy with an optional leading navigation, one dominant
 * region, one subordinate rail, and one non-document floating projection.
 *
 * The shell owns only composition and landmarks. Metrics, quests, course cards,
 * leaderboards, and every other business object belong to its slot consumers.
 */
export const DashboardShell = (props: DashboardShellProps) => {
    const hasHeader = props.header !== undefined && props.header !== null && typeof props.header !== "boolean"
    const hasNavigation = props.navigation !== undefined
    const hasRail = props.rail !== undefined
    const railPosition = hasRail ? props.railPosition ?? "trailing" : undefined
    const hasFloatingLayer = props.floatingLayer !== undefined && props.floatingLayer !== null && typeof props.floatingLayer !== "boolean"
    const mainLandmark = props.mainLandmark ?? "shell"

    const primary = mainLandmark === "caller" ? (
        <div
            className={dashboardShellPrimaryClassName}
            data-grammar-dashboard-primary="true"
            data-grammar-main-landmark="caller"
            id={props.primaryId}
            tabIndex={-1}
        >
            {props.primary}
        </div>
    ) : (
        <main
            aria-label={props.primaryLabel}
            aria-labelledby={props.primaryLabelledBy}
            className={dashboardShellPrimaryClassName}
            data-grammar-dashboard-primary="true"
            data-grammar-main-landmark="shell"
            id={props.primaryId}
            tabIndex={-1}
        >
            {props.primary}
        </main>
    )

    const rail = hasRail ? (
        <div className={dashboardShellRailClassName} data-grammar-dashboard-rail-region="true">
            <Rail
                inset={props.railInset ?? "none"}
                isLabelHidden={props.isRailLabelHidden ?? true}
                label={props.railLabel}
                mode={props.railMode ?? "flow"}
                width={props.railWidth ?? "standard"}
            >
                {props.rail}
            </Rail>
        </div>
    ) : null

    const leadingRule = railPosition === "leading" ? (
        <div
            aria-hidden="true"
            className={dashboardShellLeadingRuleClassName}
            data-grammar-dashboard-leading-rule="true"
        />
    ) : null

    return (
        <div
            className={cn(dashboardShellClassName, props.className)}
            data-grammar-dashboard-floating={hasFloatingLayer ? "present" : "absent"}
            data-grammar-dashboard-shell="true"
        >
            {hasHeader ? (
                <header className={dashboardShellHeaderClassName} data-grammar-dashboard-header="true">
                    {props.header}
                </header>
            ) : null}
            <div
                className={dashboardShellLayoutClassName}
                data-grammar-dashboard-align={props.align ?? "start"}
                data-grammar-dashboard-navigation={hasNavigation ? "present" : "absent"}
                data-grammar-dashboard-rail={hasRail ? "present" : "absent"}
                data-grammar-dashboard-rail-position={railPosition}
                data-grammar-dashboard-rail-width={hasRail ? props.railWidth ?? "standard" : undefined}
            >
                {hasNavigation ? (
                    <nav
                        aria-label={props.navigationLabel}
                        className={dashboardShellNavigationClassName}
                        data-grammar-dashboard-navigation-region="true"
                    >
                        {props.navigation}
                    </nav>
                ) : null}
                {railPosition === "leading" ? rail : null}
                {leadingRule}
                {primary}
                {railPosition === "trailing" ? rail : null}
            </div>
            {hasFloatingLayer ? (
                <div
                    className={dashboardShellFloatingLayerClassName}
                    data-grammar-dashboard-floating-layer="true"
                >
                    {props.floatingLayer}
                </div>
            ) : null}
        </div>
    )
}
