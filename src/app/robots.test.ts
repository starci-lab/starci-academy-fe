import {
    describe,
    expect,
    it,
} from "vitest"
import {
    buildSeoConfig,
} from "@/config/seo"
import {
    buildRobots,
} from "./robots"

describe("buildRobots", () => {
    it("publishes the sitemap while blocking private and learning clusters", () => {
        const robots = buildRobots(buildSeoConfig({ siteUrl: "https://academy.starci.org" }))
        const rules = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules

        expect(robots.sitemap).toBe("https://academy.starci.org/sitemap.xml")
        expect(rules?.allow).toBe("/")
        expect(rules?.disallow).toEqual(expect.arrayContaining([
            "/api/",
            "/en/authentication",
            "/vi/dashboard",
            "/en/courses/*/learn",
            "/vi/courses/*/learn",
        ]))
    })
})
