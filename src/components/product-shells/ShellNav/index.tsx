"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { SignInOverlay } from "@/components/overlays/auth/SignInOverlay"
import { CartDrawer } from "@/components/overlays/commerce/CartDrawer"
import { GlobalSearchOverlay, type GlobalSearchOpenIntent } from "@/components/overlays/search/GlobalSearchOverlay"
import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useStarCiTheme } from "@/modules/theme/theme-context"
import { ShellNavBase, ShellNavigationDrawerBase, type ShellNavData, type ShellNavFeatureTab, type ShellNavRoute } from "./component"
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
/** Props for the connected shell navigation owner. */
export type ShellNavProps = Record<never, never>

/** The routes the bar offers, as ids the catalogue names. */
const ROUTES: ReadonlyArray<{ id: string, path: string, icon: IconName }> = [
    { id: "dashboard", path: "/dashboard", icon: "home" },
    { id: "courses", path: "/courses", icon: "course" },
    { id: "contact", path: "/contact", icon: "email" },
]

/** Dashboard tabs registered as the navbar's bottom layer. */
const DASHBOARD_TABS: ReadonlyArray<{ id: string, icon: IconName }> = [
    { id: "overview", icon: "home" },
    { id: "explore", icon: "explore" },
    { id: "bulletin", icon: "blog" },
    { id: "courses", icon: "course" },
    { id: "community", icon: "community" },
]

/** Course details reuse the same navbar feature layer instead of drawing a second local rail. */
const COURSE_DETAIL_TABS: ReadonlyArray<{ id: string, icon: IconName }> = [
    { id: "overview", icon: "explore" },
    { id: "curriculum", icon: "courseContent" },
    { id: "reviews", icon: "ratingStarEmpty" },
    { id: "faq", icon: "courseQa" },
]

const isCourseDetailPath = (pathname: string) => /^\/courses\/[^/]+$/.test(pathname)

/**
 * Resolve the route, the theme and the language, and draw the bar.
 */
export const ShellNav = (props: ShellNavProps) => {
    void props
    useSessionRefresh()
    const t = useTranslations("shell")
    const courseDetailT = useTranslations("courses.detail")
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { resolvedTheme, setTheme } = useStarCiTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isNavigationOpen, setIsNavigationOpen] = useState(false)
    const [searchIntent, setSearchIntent] = useState<GlobalSearchOpenIntent>()
    const [authMode, setAuthMode] = useState<AuthMode>("signIn")
    const [courseFeatureSelection, setCourseFeatureSelection] = useState({ pathname: "", id: "overview" })
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
        icon: route.icon,
        // A route is current on its own path AND anywhere beneath it: a course detail page is
        // still somewhere inside Courses, and a navbar that forgets that leaves the reader with
        // no lit destination at all. The trailing slash is what keeps `/contact` from lighting up
        // for a hypothetical `/contacts`.
        isCurrent: pathname === route.path || pathname.startsWith(`${route.path}/`),
    }))
    const dashboardTabs: ReadonlyArray<ShellNavFeatureTab> | undefined = pathname.startsWith("/dashboard")
        ? DASHBOARD_TABS.map((tab) => ({
            ...tab,
            label: t(`tabs.${tab.id}`),
            isCurrent: tab.id === (searchParams.get("tab") ?? "overview"),
        }))
        : undefined
    const courseDetailTabs: ReadonlyArray<ShellNavFeatureTab> | undefined = isCourseDetailPath(pathname)
        ? COURSE_DETAIL_TABS.map((tab) => ({
            ...tab,
            label: courseDetailT(`${tab.id}Tab`),
            isCurrent: tab.id === (courseFeatureSelection.pathname === pathname ? courseFeatureSelection.id : "overview"),
        }))
        : undefined
    const featureTabs = dashboardTabs ?? courseDetailTabs
    const selectFeatureTab = useCallback((key: string) => {
        if (pathname.startsWith("/dashboard")) {
            router.replace(key === "overview" ? "/dashboard" : `/dashboard?tab=${key}`)
            return
        }
        if (!isCourseDetailPath(pathname) || !COURSE_DETAIL_TABS.some((tab) => tab.id === key)) return
        setCourseFeatureSelection({ pathname, id: key })
        document.getElementById(`course-detail-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, [pathname, router])

    const navigate = useCallback((id: string) => {
        setIsNavigationOpen(false)
        const destination = ROUTES.find((route) => route.id === id)
        if (destination !== undefined) router.push(destination.path)
    }, [router])

    const shellNavData: ShellNavData = {
        brand: t("brand"),
        routes,
        featureTabs,
        themeLabel: isDark ? t("themeLight") : t("themeDark"),
        utilitiesLabel: t("navigationOverflow"),
        actionsLabel: t("accountActions"),
        localeActionLabel: t(`localeOptions.${locale === "vi" ? "en" : "vi"}`),
        isDark,
        searchPlaceholder: t("searchPlaceholder"),
        searchLabel: t("search"),
        searchShortcut: t("searchShortcut"),
        cartLabel: t("cart"),
        notificationLabel: t("notifications"),
        isSignedIn: isMounted && sessionToken !== undefined,
    }

    const openSearchFromNavigation = () => {
        setIsNavigationOpen(false)
        openSearch("navbar")
    }
    const toggleThemeFromNavigation = () => {
        setIsNavigationOpen(false)
        setTheme(isDark ? "light" : "dark")
    }
    const toggleLocaleFromNavigation = () => {
        setIsNavigationOpen(false)
        router.replace(pathname, { locale: locale === "vi" ? "en" : "vi" })
    }

    return (
        <>
            <ShellNavBase
                props={shellNavData}
                on={{
                    openSignIn,
                    openSignUp,
                    navigate,
                    selectFeatureTab,
                    openSearch: () => openSearch("navbar"),
                    openNavigation: () => setIsNavigationOpen(true),
                    toggleTheme: () => setTheme(isDark ? "light" : "dark"),
                    toggleLocale: () => router.replace(pathname, { locale: locale === "vi" ? "en" : "vi" }),
                    openCart: () => setIsCartOpen(true),
                }}
            />
            <DrawerBranch isOpen={isNavigationOpen} placement="right" title={shellNavData.brand} onDismiss={() => setIsNavigationOpen(false)}>
                <ShellNavigationDrawerBase
                    props={shellNavData}
                    on={{
                        navigate,
                        openSearch: openSearchFromNavigation,
                        toggleTheme: toggleThemeFromNavigation,
                        toggleLocale: toggleLocaleFromNavigation,
                    }}
                />
            </DrawerBranch>
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
