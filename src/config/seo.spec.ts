import {
    describe,
    expect,
    it,
} from "vitest"
import {
    buildSeoConfig,
    localizedAlternates,
    localizedUrl,
    openGraphLocale,
} from "./seo"

describe("SEO configuration", () => {
    it("normalizes the deployment origin and optional provider values", () => {
        expect(buildSeoConfig({
            siteUrl: "https://academy.starci.org/path/",
            googleSiteVerification: " search-token ",
            gaId: " G-STARCI ",
        })).toMatchObject({
            siteUrl: "https://academy.starci.org",
            googleSiteVerification: "search-token",
            gaId: "G-STARCI",
        })
    })

    it("builds canonical, language and x-default URLs for the same route", () => {
        const config = buildSeoConfig({ siteUrl: "https://academy.starci.org" })

        expect(localizedUrl("vi", "/courses", config)).toBe("https://academy.starci.org/vi/courses")
        expect(localizedAlternates("en", "/courses", config)).toEqual({
            canonical: "https://academy.starci.org/en/courses",
            languages: {
                en: "https://academy.starci.org/en/courses",
                vi: "https://academy.starci.org/vi/courses",
                "x-default": "https://academy.starci.org/en/courses",
            },
        })
    })

    it("maps application locales to OpenGraph locale identifiers", () => {
        expect(openGraphLocale("en")).toBe("en_US")
        expect(openGraphLocale("vi")).toBe("vi_VN")
    })
})
