import { Tree } from "@/components/branches/Tree"
import { Link } from "@/components/leaves/Link"
import { NavLink } from "@/components/leaves/NavLink"
import { IconButton } from "@/components/leaves/IconButton"
import { PressableInputLike } from "@/components/leaves/PressableInputLike"
import { ThemeSwitch } from "@/components/leaves/ThemeSwitch"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
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
    readonly selectTab?: (key: string) => void
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
                    routes: defineContractComponent("inline-route-links", {
                        route: input.props.routes.map((route) => defineLeafComponent("nav-link", { kind: "route" }, () => (
                            <NavLink props={{ href: route.href, label: route.label, isCurrent: route.isCurrent, kind: "route" }} />
                        ))),
                    }),
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
                            <IconButton
                                props={{ icon: "account", label: input.props.accountLabel }}
                                on={{ press: input.props.isSignedIn ? undefined : input.on?.openSignIn }}
                            />
                        )),
                    ],
                }),
            }),
            bottom: input.props.tabs === undefined ? undefined : defineContractComponent("underlined-tab-strip", {
                tabs: defineLeafComponent("extended-tabs", {}, () => (
                    <ExtendedTabs
                        props={{
                            label: input.props.brand,
                            selectedKey: input.props.tabs?.find((tab) => tab.isCurrent)?.id ?? "overview",
                            tabs: input.props.tabs ?? [],
                        }}
                        on={{ select: input.on?.selectTab }}
                    />
                )),
            }),
        })}
    />
)

/** Source-level tier marker for the pure shell layout. */
export const meta = { world: "pure", domain: "shell" } as const
