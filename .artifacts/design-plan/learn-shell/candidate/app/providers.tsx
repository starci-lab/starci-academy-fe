"use client"

import type { ReactNode } from "react"
import { I18nProvider } from "@heroui/react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"

/**
 * The client boundary, mirroring the target's `src/app/providers.tsx`.
 *
 * This file exists for the same reason the target's does, and the first build proved it: all three
 * providers call `React.createContext`, which does not exist in a server component. Mounted from
 * the server layout directly they compiled cleanly and then failed at page-data collection with
 * `createContext is not a function`. The boundary is not a formality — it is what makes them
 * evaluable at all.
 */

/** Props for {@link CandidateProviders}. */
export interface CandidateProvidersProps {
    /** The fixture locale, pinned rather than negotiated. */
    locale: string
    /** The target's own message catalogue for that locale. */
    messages: Record<string, unknown>
    /** The state matrix rendered under the contexts. */
    children: ReactNode
}

/**
 * Mount the three contexts above the candidate.
 *
 * @param props - {@link CandidateProvidersProps}
 */
export const CandidateProviders = ({ locale, messages, children }: CandidateProvidersProps) => (
    <NextIntlClientProvider locale={locale} messages={messages}>
        <I18nProvider locale={locale}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                {children}
            </ThemeProvider>
        </I18nProvider>
    </NextIntlClientProvider>
)
