import {
    describe,
    expect,
    it,
    vi,
} from "vitest"
import {
    buildSeoConfig,
} from "@/config/seo"
import {
    buildSitemap,
    discoverCourseDisplayIds,
} from "./sitemap"

describe("sitemap", () => {
    it("discovers unique non-empty course identities", async () => {
        const fetcher = vi.fn(async () => new Response(JSON.stringify({
            data: {
                courses: {
                    data: {
                        data: [
                            { displayId: "fullstack" },
                            { displayId: "fullstack" },
                            { displayId: "  " },
                            { displayId: "system-design" },
                        ],
                    },
                },
            },
        }), { status: 200 }))

        await expect(discoverCourseDisplayIds("https://api.example/graphql", fetcher)).resolves.toEqual([
            "fullstack",
            "system-design",
        ])
    })

    it("degrades discovery failures to an empty dynamic set", async () => {
        const fetcher = vi.fn(async () => {
            throw new Error("offline")
        })

        await expect(discoverCourseDisplayIds("https://api.example/graphql", fetcher)).resolves.toEqual([])
    })

    it("publishes localized catalog and course entries only", () => {
        const sitemap = buildSitemap(
            ["fullstack"],
            buildSeoConfig({ siteUrl: "https://academy.starci.org" }),
        )

        expect(sitemap).toHaveLength(2)
        expect(sitemap[0]).toMatchObject({
            url: "https://academy.starci.org/en/courses",
            alternates: {
                languages: {
                    en: "https://academy.starci.org/en/courses",
                    vi: "https://academy.starci.org/vi/courses",
                },
            },
        })
        expect(sitemap[1]?.url).toBe("https://academy.starci.org/en/courses/fullstack")
    })
})
