import { Link } from "@/components/leaves/Link"
import { NavLink } from "@/components/leaves/NavLink"
import { IconButton } from "@/components/leaves/IconButton"
import { AccountMenu } from "@/components/blocks/auth/AccountMenu"
import { LanguageMenu } from "@/components/blocks/locale/LanguageMenu"
import { PressableInputLike } from "@/components/leaves/PressableInputLike"
import { ThemeSwitch } from "@/components/leaves/ThemeSwitch"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
import { Icon } from "@/components/leaves/Icon"
import { DropdownBranch } from "@/components/branches/DropdownBranch"
import type { IconName } from "@/components/leaves/Icon"
import {
    shellNavClassName,
    shellNavCompactToolsClassName,
    shellNavDesktopToolsClassName,
    shellNavNavigationClassName,
    shellNavPrimaryClassName,
    shellNavRoutesClassName,
    shellNavTabsClassName,
    shellNavToolsClassName,
} from "./classNames"

/** One destination in the primary navbar row. */
export type ShellNavRoute = {
    readonly id: string
    readonly label: string
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
    /** Opens the basket panel. The navbar owns the control; the shell owns the panel. */
    readonly openCart?: () => void
}

/** Props for the presentational navbar. */
export type ShellNavProps = {
    readonly props: ShellNavData
    readonly on?: ShellNavActions
}

/** Draw the primary navbar and its optional page-tab bottom layer as one landmark. */
export const ShellNavBase = (props: ShellNavProps) => {
    const tabs = props.props.tabs
    return (
        <nav className={shellNavClassName}>
            <div className={shellNavPrimaryClassName}>
                <div className={shellNavNavigationClassName}>
                    <Link props={{ label: props.props.brand, emphasis: "brand" }} on={{ press: () => props.on?.navigate?.("dashboard") }} />
                </div>
                <div className={shellNavRoutesClassName}>
                    {props.props.routes.map((route) => (
                        <NavLink key={route.id} props={{ label: route.label, isCurrent: route.isCurrent, kind: "route" }} on={{ press: () => props.on?.navigate?.(route.id) }} />
                    ))}
                </div>
                <div className={shellNavToolsClassName}>
                    <div className={shellNavDesktopToolsClassName}>
                        <PressableInputLike props={{ placeholder: props.props.searchPlaceholder, label: props.props.searchLabel, shortcut: props.props.searchShortcut }} on={{ press: props.on?.openSearch }} />
                        <LanguageMenu />
                        <ThemeSwitch props={{ isDark: props.props.isDark, label: props.props.themeLabel }} on={{ change: props.on?.toggleTheme }} />
                    </div>
                    <div className={shellNavCompactToolsClassName}>
                        <DropdownBranch
                            props={{
                                label: props.props.utilitiesLabel,
                                sections: [{
                                    items: [
                                        { id: "search", label: props.props.searchLabel, icon: "search" },
                                        { id: "locale", label: props.props.localeActionLabel, icon: "locale" },
                                        { id: "theme", label: props.props.themeLabel, icon: props.props.isDark ? "light" : "dark" },
                                    ],
                                }],
                            }}
                            on={{
                                action: (id) => {
                                    if (id === "search") props.on?.openSearch?.()
                                    else if (id === "locale") props.on?.toggleLocale?.()
                                    else props.on?.toggleTheme?.()
                                },
                            }}
                            trigger={<Icon props={{ name: "settings", role: "leading" }} />}
                        />
                    </div>
                    <IconButton props={{ icon: "cart", label: props.props.cartLabel }} on={{ press: props.on?.openCart }} />
                    {props.props.isSignedIn ? <IconButton props={{ icon: "notification", label: props.props.notificationLabel }} /> : null}
                    <AccountMenu on={{ signIn: props.on?.openSignIn, signUp: props.on?.openSignUp }} />
                </div>
            </div>
            {tabs === undefined ? null : <div className={shellNavTabsClassName}>
                <ExtendedTabs props={{ label: props.props.brand, selectedKey: tabs.find((tab) => tab.isCurrent)?.id ?? "overview", tabs }} on={{ select: props.on?.selectTab }} />
            </div>}
        </nav>
    )
}
