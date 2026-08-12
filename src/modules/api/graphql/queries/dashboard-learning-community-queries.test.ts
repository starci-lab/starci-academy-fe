import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { queryRecommendedCourses } from "./query-recommended-courses"
import { queryMyUpcomingLivestreams } from "./query-my-upcoming-livestreams"
import { queryMyLeague } from "./query-my-league"
import { queryGlobalLeaderboard } from "./query-global-leaderboard"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("dashboard learning/community query ports", () => {
    it.each([
        [queryRecommendedCourses, ["recommendedCourses", "discountedPriceVnd", "discountReason"]],
        [queryMyUpcomingLivestreams, ["myUpcomingLivestreams", "courseGlobalId", "nextStartAt"]],
        [queryMyLeague, ["myLeague", "rankDelta", "weekEndAt"]],
        [queryGlobalLeaderboard, ["globalLeaderboard", "myRank", "isFollowing"]],
    ])("uses auth and selects the approved fields", async (query, fields) => {
        await query()
        expect(mocks.createApolloClient).toHaveBeenCalledWith(expect.objectContaining({ withAuth: true }))
        const document = print(mocks.query.mock.calls[0][0].query)
        fields.forEach((field) => expect(document).toContain(field))
    })
})
