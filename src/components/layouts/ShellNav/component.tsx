import type { ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { Link } from "@/components/leaves/Link"
import { NavLink } from "@/components/leaves/NavLink"
import { IconButton } from "@/components/leaves/IconButton"
import { Button } from "@/components/leaves/Button"
import { SearchBox } from "@/components/leaves/SearchBox"

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
    /** The dialog that hangs off the bar, mounted by whoever owns whether it is open. */
    readonly children?: ReactNode
}

/** Where the mark takes the reader. */
const HOME_HREF = "/dashboard"

/**
 * Draw the bar.
 *
 * @param input - {@link ShellNavProps}
 */
export const _ShellNav = (input: ShellNavProps) => (
    <Tree contract="brand-links-then-tools-bar">
        <Tree contract="inline-nav-links">
            <Link props={{ href: HOME_HREF, label: input.props.brand, icon: "brand", emphasis: "brand" }} />
            {input.props.routes.map((route) => (
                <NavLink
                    key={route.id}
                    props={{ href: route.href, label: route.label, isCurrent: route.isCurrent, kind: "route" }}
                />
            ))}
        </Tree>
        <Tree contract="inline-tool-row">
            <SearchBox
                props={{
                    placeholder: input.props.searchPlaceholder,
                    label: input.props.searchLabel,
                    shortcut: input.props.searchShortcut,
                }}
            />
            <IconButton
                props={{ icon: "cart", label: input.props.cartLabel }}
            />
            <IconButton
                props={{ icon: "account", label: input.props.accountLabel }}
            />
            <IconButton
                props={{ icon: "locale", label: input.props.localeLabel }}
                on={{ press: input.on?.toggleLocale }}
            />
            <IconButton
                props={{
                    icon: input.props.isDark ? "light" : "dark",
                    label: input.props.themeLabel,
                    isActive: input.props.isDark,
                }}
                on={{ press: input.on?.toggleTheme }}
            />
            <Button
                props={{ label: input.props.signInLabel, variant: "primary", size: "sm", icon: "signIn" }}
                on={{ press: input.on?.openSignIn }}
            />
        </Tree>
        {input.children}
    </Tree>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "shell" } as const
