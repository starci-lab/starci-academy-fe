import { Tree } from "@/components/branches/Tree"
import { Link } from "@/components/leaves/Link"
import { NavLink } from "@/components/leaves/NavLink"
import { IconButton } from "@/components/leaves/IconButton"
import { Button } from "@/components/leaves/Button"
import { PressableInputLike } from "@/components/leaves/PressableInputLike"
import { ThemeSwitch } from "@/components/leaves/ThemeSwitch"
import type { IconName } from "@/components/leaves/Icon"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/** One destination in the primary navbar row. */
export type ShellNavRoute = {
    readonly id: string
    readonly href: string
    readonly label: string
    readonly isCurrent?: boolean
}

/** One destination in the page-owned bottom navbar layer. */
export type ShellNavTab = ShellNavRoute & {
    readonly icon: IconName
}

/** Resolved copy and state drawn by the double navbar. */
export type ShellNavData = {
    readonly brand: string
    readonly routes: ReadonlyArray<ShellNavRoute>
    readonly tabs?: ReadonlyArray<ShellNavTab>
    readonly signInLabel: string
    readonly themeLabel: string
    readonly isDark: boolean
    readonly localeLabel: string
    readonly searchPlaceholder: string
    readonly searchLabel: string
    readonly searchShortcut: string
    readonly cartLabel: string
    readonly notificationLabel: string
    readonly accountLabel: string
    readonly isSignedIn: boolean
}

/** Events reported by navbar controls. */
export type ShellNavActions = {
    readonly openSignIn?: () => void
    readonly openSearch?: () => void
    readonly toggleTheme?: () => void
    readonly toggleLocale?: () => void
}

/** Props for the presentational double navbar. */
export type ShellNavProps = {
    readonly props: ShellNavData
    readonly on?: ShellNavActions
}

const HOME_HREF = "/dashboard"

/** Draw the primary navbar and its optional page-tab bottom layer as one landmark. */
export const _ShellNav = (input: ShellNavProps) => (
    <Tree
        contract="double-navbar"
        render={defineContractComponent("double-navbar", {
            primary: defineContractComponent("brand-links-then-tools-bar", {
                navigation: defineContractComponent("inline-nav-links", {
                    brand: defineLeafComponent("link", { emphasis: "brand" }, () => (
                        <Link props={{ href: HOME_HREF, label: input.props.brand, emphasis: "brand" }} />
                    )),
                    route: input.props.routes.map((route) => defineLeafComponent("nav-link", { kind: "route" }, () => (
                        <NavLink props={{ href: route.href, label: route.label, isCurrent: route.isCurrent, kind: "route" }} />
                    ))),
                }),
                tools: defineContractComponent("inline-tool-row", {
                    search: defineLeafComponent("pressable-input-like", {}, () => (
                        <PressableInputLike
                            props={{ placeholder: input.props.searchPlaceholder, label: input.props.searchLabel, shortcut: input.props.searchShortcut }}
                            on={{ press: input.on?.openSearch }}
                        />
                    )),
                    locale: defineLeafComponent("icon-button", {}, () => (
                        <IconButton props={{ icon: "locale", label: input.props.localeLabel }} on={{ press: input.on?.toggleLocale }} />
                    )),
                    theme: defineLeafComponent("theme-switch", {}, () => (
                        <ThemeSwitch
                            props={{ isDark: input.props.isDark, label: input.props.themeLabel }}
                            on={{ change: input.on?.toggleTheme }}
                        />
                    )),
                    tool: [
                        defineLeafComponent("icon-button", {}, () => (
                            <IconButton props={{ icon: "cart", label: input.props.cartLabel }} />
                        )),
                        ...(input.props.isSignedIn ? [defineLeafComponent("icon-button", {}, () => (
                            <IconButton props={{ icon: "notification", label: input.props.notificationLabel }} />
                        ))] : []),
                        defineLeafComponent("icon-button", {}, () => (
                            <IconButton props={{ icon: "account", label: input.props.accountLabel }} />
                        )),
                    ],
                    signIn: input.props.isSignedIn ? undefined : defineLeafComponent("button", { size: "sm", variant: "primary" }, () => (
                        <Button
                            props={{ label: input.props.signInLabel, variant: "primary", size: "sm", icon: "signIn" }}
                            on={{ press: input.on?.openSignIn }}
                        />
                    )),
                }),
            }),
            bottom: input.props.tabs === undefined ? undefined : defineContractComponent("underlined-tab-strip", {
                tab: input.props.tabs.map((tab) => defineLeafComponent("nav-link", { kind: "tab" }, () => (
                    <NavLink
                        props={{ href: tab.href, label: tab.label, icon: tab.icon, isCurrent: tab.isCurrent, kind: "tab" }}
                    />
                ))),
            }),
        })}
    />
)

/** Source-level tier marker for the pure shell layout. */
export const meta = { world: "pure", domain: "shell" } as const
