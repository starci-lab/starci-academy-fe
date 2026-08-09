"use client"

import { I18nProvider } from "@heroui/react"
import type { ReactNode } from "react"

/**
 * The one provider the vendor asks for.
 *
 * HeroUI's controls are built on react-aria, which resolves dates, numbers and its own built-in
 * strings against a LOCALE. Without a provider each control reads the browser's locale
 * independently, so a server render and the browser that hydrates it can disagree - the classic
 * hydration mismatch that only appears on somebody else's machine. Naming the locale once, here,
 * makes the two renders the same by construction.
 *
 * It lives beside the root layout rather than in the component tree because it is not a
 * component of the product: it decides nothing about what a screen looks like, and no tier owns
 * it. The layout is a server component, and this file is the client boundary that lets the
 * vendor's context sit above every route without turning the whole shell into client code.
 */

/**
 * The locale the vendor formats against. Fixed rather than read from the runtime, for the same
 * reason the streak's date format is: a locale picked up from the machine makes one build render
 * two different things, and the translation tier is what will own this when it lands.
 */
const LOCALE = "en-US"

/** Props for {@link AppProviders}. */
export interface AppProvidersProps {
    /** Everything rendered under the vendor's context - in practice, the whole shell. */
    children: ReactNode
}

/**
 * Mount the vendor's context above every route.
 *
 * @param props - {@link AppProvidersProps}
 */
export const AppProviders = ({ children }: AppProvidersProps) => (
    <I18nProvider locale={LOCALE}>{children}</I18nProvider>
)
