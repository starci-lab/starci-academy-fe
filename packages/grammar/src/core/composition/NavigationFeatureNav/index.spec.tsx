// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { NavigationFeatureNav } from "./index.js"

afterEach(cleanup)

describe("Core NavigationFeatureNav", () => {
    it("owns one or two layers without accepting a third navigation scope", () => {
        const { container } = render(
            <NavigationFeatureNav
                identity={<a href="/">StarCi</a>}
                navigation={<a href="/courses">Courses</a>}
                navigationLabel="Global navigation"
                compactNavigationTrigger={<button type="button">More</button>}
                compactNavigationTriggerLabel="Compact navigation"
                actions={<button type="button">Account</button>}
                actionsLabel="Utilities"
                featureNavigation={<nav aria-label="Dashboard features"><a href="/dashboard">Overview</a></nav>}
                featureNavigationLabel="Feature layer"
            />,
        )

        expect(container.querySelector("[data-grammar-navigation-feature-nav='true']")?.getAttribute("data-grammar-navigation-feature-nav-layers")).toBe("two")
        expect(screen.getByRole("navigation", { name: "Global navigation" })).toBeTruthy()
        expect(screen.getByRole("navigation", { name: "Dashboard features" })).toBeTruthy()
        expect(screen.getByRole("group", { name: "Compact navigation" })).toBeTruthy()
        expect(screen.getByRole("group", { name: "Utilities" })).toBeTruthy()
    })

    it("renders only the global layer when feature navigation is absent", () => {
        const { container } = render(
            <NavigationFeatureNav
                identity="StarCi"
                navigation="Routes"
                navigationLabel="Global navigation"
                compactNavigationTrigger={<button type="button">More</button>}
                compactNavigationTriggerLabel="Compact navigation"
                position="static"
            />,
        )

        expect(container.querySelector("[data-grammar-navigation-feature-nav='true']")?.getAttribute("data-grammar-navigation-feature-nav-layers")).toBe("one")
        expect(container.querySelector("[data-grammar-navigation-feature-nav-feature='true']")).toBeNull()
    })
})
