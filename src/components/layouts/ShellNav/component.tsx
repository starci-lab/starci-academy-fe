import { Link } from "@/components/leaves/Link"
import { NavLink } from "@/components/leaves/NavLink"
import { IconButton } from "@/components/leaves/IconButton"
import { AccountMenu } from "@/components/blocks/auth/AccountMenu"
import { LanguageMenu } from "@/components/blocks/locale/LanguageMenu"
import { PressableInputLike } from "@/components/leaves/PressableInputLike"
import { ThemeSwitch } from "@/components/leaves/ThemeSwitch"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
import { Button } from "@/components/leaves/Button"
import { NavigationFeatureNav } from "@starci/grammar/core"
import type { IconName } from "@/components/leaves/Icon"
import {
    shellNavActionsClassName,
    shellNavDesktopToolsClassName,
    shellNavDrawerContentClassName,
    shellNavDrawerRoutesClassName,
    shellNavDrawerUtilitiesClassName,
    shellNavRoutesClassName,
    shellNavTabsClassName,
} from "./classNames"

/** One destination in the primary navbar row. */
export type ShellNavRoute = {
    readonly id: string
    readonly label: string
    readonly icon: IconName
    readonly isCurrent?: boolean
}

/** One destination in the page-owned bottom navbar layer. */
export type ShellNavTab = ShellNavRoute & {
    readonly icon: IconName
}

/** Resolved copy and state drawn by the navbar. */
export type ShellNavData = {
    readonly brand: string
    readonly routes: ReadonlyArray<ShellNavRoute>
    readonly tabs?: ReadonlyArray<ShellNavTab>
    readonly themeLabel: string
    readonly utilitiesLabel: string
    readonly actionsLabel: string
    readonly localeActionLabel: string
    readonly isDark: boolean
    readonly searchPlaceholder: string
    readonly searchLabel: string
    readonly searchShortcut: string
    readonly cartLabel: string
    readonly notificationLabel: string
    readonly isSignedIn: boolean
}

/** Events reported by navbar controls. */
export type ShellNavActions = {
    readonly openSignIn?: () => void
    readonly openSignUp?: () => void
    readonly navigate?: (id: string) => void
    readonly selectTab?: (key: string) => void
    readonly openSearch?: () => void
    readonly toggleTheme?: () => void
    readonly toggleLocale?: () => void
    /** Opens the compact application-navigation drawer. */
    readonly openNavigation?: () => void
    /** Opens the basket panel. The navbar owns the control; the shell owns the panel. */
    readonly openCart?: () => void
}

/** Props for the presentational navbar. */
export type ShellNavProps = {
    readonly props: ShellNavData
    readonly on?: ShellNavActions
}

/** Same resolved navigation contract projected into the compact drawer surface. */
export type ShellNavigationDrawerProps = ShellNavProps

/** Draw the primary navbar and its optional page-tab bottom layer as one landmark. */
export const ShellNavBase = (props: ShellNavProps) => {
    const tabs = props.props.tabs
    return (
        <NavigationFeatureNav
            identity={<Link props={{ label: props.props.brand, emphasis: "brand" }} on={{ press: () => props.on?.navigate?.("dashboard") }} />}
            navigation={<div className={shellNavRoutesClassName}>
                {props.props.routes.map((route) => (
                    <NavLink
                        key={route.id}
                        props={{ label: route.label, isCurrent: tabs === undefined ? route.isCurrent : false, kind: "route" }}
                        on={{ press: () => props.on?.navigate?.(route.id) }}
                    />
                ))}
            </div>}
            navigationLabel={props.props.brand}
            compactNavigationTrigger={<IconButton
                props={{ icon: "navigationOverflow", label: props.props.utilitiesLabel }}
                on={{ press: props.on?.openNavigation }}
            />}
            compactNavigationTriggerLabel={props.props.utilitiesLabel}
            actions={<div className={shellNavActionsClassName}>
                <div className={shellNavDesktopToolsClassName}>
                    <PressableInputLike props={{ placeholder: props.props.searchPlaceholder, label: props.props.searchLabel, shortcut: props.props.searchShortcut }} on={{ press: props.on?.openSearch }} />
                    <LanguageMenu />
                    <ThemeSwitch props={{ isDark: props.props.isDark, label: props.props.themeLabel }} on={{ change: props.on?.toggleTheme }} />
                </div>
                <IconButton props={{ icon: "cart", label: props.props.cartLabel }} on={{ press: props.on?.openCart }} />
                {props.props.isSignedIn ? <IconButton props={{ icon: "notification", label: props.props.notificationLabel }} /> : null}
                <AccountMenu on={{ signIn: props.on?.openSignIn, signUp: props.on?.openSignUp }} />
            </div>}
            actionsLabel={props.props.actionsLabel}
            featureNavigation={tabs === undefined ? undefined : <div className={shellNavTabsClassName}>
                <ExtendedTabs props={{ label: props.props.brand, selectedKey: tabs.find((tab) => tab.isCurrent)?.id ?? "overview", tabs, inset: "none", labelVisibility: "responsive" }} on={{ select: props.on?.selectTab }} />
            </div>}
            featureNavigationLabel={tabs === undefined ? undefined : props.props.brand}
        />
    )
}

/**
 * Compact application navigation rendered inside the shared DrawerBranch.
 *
 * The header owns only the disclosure trigger. This body keeps production's
 * vertical navigation rhythm and avoids turning route names into a cramped popover.
 */
export const ShellNavigationDrawerBase = (props: ShellNavigationDrawerProps) => (
    <div className={shellNavDrawerContentClassName}>
        <nav aria-label={props.props.brand} className={shellNavDrawerRoutesClassName}>
            {props.props.routes.map((route) => (
                <NavLink
                    key={route.id}
                    props={{ label: route.label, icon: route.icon, isCurrent: route.isCurrent, kind: "route" }}
                    on={{ press: () => props.on?.navigate?.(route.id) }}
                />
            ))}
        </nav>
        <div aria-label={props.props.utilitiesLabel} className={shellNavDrawerUtilitiesClassName} role="group">
            <Button props={{ label: props.props.searchLabel, icon: "search", variant: "ghost" }} on={{ press: props.on?.openSearch }} />
            <Button props={{ label: props.props.localeActionLabel, icon: "locale", variant: "ghost" }} on={{ press: props.on?.toggleLocale }} />
            <Button props={{ label: props.props.themeLabel, icon: props.props.isDark ? "light" : "dark", variant: "ghost" }} on={{ press: props.on?.toggleTheme }} />
        </div>
    </div>
)
