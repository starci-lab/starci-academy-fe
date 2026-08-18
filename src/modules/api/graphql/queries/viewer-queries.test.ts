import { beforeEach, describe, expect, it, vi } from "vitest"
import { print, type DocumentNode } from "graphql"
import { queryMe, queryMeMap, QueryMe } from "./query-me"
import { queryMyCart, queryMyCartMap, QueryMyCart } from "./query-my-cart"
import { queryMyDailyQuest, queryMyDailyQuestMap, QueryMyDailyQuest } from "./query-my-daily-quest"
import { queryMyKpis, queryMyKpisMap, QueryMyKpis } from "./query-my-kpis"
import { queryMyLearnedLessons, queryMyLearnedLessonsMap, QueryMyLearnedLessons } from "./query-my-learned-lessons"
import {
    queryMyInProgressChallenges,
    queryMyInProgressChallengesMap,
    QueryMyInProgressChallenges,
} from "./query-my-in-progress-challenges"
import { querySuggestedUsers, querySuggestedUsersMap, QuerySuggestedUsers } from "./query-suggested-users"
import { queryTrendingContents, queryTrendingContentsMap, QueryTrendingContents } from "./query-trending-contents"
import { queryMyFeed, queryMyFeedMap, QueryMyFeed } from "./query-my-feed"
import { queryResolveRoute, queryResolveRouteMap, QueryResolveRoute } from "./query-resolve-route"
import { MyFeedCategory, MyFeedTab } from "./types/my-feed"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

/** The transport options every viewer reader accepts, spelled once for the shared table. */
type ViewerParams = {
    readonly query?: string
    readonly headers?: Record<string, string | undefined>
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

type ViewerReader = (params?: ViewerParams) => Promise<unknown>

type ViewerCase = readonly [string, ViewerReader, DocumentNode, string, Record<string, unknown>]

const viewerCases: ReadonlyArray<ViewerCase> = [
    ["queryMe", queryMe as unknown as ViewerReader, queryMeMap[QueryMe.Query1], QueryMe.Query1, {}],
    [
        "queryMyCart",
        queryMyCart as unknown as ViewerReader,
        queryMyCartMap[QueryMyCart.Query1],
        QueryMyCart.Query1,
        { fetchPolicy: "network-only" },
    ],
    [
        "queryMyDailyQuest",
        queryMyDailyQuest as unknown as ViewerReader,
        queryMyDailyQuestMap[QueryMyDailyQuest.Query1],
        QueryMyDailyQuest.Query1,
        {},
    ],
    ["queryMyKpis", queryMyKpis as unknown as ViewerReader, queryMyKpisMap[QueryMyKpis.Query1], QueryMyKpis.Query1, {}],
    [
        "queryMyLearnedLessons",
        queryMyLearnedLessons as unknown as ViewerReader,
        queryMyLearnedLessonsMap[QueryMyLearnedLessons.Query1],
        QueryMyLearnedLessons.Query1,
        {},
    ],
    [
        "queryMyInProgressChallenges",
        queryMyInProgressChallenges as unknown as ViewerReader,
        queryMyInProgressChallengesMap[QueryMyInProgressChallenges.Query1],
        QueryMyInProgressChallenges.Query1,
        {},
    ],
    [
        "querySuggestedUsers",
        querySuggestedUsers as unknown as ViewerReader,
        querySuggestedUsersMap[QuerySuggestedUsers.Query1],
        QuerySuggestedUsers.Query1,
        { fetchPolicy: "no-cache" },
    ],
    [
        "queryTrendingContents",
        queryTrendingContents as unknown as ViewerReader,
        queryTrendingContentsMap[QueryTrendingContents.Query1],
        QueryTrendingContents.Query1,
        { fetchPolicy: "no-cache" },
    ],
]

describe.each(viewerCases)("%s", (_name, read, document, variant, extra) => {
    it("defaults the variant and the whole params object to the canonical read", async () => {
        await read()
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({ query: document, ...extra })
    })

    it("forwards an explicitly selected variant with its transport options", async () => {
        const signal = new AbortController().signal
        await read({ query: variant, headers: { "x-trace-id": "trace-vi" }, signal, debug: true })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace-id": "trace-vi" },
            signal,
            debug: true,
        })
        expect(mocks.query).toHaveBeenCalledWith({ query: document, ...extra })
    })

    it("returns the apollo result untouched", async () => {
        const result = { data: { probe: true } }
        mocks.query.mockResolvedValue(result)
        await expect(read()).resolves.toBe(result)
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("offline"))
        await expect(read()).rejects.toThrow("offline")
    })
})

describe("viewer query documents", () => {
    it("selects the identity, cart, quest and target fields the surfaces render", () => {
        expect(print(queryMeMap[QueryMe.Query1])).toContain("displayName")
        expect(print(queryMyCartMap[QueryMyCart.Query1])).toContain("originalPrice")
        expect(print(queryMyDailyQuestMap[QueryMyDailyQuest.Query1])).toContain("claimed")
        expect(print(queryMyKpisMap[QueryMyKpis.Query1])).toContain("canClaim")
    })

    it("selects the resume references and community rows", () => {
        expect(print(queryMyLearnedLessonsMap[QueryMyLearnedLessons.Query1])).toContain("globalId")
        expect(print(queryMyInProgressChallengesMap[QueryMyInProgressChallenges.Query1])).toContain("label")
        expect(print(querySuggestedUsersMap[QuerySuggestedUsers.Query1])).toContain("openToWork")
        expect(print(queryTrendingContentsMap[QueryTrendingContents.Query1])).toContain("readCount")
        expect(print(queryMyFeedMap[QueryMyFeed.Query1])).toContain("nextCursor")
        expect(print(queryResolveRouteMap[QueryResolveRoute.Query1])).toContain("path")
    })
})

describe("queryMyFeed", () => {
    it("wraps the cursor request and defaults the variant", async () => {
        const request = { tab: MyFeedTab.ForYou }
        await queryMyFeed({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryMyFeedMap[QueryMyFeed.Query1],
            variables: { request },
            fetchPolicy: "no-cache",
        })
    })

    it("forwards an explicit variant, filters and transport options", async () => {
        const signal = new AbortController().signal
        const request = { tab: MyFeedTab.Following, cursor: "c-9", limit: 10, category: MyFeedCategory.Courses }
        await queryMyFeed({ query: QueryMyFeed.Query1, request, headers: { "x-trace-id": "trace-en" }, signal, debug: true })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace-id": "trace-en" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request })
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("feed offline"))
        await expect(queryMyFeed({ request: { tab: MyFeedTab.ForYou } })).rejects.toThrow("feed offline")
    })
})

describe("queryResolveRoute", () => {
    it("wraps the opaque id request and defaults the variant", async () => {
        const request = { globalId: "content:1" }
        await queryResolveRoute({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryResolveRouteMap[QueryResolveRoute.Query1],
            variables: { request },
            fetchPolicy: "no-cache",
        })
    })

    it("forwards an explicit variant with its transport options", async () => {
        const signal = new AbortController().signal
        const request = { globalId: "challenge:7" }
        await queryResolveRoute({
            query: QueryResolveRoute.Query1,
            request,
            headers: { "x-trace-id": "trace-vi" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: true,
            headers: { "x-trace-id": "trace-vi" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ request })
    })

    it("returns the resolved path envelope untouched", async () => {
        const result = { data: { resolveRoute: { success: true, message: "ok", data: { path: "/vi/x" } } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryResolveRoute({ request: { globalId: "content:1" } })).resolves.toBe(result)
    })
})
