import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
    navigationFeatureNavCompactNavigationClassName,
    navigationFeatureNavNavigationClassName,
    navigationFeatureNavPrimaryClassName,
} from "./classNames.js"

const css = readFileSync(new URL("../../styles.css", import.meta.url), "utf8")
const navbarStart = css.indexOf(".starci-core-navigation-feature-nav {")
const navbarEnd = css.indexOf(".starci-core-dashboard-shell {")
const navbarCss = css.slice(navbarStart, navbarEnd)

describe("Core NavigationFeatureNav styles", () => {
    it("draws only the outer bottom separator across its two layers", () => {
        expect(navbarStart).toBeGreaterThanOrEqual(0)
        expect(navbarEnd).toBeGreaterThan(navbarStart)
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav\s*\{[\s\S]*?border-bottom:/)
        const featureStart = navbarCss.indexOf(".starci-core-navigation-feature-nav-feature {")
        const featureEnd = navbarCss.indexOf("}", featureStart)
        const featureRule = navbarCss.slice(featureStart, featureEnd + 1)
        expect(featureRule).not.toMatch(/border(?:-top|-bottom)?:/)
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav-feature \.tabs__list-container\s*\{[\s\S]*?border-bottom-width: 0 !important;/)
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav-feature \.starci-core-tabs-scroll\s*\{[\s\S]*?padding-block: 0;/)
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav-feature \.extended-tabs \.tabs__indicator\s*\{[\s\S]*?inset-block-end: 0 !important;/)
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav-primary\.starci-core-page-container\s*\{[\s\S]*?padding-inline: 0\.75rem;/)
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav-feature\.starci-core-page-container\s*\{[\s\S]*?padding-inline: 0\.75rem;/)
        expect(navbarCss).not.toMatch(/\.starci-core-navigation-feature-nav-feature \.extended-tabs \.tabs__indicator\s*\{[\s\S]*?inset-block-end: -/)
        expect(navbarCss).not.toMatch(/grid-template-columns: 16rem minmax\(0, 1fr\)/)
    })

    it("hides primary destination text at compact widths and restores it on desktop", () => {
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav-primary\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto auto !important;/)
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav-navigation\s*\{[\s\S]*?display: none !important;/)
        expect(navbarCss).toMatch(/\.starci-core-navigation-feature-nav-compact-navigation\s*\{[\s\S]*?display: block !important;/)
        expect(navbarCss).toContain("@media (min-width: 48rem)")
        expect(navbarCss).toMatch(/@media \(min-width: 48rem\)[\s\S]*?\.starci-core-navigation-feature-nav-navigation\s*\{[\s\S]*?display: block !important;/)
        expect(navbarCss).toMatch(/@media \(min-width: 48rem\)[\s\S]*?\.starci-core-navigation-feature-nav-compact-navigation\s*\{[\s\S]*?display: none !important;/)
    })

    it("keeps responsive visibility under the Grammar stylesheet instead of utility generation", () => {
        const responsiveUtilityTokens = ["block", "hidden", "grid", "md:block", "md:hidden", "md:grid-cols-[auto_minmax(0,1fr)_auto]"]
        const grammarClassTokens = [
            ...(navigationFeatureNavPrimaryClassName ?? "").split(" "),
            ...(navigationFeatureNavNavigationClassName ?? "").split(" "),
            ...(navigationFeatureNavCompactNavigationClassName ?? "").split(" "),
        ]

        expect(grammarClassTokens).not.toEqual(expect.arrayContaining(responsiveUtilityTokens))
    })

    it("keeps Subnav compact and gives its icon trigger a 44px target", () => {
        expect(navbarCss).toMatch(/\.starci-core-subnav-toggle\s*\{[\s\S]*?width: 2\.75rem;[\s\S]*?height: 2\.75rem;/)
        expect(navbarCss).toMatch(/@media \(min-width: 70rem\)[\s\S]*?data-grammar-subnav-visibility="compact"[\s\S]*?display: none;/)
    })
})
