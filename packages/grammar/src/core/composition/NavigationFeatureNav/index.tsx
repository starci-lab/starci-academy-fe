import { cn } from "@heroui/react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { PageContainer, type PageContainerProps } from "../../primitive/PageContainer/index.js"
import {
    navigationFeatureNavActionsClassName,
    navigationFeatureNavClassName,
    navigationFeatureNavCompactNavigationClassName,
    navigationFeatureNavFeatureClassName,
    navigationFeatureNavIdentityClassName,
    navigationFeatureNavNavigationClassName,
    navigationFeatureNavPrimaryClassName,
    navigationFeatureNavStickyClassName,
} from "./classNames.js"

export type NavigationFeatureNavProps = Omit<ComponentPropsWithoutRef<"header">, "children"> & {
    readonly identity: ReactNode
    readonly navigation: ReactNode
    readonly navigationLabel: string
    /** Compact trigger for an application-owned drawer containing the same primary destinations. */
    readonly compactNavigationTrigger: ReactNode
    readonly compactNavigationTriggerLabel: string
    readonly actions?: ReactNode
    readonly actionsLabel?: string
    /** Optional second and final layer. A third navigation scope must use the separate Subnav branch. */
    readonly featureNavigation?: ReactNode
    readonly featureNavigationLabel?: string
    readonly measure?: PageContainerProps["measure"]
    readonly position?: "static" | "sticky"
}

/**
 * Global navigation with at most one feature layer.
 *
 * The composition owns the single outer separator: the primary and feature
 * layers are intentionally continuous. Deeper responsive navigation belongs
 * to the independent Subnav branch instead of becoming a third navbar layer.
 */
export const NavigationFeatureNav = ({
    identity,
    navigation,
    navigationLabel,
    compactNavigationTrigger,
    compactNavigationTriggerLabel,
    actions,
    actionsLabel,
    featureNavigation,
    featureNavigationLabel,
    measure = "full",
    position = "sticky",
    className,
    ...headerProps
}: NavigationFeatureNavProps) => (
    <header
        {...headerProps}
        className={cn(navigationFeatureNavClassName, position === "sticky" && navigationFeatureNavStickyClassName, className)}
        data-grammar-navigation-feature-nav="true"
        data-grammar-navigation-feature-nav-layers={featureNavigation === undefined ? "one" : "two"}
        data-grammar-navigation-feature-nav-position={position}
    >
        <PageContainer className={navigationFeatureNavPrimaryClassName} data-grammar-navigation-feature-nav-primary="true" measure={measure}>
            <div className={navigationFeatureNavIdentityClassName} data-grammar-navigation-feature-nav-identity="true">{identity}</div>
            <nav aria-label={navigationLabel} className={navigationFeatureNavNavigationClassName} data-grammar-navigation-feature-nav-navigation="true">{navigation}</nav>
            <div
                aria-label={compactNavigationTriggerLabel}
                className={navigationFeatureNavCompactNavigationClassName}
                data-grammar-navigation-feature-nav-compact-navigation="true"
                role="group"
            >
                {compactNavigationTrigger}
            </div>
            {actions === undefined ? null : (
                <div
                    aria-label={actionsLabel}
                    className={navigationFeatureNavActionsClassName}
                    data-grammar-navigation-feature-nav-actions="true"
                    role={actionsLabel === undefined ? undefined : "group"}
                >
                    {actions}
                </div>
            )}
        </PageContainer>
        {featureNavigation === undefined ? null : (
            <div
                aria-label={featureNavigationLabel}
                className={navigationFeatureNavFeatureClassName}
                data-grammar-navigation-feature-nav-feature="true"
                role={featureNavigationLabel === undefined ? undefined : "region"}
            >
                {featureNavigation}
            </div>
        )}
    </header>
)
