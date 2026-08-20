import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useQueryChangelogEntriesSwr } from "@/hooks"
import { ChangelogList } from "./index"

const push = vi.fn()

vi.mock("next-intl", () => ({
    useLocale: () => "en-US",
    useTranslations: () => (key: string) => key,
}))

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({ useQueryChangelogEntriesSwr: vi.fn() }))

const entry = (over: Record<string, unknown>) => ({
    id: "one",
    title: "Shipped the catalog",
    body: "Nine courses a page",
    category: "feature",
    publishedAt: "2026-03-14T00:00:00.000Z",
    linkUrl: null,
    ...over,
})

const stub = (over: Record<string, unknown>) => {
    vi.mocked(useQueryChangelogEntriesSwr).mockReturnValue({
        data: undefined,
        error: undefined,
        ...over,
    } as never)
}

const rows = (root: HTMLElement) => root.querySelectorAll("[data-node=\"changelog-entry-row\"]")

afterEach(() => {
    vi.clearAllMocks()
})

describe("ChangelogList", () => {
    it("dates each entry in the viewer's own locale and names its product category", () => {
        stub({ data: [
            entry({ id: "a", category: "feature", title: "Shipped the catalog" }),
            entry({ id: "b", category: "fix", title: "Fixed the pager" }),
            entry({ id: "c", category: "announcement", title: "New league" }),
        ] })
        const { container } = render(<ChangelogList />)
        expect(Array.from(rows(container), (row) => row.textContent)).toEqual([
            "3/14/2026category.featureShipped the catalogNine courses a page",
            "3/14/2026category.fixFixed the pagerNine courses a page",
            "3/14/2026category.announcementNew leagueNine courses a page",
        ])
    })

    it("leaves an entry whose category the client does not know without a category label", () => {
        stub({ data: [entry({ category: "experiment" })] })
        const { container } = render(<ChangelogList />)
        expect(container.querySelector("[data-component=\"Badge\"]")).toBeNull()
        expect(rows(container)[0]?.textContent).toBe("3/14/2026Shipped the catalogNine courses a page")
    })

    it("routes an entry that carries a destination", () => {
        stub({ data: [entry({ linkUrl: "/courses/backend-basics" })] })
        render(<ChangelogList />)
        fireEvent.click(screen.getByRole("link", { name: "Shipped the catalog" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/courses/backend-basics")
    })

    it("offers no way in for an entry that carries no destination", () => {
        stub({ data: [entry({ linkUrl: null })] })
        const { container } = render(<ChangelogList />)
        expect(screen.queryByRole("link")).toBeNull()
        expect(container.querySelector("[data-node=\"changelog-entry-row\"]")?.textContent)
            .toContain("Shipped the catalog")
        expect(push).not.toHaveBeenCalled()
    })

    it("goes nowhere for an entry the server sent with no destination field at all", () => {
        stub({ data: [entry({ linkUrl: undefined })] })
        render(<ChangelogList />)
        fireEvent.click(screen.getByRole("link", { name: "Shipped the catalog" }))
        expect(push).not.toHaveBeenCalled()
    })

    it("draws nothing at all once a settled changelog turns out to be empty", () => {
        stub({ data: [] })
        const { container } = render(<ChangelogList />)
        expect(container.firstElementChild).toBeNull()
    })

    it("says the request failed instead of drawing a history it does not have", () => {
        stub({ error: new Error("down") })
        const { container } = render(<ChangelogList />)
        expect(container.textContent).toContain("failed")
        expect(rows(container)).toHaveLength(1)
    })

    it("keeps the settled history on screen when a revalidation fails behind it", () => {
        stub({ data: [entry({})], error: new Error("stale") })
        const { container } = render(<ChangelogList />)
        expect(container.textContent).not.toContain("failed")
        expect(rows(container)).toHaveLength(1)
    })

    it("rests the history while the request is in flight", () => {
        stub({})
        const { container } = render(<ChangelogList />)
        expect(rows(container).length).toBeGreaterThan(0)
        expect(container.querySelector("[data-node=\"changelog-entry-row\"] [data-loading=\"true\"]"))
            .toBeInTheDocument()
    })
})
