/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useQueryResolveRouteSwr, useQueryTrendingContentsSwr } from "@/hooks"
import { TrendingContents } from "./index"

/**
 * What these tests guard - that a rail nobody can act on is not drawn at all.
 *
 * The block has two ways of having nothing to say (a failed request and a settled empty list) and
 * both must vanish rather than leave an empty card in the sidebar. The third situation, a request
 * still in flight, must keep its height instead.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQueryTrendingContentsSwr: vi.fn(),
    useQueryResolveRouteSwr: vi.fn(),
}))

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One ranked content row as the server sends it. */
const content = (globalId: string, title: string) => ({ globalId, title })

/** Stand in for the on-demand route resolver, answering with one path. */
const resolver = (path: string | null) => ({
    trigger: vi.fn().mockResolvedValue({ data: { resolveRoute: { data: path === null ? null : { path } } } }),
}) as never

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("TrendingContents", () => {
    it("draws nothing at all when the ranking could not be read", () => {
        vi.mocked(useQueryTrendingContentsSwr).mockReturnValue(answer({ error: new Error("down") }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        const { container } = render(<TrendingContents />)
        expect(container).toBeEmptyDOMElement()
    })

    it("draws nothing at all when the platform has no trending content yet", () => {
        vi.mocked(useQueryTrendingContentsSwr).mockReturnValue(answer({ data: [] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        const { container } = render(<TrendingContents />)
        expect(container).toBeEmptyDOMElement()
    })

    it("holds six resting ranks while the ranking is on its way", () => {
        vi.mocked(useQueryTrendingContentsSwr).mockReturnValue(answer({ data: undefined }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<TrendingContents />)
        expect(screen.getByText("trending")).toBeInTheDocument()
        expect(screen.getByText("trending")).toBeInTheDocument()
    })

    it("numbers at most six rows and accents only the first three", () => {
        vi.mocked(useQueryTrendingContentsSwr).mockReturnValue(answer({
            data: Array.from({ length: 8 }, (_, index) => content(`gid-${index}`, `Content ${index}`)),
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<TrendingContents />)
        expect(screen.getByText("Content 0")).toBeInTheDocument()
        expect(screen.getByText("1")).toBeInTheDocument()
        expect(screen.getByText("6")).toBeInTheDocument()
        expect(screen.queryByText("7")).toBeNull()
        expect(screen.queryByText("Content 6")).toBeNull()
        expect(screen.getByText("Content 5")).toBeInTheDocument()
    })

    it("resolves a row's own route and travels there", async () => {
        const route = resolver("/contents/deep-dive")
        vi.mocked(useQueryTrendingContentsSwr).mockReturnValue(answer({ data: [content("gid-1", "Deep dive")] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(route)

        render(<TrendingContents />)
        fireEvent.click(screen.getByText("Deep dive"))

        await waitFor(() => expect(push).toHaveBeenCalledWith("/contents/deep-dive"))
        expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger)
            .toHaveBeenCalledWith({ globalId: "gid-1" })
    })

    it("stays put when the resolver has no route for the row", async () => {
        const route = resolver(null)
        vi.mocked(useQueryTrendingContentsSwr).mockReturnValue(answer({ data: [content("gid-1", "Deep dive")] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(route)

        render(<TrendingContents />)
        fireEvent.click(screen.getByText("Deep dive"))

        await waitFor(() => expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger).toHaveBeenCalled())
        expect(push).not.toHaveBeenCalled()
    })
})
