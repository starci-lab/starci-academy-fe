import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { DashboardShell } from "./index.js"

describe("Core DashboardShell", () => {
    it("renders the complete dashboard anatomy in reading order with one named main landmark", () => {
        const markup = renderToStaticMarkup(
            <DashboardShell
                className="consumer-shell"
                floatingLayer={<button type="button">Ask assistant</button>}
                header={<h1 id="dashboard-title">Learning dashboard</h1>}
                navigation={<a href="/courses">Courses</a>}
                navigationLabel="Dashboard sections"
                primary={<p>Continue learning</p>}
                primaryId="dashboard-content"
                primaryLabelledBy="dashboard-title"
                rail={<p>Weekly progress</p>}
                railLabel="Learning summary"
                railMode="sticky"
                railWidth="wide"
            />,
        )

        expect(markup).toContain("starci-core-dashboard-shell consumer-shell")
        expect(markup).toContain("data-grammar-dashboard-floating=\"present\"")
        expect(markup).toContain("data-grammar-dashboard-navigation=\"present\"")
        expect(markup).toContain("data-grammar-dashboard-rail=\"present\"")
        expect(markup).toContain("data-grammar-dashboard-rail-width=\"wide\"")
        expect(markup).toContain("<nav aria-label=\"Dashboard sections\"")
        expect(markup).toContain("<main aria-labelledby=\"dashboard-title\"")
        expect(markup).toContain("id=\"dashboard-content\" tabindex=\"-1\"")
        expect(markup.match(/<main/g)).toHaveLength(1)
        expect(markup).toContain("data-grammar-rail-mode=\"sticky\"")
        expect(markup).toContain("data-grammar-rail-width=\"wide\"")
        expect(markup).toContain("starci-core-visually-hidden")
        expect(markup).toContain("data-grammar-dashboard-floating-layer=\"true\"")

        const headerIndex = markup.indexOf("data-grammar-dashboard-header")
        const navigationIndex = markup.indexOf("data-grammar-dashboard-navigation-region")
        const primaryIndex = markup.indexOf("data-grammar-dashboard-primary")
        const railIndex = markup.indexOf("data-grammar-dashboard-rail-region")
        const floatingIndex = markup.indexOf("data-grammar-dashboard-floating-layer")
        expect(headerIndex).toBeLessThan(navigationIndex)
        expect(navigationIndex).toBeLessThan(primaryIndex)
        expect(primaryIndex).toBeLessThan(railIndex)
        expect(railIndex).toBeLessThan(floatingIndex)
    })

    it("delegates main-landmark ownership without adding a nested main", () => {
        const markup = renderToStaticMarkup(
            <DashboardShell
                mainLandmark="caller"
                primary={<main aria-label="Account dashboard">Account content</main>}
                primaryId="account-dashboard"
            />,
        )

        expect(markup.match(/<main/g)).toHaveLength(1)
        expect(markup).toContain("data-grammar-main-landmark=\"caller\"")
        expect(markup).toContain("id=\"account-dashboard\" tabindex=\"-1\"")
        expect(markup).not.toContain("aria-labelledby")
    })

    it("omits optional landmarks and projections instead of leaving empty shells", () => {
        const markup = renderToStaticMarkup(
            <DashboardShell
                floatingLayer={false}
                header={false}
                primary={<p>Dashboard content</p>}
                primaryLabel="Dashboard"
            />,
        )

        expect(markup).toContain("data-grammar-dashboard-navigation=\"absent\"")
        expect(markup).toContain("data-grammar-dashboard-rail=\"absent\"")
        expect(markup).toContain("data-grammar-dashboard-floating=\"absent\"")
        expect(markup).not.toContain("<nav")
        expect(markup).not.toContain("<aside")
        expect(markup).not.toContain("data-grammar-dashboard-header=\"true\"")
        expect(markup).not.toContain("data-grammar-dashboard-floating-layer=\"true\"")
    })

    it("supports an authored visible rail heading and Grammar-owned content inset", () => {
        const markup = renderToStaticMarkup(
            <DashboardShell
                isRailLabelHidden={false}
                primary={<p>Primary</p>}
                primaryLabel="Dashboard"
                rail={<p>Supporting evidence</p>}
                railInset="content"
                railLabel="Evidence"
            />,
        )

        expect(markup).toContain(">Evidence</h2>")
        expect(markup).not.toContain("starci-core-visually-hidden")
        expect(markup).toContain("data-grammar-rail-inset=\"content\"")
        expect(markup).toContain("px-3 py-6")
    })

    it("can place the supporting rail before the dominant region", () => {
        const markup = renderToStaticMarkup(
            <DashboardShell
                primary={<p>Primary</p>}
                primaryLabel="Dashboard"
                rail={<p>Standing</p>}
                railLabel="Standing"
                railPosition="leading"
            />,
        )

        expect(markup).toContain("data-grammar-dashboard-rail-position=\"leading\"")
        expect(markup).toContain("data-grammar-dashboard-leading-rule=\"true\"")
        const railIndex = markup.indexOf("data-grammar-dashboard-rail-region")
        const ruleIndex = markup.indexOf("data-grammar-dashboard-leading-rule")
        const primaryIndex = markup.indexOf("data-grammar-dashboard-primary")
        expect(railIndex).toBeGreaterThan(-1)
        expect(ruleIndex).toBeGreaterThan(railIndex)
        expect(primaryIndex).toBeGreaterThan(ruleIndex)
    })
})
