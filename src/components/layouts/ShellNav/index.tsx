"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { SignInOverlay } from "@/components/overlays/auth/SignInOverlay"
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/config"
import { _ShellNav, type ShellNavRoute } from "./component"

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
const ROUTES: ReadonlyArray<{ id: string, href: string }> = [
    { id: "dashboard", href: "/dashboard" },
    { id: "courses", href: "/courses" },
    { id: "contact", href: "/contact" },
]

/**
 * Resolve the route, the theme and the language, and draw the bar.
 */
export const ShellNav = () => {
    const t = useTranslations("shell")
    const locale = useLocale()
    const pathname = usePathname()
    const { resolvedTheme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

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

    /**
     * The language is written to the cookie the server reads, then the page is reloaded rather
     * than re-rendered: the catalogue is resolved on the server, so a client-side swap would leave
     * every server-rendered string in the old language until the next navigation.
     */
    const toggleLocale = useCallback(() => {
        const next = locale === "vi" ? "en" : "vi"
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}`
        window.location.reload()
    }, [locale])

    const routes: ReadonlyArray<ShellNavRoute> = ROUTES.map((route) => ({
        id: route.id,
        href: route.href,
        label: t(`routes.${route.id}`),
        isCurrent: pathname === route.href,
    }))

    return (
        <_ShellNav
            props={{
                brand: t("brand"),
                routes,
                signInLabel: t("signIn"),
                themeLabel: isDark ? t("themeLight") : t("themeDark"),
                isDark,
                localeLabel: t("locale"),
                searchPlaceholder: t("searchPlaceholder"),
                searchLabel: t("search"),
                searchShortcut: t("searchShortcut"),
                cartLabel: t("cart"),
                accountLabel: t("account"),
            }}
            on={{ openSignIn, toggleTheme: () => setTheme(isDark ? "light" : "dark"), toggleLocale }}
        >
            <SignInOverlay isOpen={isOpen} onDismiss={dismiss} />
        </_ShellNav>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "shell" } as const
