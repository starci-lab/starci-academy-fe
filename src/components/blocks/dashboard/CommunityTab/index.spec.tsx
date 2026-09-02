/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react"
import type { AnchorHTMLAttributes } from "react"
import { describe, expect, it, vi } from "vitest"
import { CommunityTab } from "./index"

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({
    Link: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props}>{children}</a>,
}))

vi.mock("@/components/blocks/dashboard/LeagueCard", () => ({ LeagueCard: () => <section>weekly-region</section> }))
vi.mock("@/components/blocks/dashboard/TopLearners", () => ({ TopLearners: () => <section>platform-region</section> }))

describe("CommunityTab", () => {
    it("stacks the two ranking functions and keeps one destination action below them", () => {
        const { container } = render(<CommunityTab />)
        const weekly = screen.getByText("weekly-region")
        const platform = screen.getByText("platform-region")
        const action = screen.getByRole("link", { name: "seeMore" })
        expect(weekly.compareDocumentPosition(platform) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(platform.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(container.firstElementChild).toHaveClass("flex", "flex-col", "gap-4")
        expect(container.querySelector("[data-dashboard-community-cards=true]")).toHaveClass("flex", "flex-col", "gap-6")
        expect(screen.queryByText("pageTitle")).toBeNull()
        expect(action.closest("div")).toHaveClass("justify-end")
        expect(action.querySelector("svg")).toBeNull()
        expect(action).toHaveAttribute("href", "/league")
    })
})
