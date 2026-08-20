/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { MyFeedCategory, MyFeedTab } from "../../modules/api/graphql/queries/types/my-feed"
import { MY_FEED_PAGE_LIMIT, QUERY_MY_FEED_SWR_KEY, useQueryMyFeedSwr } from "./useQueryMyFeedSwr"

/**
 * What these tests guard: the CURSOR RULE, which is the only thing a paginated key can get wrong
 * silently.
 *
 * The first page carries no cursor - sending one would ask the server to continue a walk that has
 * not started. Every later page carries the cursor the page before it handed back, so a page is
 * requested once and in order. A page that answers `nextCursor: null` ENDS the walk: the key
 * function returns null for the page after it, and SWR then asks for nothing however many times
 * the caller raises the size.
 *
 * The viewer is in the key for the usual reason - a feed is the most personal list on the page,
 * and the next reader on this tab must not be handed the previous reader's activity.
 */

const mocks = vi.hoisted(() => ({ queryMyFeed: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-feed", () => ({
    queryMyFeed: mocks.queryMyFeed,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** Which feed a rerendering test is reading. */
interface TabProps {
    /** The tab on screen. */
    tab: MyFeedTab
}

/** One activity, trimmed to the fields the document selects. */
const activity = (id: string) => ({ id, actorUsername: "mai", reactionCount: 0, isMine: false })

/** Wrap a cursor page in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myFeed: { success: true, message: "ok", data } },
})

/** What the hook hands the transport for one page. */
interface FeedCall {
    /** The request variables, cursor included. */
    request: { cursor?: string }
}

/**
 * Answer by CURSOR rather than by call order.
 *
 * Raising the size revalidates the pages already held as well as fetching the new one, so a queue
 * of one-shot answers would hand page 0 the reply meant for page 1 and the walk would end for a
 * reason no reader could see.
 *
 * @param pages - The page to serve for each cursor; the first page is keyed by the empty string.
 */
const servePages = (pages: Record<string, unknown>) => {
    mocks.queryMyFeed.mockImplementation(async ({ request }: FeedCall) =>
        responseWith(pages[request.cursor ?? ""]))
}

/** Every cursor the hook has asked the transport for, in order. */
const requestedCursors = (): Array<string | undefined> => {
    const calls: Array<Array<FeedCall>> = mocks.queryMyFeed.mock.calls
    return calls.map((call) => call[0].request.cursor)
}

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyFeed.mockReset()
    servePages({ "": { items: [activity("a-1")], nextCursor: null } })
})

describe("useQueryMyFeedSwr constants", () => {
    it("names one page size and one stable key prefix", () => {
        expect(MY_FEED_PAGE_LIMIT).toBe(5)
        expect(QUERY_MY_FEED_SWR_KEY).toBe("QUERY_MY_FEED_SWR")
    })
})

describe("useQueryMyFeedSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        expect(mocks.queryMyFeed).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("sends no cursor on the first page, and the tab and category it was given", async () => {
        const { result } = renderHook(
            () => useQueryMyFeedSwr(MyFeedTab.Following, MyFeedCategory.All),
            { wrapper },
        )
        await waitFor(() => expect(result.current.data).toEqual([{ items: [activity("a-1")], nextCursor: null }]))
        expect(mocks.queryMyFeed).toHaveBeenCalledWith({
            request: {
                tab: MyFeedTab.Following,
                category: MyFeedCategory.All,
                cursor: undefined,
                limit: MY_FEED_PAGE_LIMIT,
            },
        })
    })

    it("defaults the category to all when a caller names only the tab", async () => {
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        await waitFor(() => expect(result.current.data).toHaveLength(1))
        expect(mocks.queryMyFeed.mock.calls[0][0].request.category).toBe(MyFeedCategory.All)
    })

    it("carries the cursor the previous page handed back into the next request", async () => {
        servePages({
            "": { items: [activity("a-1")], nextCursor: "cursor-1" },
            "cursor-1": { items: [activity("a-2")], nextCursor: null },
        })
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        await waitFor(() => expect(result.current.data).toHaveLength(1))

        await act(async () => {
            await result.current.setSize(2)
        })
        await waitFor(() => expect(result.current.data).toHaveLength(2))
        expect(result.current.data?.[1].items).toEqual([activity("a-2")])
        expect(requestedCursors()).toContain("cursor-1")
    })

    it("stops walking once a page says there is no next cursor", async () => {
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        await waitFor(() => expect(result.current.data).toHaveLength(1))

        await act(async () => {
            await result.current.setSize(2)
        })
        await waitFor(() => expect(result.current.data).toHaveLength(1))
        // Every request made was for the FIRST page: no continuation was ever asked for.
        expect(requestedCursors().every((cursor) => cursor === undefined)).toBe(true)
    })

    it("repeats the first page rather than advancing when a page omits its cursor entirely", async () => {
        servePages({ "": { items: [activity("a-1")] } })
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        await waitFor(() => expect(result.current.data).toHaveLength(1))

        await act(async () => {
            await result.current.setSize(2)
        })
        await waitFor(() => expect(result.current.data).toHaveLength(2))
        // An absent cursor falls back to the empty one, which is the FIRST page's key - so the
        // second page is the first page again rather than the next slice.
        expect(result.current.data?.[1]).toEqual(result.current.data?.[0])
        expect(requestedCursors().every((cursor) => cursor === undefined)).toBe(true)
    })

    it("reads a second tab under its own key rather than serving the first", async () => {
        const { rerender, result } = renderHook(
            ({ tab }: TabProps) => useQueryMyFeedSwr(tab),
            { wrapper, initialProps: { tab: MyFeedTab.ForYou } },
        )
        await waitFor(() => expect(result.current.data).toHaveLength(1))

        mocks.queryMyFeed.mockResolvedValue(responseWith({ items: [activity("b-1")], nextCursor: null }))
        rerender({ tab: MyFeedTab.Following })

        await waitFor(() => expect(result.current.data).toEqual([{ items: [activity("b-1")], nextCursor: null }]))
        expect(mocks.queryMyFeed).toHaveBeenCalledTimes(2)
    })

    it("settles an absent payload as one empty page that ends the walk", async () => {
        mocks.queryMyFeed.mockResolvedValue({
            data: { myFeed: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([{ items: [], nextCursor: null }]))
        expect(result.current.error).toBeUndefined()
    })

    it("settles a missing response body as one empty page too", async () => {
        mocks.queryMyFeed.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([{ items: [], nextCursor: null }]))
    })

    it("surfaces a transport failure as an error rather than as an empty feed", async () => {
        mocks.queryMyFeed.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("never hands one viewer the activity fetched for another", async () => {
        const { result } = renderHook(() => useQueryMyFeedSwr(MyFeedTab.ForYou), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([{ items: [activity("a-1")], nextCursor: null }]))

        mocks.queryMyFeed.mockResolvedValue(responseWith({ items: [], nextCursor: null }))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual([{ items: [], nextCursor: null }]))
        expect(mocks.queryMyFeed).toHaveBeenCalledTimes(2)
    })
})
