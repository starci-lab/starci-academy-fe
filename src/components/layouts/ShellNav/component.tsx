import { Tree } from "@/components/branches/Tree"
import { Link } from "@/components/leaves/Link"
import { NavLink } from "@/components/leaves/NavLink"
import { IconButton } from "@/components/leaves/IconButton"
import { Button } from "@/components/leaves/Button"
import { SearchBox } from "@/components/leaves/SearchBox"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/**
 * LAYOUT - `ShellNav`, presentational half.
 *
 * The bar the whole app sits under: the mark that says where you are, the routes, and the tools
 * that change how the app looks rather than what it shows.
 *
 * THE TWO SIDES ARE DIFFERENT KINDS OF THING, which is why they are two groups and not one row.
 * Left is WHERE - a mark and a set of destinations. Right is HOW - theme, language, and the one
 * control about who you are. A reader looking for a page never scans the right, and a reader
 * looking for a setting never scans the left.
 *
 * IT TAKES THE DIALOG AS `children`. The bar owns the control that opens one; it does not own
 * whether one is open, because a bar that decided that would be deciding for every route under it.
 */

/** One destination in the bar. */
export type ShellNavRoute = {
    /** Identity of the row, used as the key. */
    readonly id: string
    /** Where it goes. */
    readonly href: string
    /** The already-resolved words. */
    readonly label: string
    /** Whether this is where the reader already is. */
    readonly isCurrent?: boolean
}

/** What the bar draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ShellNavData = {
    /** The product's own name, already resolved. */
    readonly brand: string
    /** The routes, in reading order. */
    readonly routes: ReadonlyArray<ShellNavRoute>
    /** The already-resolved label of the one control that opens the dialog. */
    readonly signInLabel: string
    /** What the theme control is called, in the state it is currently in. */
    readonly themeLabel: string
    /** Whether the dark theme is showing, so the glyph says what pressing it will do. */
    readonly isDark: boolean
    /** What the language control is called. */
    readonly localeLabel: string
    /** What the search field prompts with, and what it is called. */
    readonly searchPlaceholder: string
    readonly searchLabel: string
    /** The keyboard shortcut, written the way a reader would press it. */
    readonly searchShortcut: string
    /** What the basket and the account controls are called. */
    readonly cartLabel: string
    readonly accountLabel: string
    /** Signed-in readers already have an account control and do not need a second entry point. */
    readonly isSignedIn: boolean
}

/** What the bar reports. */
export type ShellNavActions = {
    /** Called when the reader asks to sign in. */
    readonly openSignIn?: () => void
    /** Called when the reader flips the theme. */
    readonly toggleTheme?: () => void
    /** Called when the reader flips the language. */
    readonly toggleLocale?: () => void
}

/** Props for {@link _ShellNav}. */
export type ShellNavProps = {
    /** What it draws. */
    readonly props: ShellNavData
    /** What it reports. */
    readonly on?: ShellNavActions
}

/** Where the mark takes the reader. */
const HOME_HREF = "/dashboard"

/**
 * Draw the bar.
 *
 * @param input - {@link ShellNavProps}
 */
export const _ShellNav = (input: ShellNavProps) => (
    <Tree
        contract="brand-links-then-tools-bar"
        render={defineContractComponent("brand-links-then-tools-bar", {
            navigation: defineContractComponent("inline-nav-links", {
                brand: defineLeafComponent("link", { emphasis: "brand" }, () => (
                    <Link props={{ href: HOME_HREF, label: input.props.brand, icon: "brand", emphasis: "brand" }} />
                )),
                route: input.props.routes.map((route) => defineLeafComponent("nav-link", { kind: "route" }, () => (
                    <NavLink
                        props={{ href: route.href, label: route.label, isCurrent: route.isCurrent, kind: "route" }}
                    />
                ))),
            }),
            tools: defineContractComponent("inline-tool-row", {
                search: defineLeafComponent("search-box", {}, () => (
                    <SearchBox
                        props={{
                            placeholder: input.props.searchPlaceholder,
                            label: input.props.searchLabel,
                            shortcut: input.props.searchShortcut,
                        }}
                    />
                )),
                tool: [
                    defineLeafComponent("icon-button", {}, () => (
                        <IconButton
                            props={{ icon: "locale", label: input.props.localeLabel }}
                            on={{ press: input.on?.toggleLocale }}
                        />
                    )),
                    defineLeafComponent("icon-button", {}, () => (
                        <IconButton
                            props={{
                                icon: input.props.isDark ? "light" : "dark",
                                label: input.props.themeLabel,
                                isActive: input.props.isDark,
                            }}
                            on={{ press: input.on?.toggleTheme }}
                        />
                    )),
                    defineLeafComponent("icon-button", {}, () => (
                        <IconButton props={{ icon: "cart", label: input.props.cartLabel }} />
                    )),
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
        })}
    />
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "shell" } as const
