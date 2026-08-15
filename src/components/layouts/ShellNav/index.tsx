"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useSearchParams } from "next/navigation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { SignInOverlay } from "@/components/overlays/auth/SignInOverlay"
import { CartDrawer } from "@/components/overlays/commerce/CartDrawer"
import { GlobalSearchOverlay, type GlobalSearchOpenIntent } from "@/components/overlays/search/GlobalSearchOverlay"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { _ShellNav, type ShellNavRoute, type ShellNavTab } from "./component"
import type { IconName } from "@/components/leaves/Icon"
import type { AuthMode } from "@/components/blocks/auth/AuthenticationPanel/component"

/**
 * LAYOUT - `ShellNav`, connected half.
 *
 * It resolves four things the bar cannot: which route the reader is on, which theme is showing,
 * which language, and whether the sign-in dialog is open.
 *
 * THE DIALOG'S OPEN FLAG LIVES HERE rather than in the root layout, which is a server component
 * and cannot hold state - and rather than in the dialog itself, because a surface that decided
 * whether it was open would leave the control that opens it with nothing to press.
 */

/** The routes the bar offers, as ids the catalogue names. */
const ROUTES: ReadonlyArray<{ id: string, path: string }> = [
    { id: "dashboard", path: "/dashboard" },
    { id: "courses", path: "/courses" },
    { id: "contact", path: "/contact" },
]

/** Dashboard tabs registered as the navbar's bottom layer. */
const DASHBOARD_TABS: ReadonlyArray<{ id: string, icon: IconName }> = [
    { id: "overview", icon: "home" },
    { id: "explore", icon: "explore" },
    { id: "courses", icon: "course" },
    { id: "community", icon: "community" },
]

/**
 * Resolve the route, the theme and the language, and draw the bar.
 */
export const ShellNav = () => {
    useSessionRefresh()
    const t = useTranslations("shell")
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { resolvedTheme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [searchIntent, setSearchIntent] = useState<GlobalSearchOpenIntent>()
    const [authMode, setAuthMode] = useState<AuthMode>("signIn")
    const sessionToken = useSessionToken()

    const openSearch = useCallback((source: GlobalSearchOpenIntent["source"]) => {
        setSearchIntent({ requestId: Date.now(), source })
    }, [])

    useEffect(() => {
        const onShortcut = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
                event.preventDefault()
                openSearch("shortcut")
            }
        }
        window.addEventListener("keydown", onShortcut)
        return () => window.removeEventListener("keydown", onShortcut)
    }, [openSearch])

    /**
     * WHY THE THEME IS NOT READ UNTIL AFTER MOUNT, and why this is not ceremony.
     *
     * The server cannot know which theme a reader's machine prefers, so it renders one answer and
     * the browser resolves another. React reports that as a hydration mismatch and says it "won't
     * be patched up" - and the damage is not cosmetic: the handlers on that whole subtree never
     * attach, so the sign-in control beside this one silently stopped opening its dialog.
     *
     * Type checking, lint and 319 tests all passed while it was broken. Rendering the same markup
     * on both sides until mounted is the only thing that catches it.
     */
    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    /** Opening is the only thing the bar itself can do to the dialog. */
    const openSignIn = useCallback(() => {
        setAuthMode("signIn")
        setIsOpen(true)
    }, [])

    /** Open account creation from the guest dropdown, without flashing the sign-in form first. */
    const openSignUp = useCallback(() => {
        setAuthMode("signUp")
        setIsOpen(true)
    }, [])

    /**
     * Every way out ends here - the close control, Escape, and a successful sign-in, which the
     * dialog routes to the same callback because being signed in is also a way out.
     */
    const dismiss = useCallback(() => {
        setIsOpen(false)
    }, [])

    // Before mount the answer is the same on both sides; after it, the real one.
    const isDark = isMounted && resolvedTheme === "dark"

    const routes: ReadonlyArray<ShellNavRoute> = ROUTES.map((route) => ({
        id: route.id,
        label: t(`routes.${route.id}`),
        // A route is current on its own path AND anywhere beneath it: a course detail page is
        // still somewhere inside Courses, and a navbar that forgets that leaves the reader with
        // no lit destination at all. The trailing slash is what keeps `/contact` from lighting up
        // for a hypothetical `/contacts`.
        isCurrent: pathname === route.path || pathname.startsWith(`${route.path}/`),
    }))
    const dashboardTabs: ReadonlyArray<ShellNavTab> | undefined = pathname.startsWith("/dashboard")
        ? DASHBOARD_TABS.map((tab) => ({
            ...tab,
            label: t(`tabs.${tab.id}`),
            isCurrent: tab.id === (searchParams.get("tab") ?? "overview"),
        }))
        : undefined
    const tabs = dashboardTabs

    const selectTab = useCallback((key: string) => {
        router.replace(key === "overview" ? "/dashboard" : `/dashboard?tab=${key}`)
    }, [router])

    const navigate = useCallback((id: string) => {
        const destination = ROUTES.find((route) => route.id === id)
        if (destination !== undefined) router.push(destination.path)
    }, [router])

    return (
        <>
            <_ShellNav
                props={{
                    brand: t("brand"),
                    routes,
                    tabs,
                    themeLabel: isDark ? t("themeLight") : t("themeDark"),
                    isDark,
                    searchPlaceholder: t("searchPlaceholder"),
                    searchLabel: t("search"),
                    searchShortcut: t("searchShortcut"),
                    cartLabel: t("cart"),
                    notificationLabel: t("notifications"),
                    // The server cannot see the browser session store. Keep the first client tree
                    // identical to the server, then reveal signed-in tools after mount; otherwise
                    // AccountMenu is replaced by notification/account controls during hydration
                    // and every React-Aria id below this row shifts.
                    isSignedIn: isMounted && sessionToken !== undefined,
                }}
                on={{ openSignIn, openSignUp, navigate, selectTab, openSearch: () => openSearch("navbar"), toggleTheme: () => setTheme(isDark ? "light" : "dark"), openCart: () => setIsCartOpen(true) }}
            />
            <SignInOverlay isOpen={isOpen} initialMode={authMode} onDismiss={dismiss} />
            {/*
              * THE DRAWER IS MOUNTED HERE, once, beside the navbar that opens it - not on each
              * page. The control lives in the chrome, so the panel has to outlive the route under
              * it; and a drawer per page would be a focus trap per page for a panel only one of
              * which can ever be on screen.
              */}
            <CartDrawer isOpen={isCartOpen} onDismiss={() => setIsCartOpen(false)} />
            <GlobalSearchOverlay intent={searchIntent} on={{ dismissed: () => setSearchIntent(undefined) }} />
        </>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "shell" } as const
