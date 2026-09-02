import Image from "next/image"
import { iconSourceFor } from "@/components/leaves/Icon"
import { IconButton } from "@starci/grammar/common"
import { AccountMenu } from "@/components/blocks/auth/AccountMenu"
import { LanguageMenu } from "@/components/blocks/locale/LanguageMenu"
import { PressableInputLike } from "@/components/leaves/PressableInputLike"
import { ThemeSwitch } from "@/components/leaves/ThemeSwitch"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
import { NavigationFeatureNav, Button } from "@starci/grammar/common"
import type { IconName } from "@/components/leaves/Icon"
import {
    shellNavActionsClassName,
    shellNavBrandMarkClassName,
    shellNavBrandNameClassName,
    shellNavBrandSuffixClassName,
    shellNavBrandTextClassName,
    shellNavDesktopToolsClassName,
    shellNavDrawerContentClassName,
    shellNavDrawerRoutesClassName,
    shellNavDrawerUtilitiesClassName,
    shellNavRoutesClassName,
    shellNavTabsClassName,
} from "./classNames"
import { Icon, TextAction } from "@starci/grammar/common"


/** One destination in the primary navbar row. */
export type ShellNavRoute = {
    readonly id: string
    readonly label: string
    readonly icon: IconName
    readonly isCurrent?: boolean
}

/** One destination in the page-owned feature layer below the primary navbar. */
export type ShellNavFeatureTab = ShellNavRoute & {
    readonly icon: IconName
}

/** Resolved copy and state drawn by the navbar. */
export type ShellNavData = {
    readonly brand: string
    readonly routes: ReadonlyArray<ShellNavRoute>
    readonly featureTabs?: ReadonlyArray<ShellNavFeatureTab>
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
    readonly selectFeatureTab?: (key: string) => void
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

/** Product identity remains shell-owned while Grammar owns its action semantics. */
const BrandLockup = () => <>
    <Image src="/brand/starci-logo.png" alt="" width={40} height={40} className={shellNavBrandMarkClassName} priority />
    <span className={shellNavBrandTextClassName}>
        <span className={shellNavBrandNameClassName}>StarCi</span>
        <span className={shellNavBrandSuffixClassName}>Academy</span>
    </span>
</>

/** Draw the primary navbar and its optional page-tab bottom layer as one landmark. */
export const ShellNavBase = (props: ShellNavProps) => {
    const featureTabs = props.props.featureTabs
    return (
        <NavigationFeatureNav
            identity={<TextAction appearance="plain" onPress={() => props.on?.navigate?.("dashboard")}><BrandLockup /></TextAction>}
            navigation={<div className={shellNavRoutesClassName}>
                {props.props.routes.map((route) => (
                    <TextAction key={route.id} appearance={"route"} isCurrent={featureTabs === undefined ? route.isCurrent : false} onPress={() => props.on?.navigate?.(route.id)}>{route.label}</TextAction>
                ))}
            </div>}
            navigationLabel={props.props.brand}
            compactNavigationTrigger={<IconButton source={iconSourceFor("navigationOverflow", "leading")} label={props.props.utilitiesLabel} onPress={({ press: props.on?.openNavigation })?.press} />}
            compactNavigationTriggerLabel={props.props.utilitiesLabel}
            actions={<div className={shellNavActionsClassName}>
                <div className={shellNavDesktopToolsClassName}>
                    <PressableInputLike props={{ placeholder: props.props.searchPlaceholder, label: props.props.searchLabel, shortcut: props.props.searchShortcut }} on={{ press: props.on?.openSearch }} />
                    <LanguageMenu />
                    <ThemeSwitch props={{ isDark: props.props.isDark, label: props.props.themeLabel }} on={{ change: props.on?.toggleTheme }} />
                </div>
                <IconButton source={iconSourceFor("cart", "leading")} label={props.props.cartLabel} onPress={({ press: props.on?.openCart })?.press} />
                {props.props.isSignedIn ? <IconButton source={iconSourceFor("notification", "leading")} label={props.props.notificationLabel} /> : null}
                <AccountMenu on={{ signIn: props.on?.openSignIn, signUp: props.on?.openSignUp }} />
            </div>}
            actionsLabel={props.props.actionsLabel}
            featureNavigation={featureTabs === undefined ? undefined : <div className={shellNavTabsClassName}>
                <ExtendedTabs props={{ label: props.props.brand, selectedKey: featureTabs.find((tab) => tab.isCurrent)?.id ?? featureTabs[0]?.id ?? "overview", tabs: featureTabs, inset: "none", labelVisibility: "responsive" }} on={{ select: props.on?.selectFeatureTab }} />
            </div>}
            featureNavigationLabel={featureTabs === undefined ? undefined : props.props.brand}
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
                <TextAction key={route.id} appearance={"route"} isCurrent={route.isCurrent} startContent={<Icon source={iconSourceFor(route.icon, "leading")} usage="leading" />} onPress={() => props.on?.navigate?.(route.id)}>{route.label}</TextAction>
            ))}
        </nav>
        <div aria-label={props.props.utilitiesLabel} className={shellNavDrawerUtilitiesClassName} role="group">
            <Button variant="ghost" onPress={props.on?.openSearch}>{props.props.searchLabel}</Button>
            <Button variant="ghost" onPress={props.on?.toggleLocale}>{props.props.localeActionLabel}</Button>
            <Button variant="ghost" onPress={props.on?.toggleTheme}>{props.props.themeLabel}</Button>
        </div>
    </div>
)
