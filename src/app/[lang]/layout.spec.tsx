import { describe, expect, it, vi } from "vitest"
type LayoutChildren = { children: unknown }
type LayoutSurface = LayoutChildren & { surface: unknown }

vi.mock("next/navigation", () => ({ notFound: vi.fn() }))
vi.mock("next-intl", () => ({ hasLocale: (_locales: ReadonlyArray<string>, locale: string) => locale === "en" || locale === "vi" }))
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string) => key, getMessages: async () => ({ app: {} }) }))
vi.mock("@/config/seo", () => ({ openGraphLocale: (locale: string) => locale, readSeoConfig: () => ({ siteUrl: "https://academy.starci.org", siteName: "StarCi", googleSiteVerification: undefined, imagePath: "/og.png" }) }))
vi.mock("@/components/layouts/GlobalAiChatLayout", () => ({ GlobalAiChatLayout: ({ surface }: LayoutSurface) => surface }))
vi.mock("../providers", () => ({ AppProviders: ({ children }: LayoutChildren) => children }))

import { generateMetadata } from "./layout"

describe("locale layout metadata", () => {
    it("resolves the application title for a routed language", async () => {
        const metadata = await generateMetadata({ params: Promise.resolve({ lang: "en" }), children: null })
        expect(metadata.applicationName).toBe("StarCi")
        expect(metadata.openGraph?.locale).toBe("en")
    })
})
