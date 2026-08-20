import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ notFound: vi.fn() }))
vi.mock("next-intl", () => ({ hasLocale: (_locales: ReadonlyArray<string>, locale: string) => locale === "en" || locale === "vi" }))
vi.mock("next-intl/server", () => ({ getTranslations: async () => (key: string) => key }))
vi.mock("@/components/pages/CourseDetailPage", () => ({ CourseDetailPage: () => null }))
vi.mock("@/config/seo", () => ({ localizedAlternates: () => ({}), localizedUrl: (_locale: string, path: string) => path, openGraphLocale: (locale: string) => locale, readSeoConfig: () => ({ siteUrl: "https://academy.starci.org", description: "Academy" }) }))

import CourseDetailRoute, { generateMetadata } from "./page"

describe("course detail route metadata", () => {
    it("resolves a localized encoded course path", async () => {
        const metadata = await generateMetadata({ params: Promise.resolve({ lang: "vi", displayId: "course one" }) })
        expect(String(metadata.title)).toContain("course one")
        expect(metadata.openGraph?.locale).toBe("vi")
    })
    it("mounts the client course detail route", async () => {
        expect(await CourseDetailRoute({ params: Promise.resolve({ lang: "en", displayId: "course" }) })).toBeTruthy()
    })
    it("handles an invalid locale through the route guard", async () => {
        await generateMetadata({ params: Promise.resolve({ lang: "fr", displayId: "course" }) })
    })
})
