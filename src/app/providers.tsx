"use client"

import { I18nProvider } from "@heroui/react"
import { ThemeProvider } from "next-themes"
import { NextIntlClientProvider } from "next-intl"
import type { ReactNode } from "react"

/**
 * The three contexts that sit above every route, and nothing else.
 *
 * None of them decides what a screen looks like, which is why they live beside the root layout
 * rather than in the component tree: no tier owns them. The layout is a server component, and
 * this file is the client boundary that lets them sit above every route without turning the
 * whole shell into client code.
 *
 * VENDOR LOCALE - `I18nProvider`. HeroUI's controls are built on react-aria, which resolves
 * dates, numbers and its own built-in strings against a LOCALE. Without a provider each control
 * reads the browser's locale independently, so a server render and the browser that hydrates it
 * can disagree - the classic hydration mismatch that only appears on somebody else's machine.
 *
 * PRODUCT COPY - `NextIntlClientProvider`. The same locale, resolved once on the server in
 * `src/i18n/request.ts`, handed to the client tree so a component can ask for a string. The two
 * providers take the SAME locale deliberately: a page whose sentences are Vietnamese while its
 * date picker names months in English is one product speaking two languages at once.
 *
 * THEME - `ThemeProvider`. `globals.css` already answers to `.dark`, to `[data-theme="dark"]`
 * and to `prefers-color-scheme`, so the tokens were ready before anything could switch them.
 * This is the switch.
 */

/** Props for {@link AppProviders}. */
export interface AppProvidersProps {
    /** The locale resolved on the server, so both providers agree on one answer. */
    locale: string
    /** The resolved message catalogue for that locale. */
    messages: Record<string, unknown>
    /** Everything rendered under the contexts - in practice, the whole shell. */
    children: ReactNode
}

/**
 * Mount the contexts above every route.
 *
 * @param props - {@link AppProvidersProps}
 */
export const AppProviders = ({ locale, messages, children }: AppProvidersProps) => (
    <NextIntlClientProvider locale={locale} messages={messages}>
        <I18nProvider locale={locale}>
            {/*
              * `class` rather than the `data-theme` attribute because the vendor's own stylesheet
              * keys off `.dark`; the token layer answers to both, so the narrower choice is the
              * one that also dresses HeroUI's components. `system` is the default because a
              * reader who has told their OS which they want has already answered the question.
              */}
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>
)
