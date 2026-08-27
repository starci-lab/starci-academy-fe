import { describe, expect, it, vi } from "vitest"
type LayoutChildren = { children: unknown }
type LayoutSurface = LayoutChildren & { surface: unknown }
const seo = vi.hoisted(() => ({ googleSiteVerification: undefined as string | undefined }))

vi.mock("next/navigation", () => ({ notFound: vi.fn() }))
vi.mock("next/font/google", () => ({ Be_Vietnam_Pro: () => ({ variable: "--starci-font-sans" }) }))
vi.mock("next-intl", () => ({ hasLocale: (_locales: ReadonlyArray<string>, locale: string) => locale === "en" || locale === "vi" }))
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string) => key, getMessages: async () => ({ app: {} }) }))
vi.mock("@/config/seo", () => ({ openGraphLocale: (locale: string) => locale, readSeoConfig: () => ({ siteUrl: "https://academy.starci.org", siteName: "StarCi", googleSiteVerification: seo.googleSiteVerification, imagePath: "/og.png" }) }))
vi.mock("@/components/layouts/GlobalAiChatLayout", () => ({ GlobalAiChatLayout: ({ surface }: LayoutSurface) => surface }))
vi.mock("../providers", () => ({ AppProviders: ({ children }: LayoutChildren) => children }))

import LocaleLayout, { generateMetadata } from "./layout"

describe("locale layout metadata", () => {
    it("resolves the application title for a routed language", async () => {
        const metadata = await generateMetadata({ params: Promise.resolve({ lang: "en" }), children: null })
        expect(metadata.applicationName).toBe("StarCi")
        expect(metadata.openGraph?.locale).toBe("en")
    })
    it("mounts the locale provider shell", async () => {
        const shell = await LocaleLayout({ children: null, params: Promise.resolve({ lang: "en" }) })
        expect(shell).toBeTruthy()
        expect(shell.props.lang).toBe("en")
    })
    it("handles an invalid locale in layout metadata", async () => {
        await generateMetadata({ params: Promise.resolve({ lang: "fr" }), children: null })
    })
    it("guards an invalid locale in the layout body", async () => {
        await LocaleLayout({ children: null, params: Promise.resolve({ lang: "fr" }) })
    })
    it("includes verification metadata when configured", async () => {
        seo.googleSiteVerification = "verification"
        const metadata = await generateMetadata({ params: Promise.resolve({ lang: "en" }), children: null })
        expect(metadata.verification).toEqual({ google: "verification" })
        seo.googleSiteVerification = undefined
    })
})
