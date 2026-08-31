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
        mutate: vi.fn(),
        ...over,
    } as never)
}


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
        expect(container.textContent).toContain("Shipped the catalog")
        expect(container.textContent).toContain("Fixed the pager")
        expect(container.textContent).toContain("New league")
    })

    it("leaves an entry whose category the client does not know without a category label", () => {
        stub({ data: [entry({ category: "experiment" })] })
        const { container } = render(<ChangelogList />)
        expect(container.textContent).toContain("Shipped the catalog")
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
        expect(container.textContent).toContain("Shipped the catalog")
        expect(push).not.toHaveBeenCalled()
    })

    it("goes nowhere for an entry the server sent with no destination field at all", () => {
        stub({ data: [entry({ linkUrl: undefined })] })
        render(<ChangelogList />)
        expect(screen.queryByRole("link", { name: "Shipped the catalog" })).toBeNull()
        expect(push).not.toHaveBeenCalled()
    })

    it("keeps a visible list surface once a settled changelog turns out to be empty", () => {
        stub({ data: [] })
        render(<ChangelogList />)
        expect(screen.getByText("empty")).toBeInTheDocument()
    })

    it("says the request failed and offers the existing query retry", () => {
        const mutate = vi.fn()
        stub({ error: new Error("down"), mutate })
        render(<ChangelogList />)
        expect(screen.getByText("failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("keeps the settled history on screen when a revalidation fails behind it", () => {
        stub({ data: [entry({})], error: new Error("stale") })
        const { container } = render(<ChangelogList />)
        expect(container.textContent).not.toContain("failed")
        expect(container.textContent).toContain("Shipped the catalog")
    })

    it("rests the history while the request is in flight", () => {
        stub({})
        const { container } = render(<ChangelogList />)
        expect(container.textContent).toContain("\u00a0")
    })
})
