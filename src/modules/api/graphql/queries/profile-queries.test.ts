import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { queryUserProfile, queryUserProfileMap, QueryUserProfile } from "./query-user-profile"
import { queryPublicUserCv, queryPublicUserCvMap, QueryPublicUserCv } from "./query-public-user-cv"
import { queryProfileEvidence } from "./query-profile-evidence"
import type { ProfileEvidenceKind } from "./types/profile-evidence"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("queryUserProfile", () => {
    it("selects the fields the public header and lock banner render", () => {
        const document = print(queryUserProfileMap[QueryUserProfile.Query1])
        for (const field of ["profileLocked", "isFollowedByMe", "featuredAchievementSlug", "openToWork"]) {
            expect(document).toContain(field)
        }
    })

    it("reads anonymously and sends the request as the variables themselves", async () => {
        const request = { username: "linh" }
        await queryUserProfile({ request })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: false,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryUserProfileMap[QueryUserProfile.Query1],
            variables: request,
            fetchPolicy: "no-cache",
        })
    })

    it("forwards an explicit variant with its transport options", async () => {
        const signal = new AbortController().signal
        await queryUserProfile({
            query: QueryUserProfile.Query1,
            request: { username: "khoa" },
            headers: { "x-trace-id": "trace-vi" },
            signal,
            debug: true,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: false,
            headers: { "x-trace-id": "trace-vi" },
            signal,
            debug: true,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ username: "khoa" })
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("profile offline"))
        await expect(queryUserProfile({ request: { username: "linh" } })).rejects.toThrow("profile offline")
    })
})

describe("queryPublicUserCv", () => {
    it("selects the single downloadable CV row", () => {
        expect(print(queryPublicUserCvMap[QueryPublicUserCv.Query1])).toContain("pdfUrl")
    })

    it("reads anonymously and sends the request as the variables themselves", async () => {
        const request = { username: "linh" }
        const result = { data: { publicUserCv: { success: true, message: "ok", data: null } } }
        mocks.query.mockResolvedValue(result)
        await expect(queryPublicUserCv({ request })).resolves.toBe(result)
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: false,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
        expect(mocks.query).toHaveBeenCalledWith({
            query: queryPublicUserCvMap[QueryPublicUserCv.Query1],
            variables: request,
            fetchPolicy: "no-cache",
        })
    })

    it("forwards an explicit variant with its transport options", async () => {
        const signal = new AbortController().signal
        await queryPublicUserCv({
            query: QueryPublicUserCv.Query1,
            request: { username: "khoa" },
            headers: { "x-trace-id": "trace-en" },
            signal,
            debug: false,
        })
        expect(mocks.createApolloClient).toHaveBeenCalledWith({
            withAuth: false,
            headers: { "x-trace-id": "trace-en" },
            signal,
            debug: false,
        })
        expect(mocks.query.mock.calls[0][0].variables).toEqual({ username: "khoa" })
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("cv offline"))
        await expect(queryPublicUserCv({ request: { username: "linh" } })).rejects.toThrow("cv offline")
    })
})

type EvidenceCase = readonly [ProfileEvidenceKind, string, string]

const evidenceCases: ReadonlyArray<EvidenceCase> = [
    ["job-readiness", "userJobReadiness", "ProfileJobReadiness"],
    ["courses", "userCourses", "ProfileCourses"],
    ["contributions", "userContributionCalendar", "ProfileContributions"],
    ["pinned-projects", "userPinnedProjects", "ProfilePinnedProjects"],
    ["capstones", "userCapstoneProgress", "ProfileCapstones"],
    ["solved-challenges", "userSolvedChallenges", "ProfileSolvedChallenges"],
    ["challenge-strength", "userChallengeStrength", "ProfileChallengeStrength"],
    ["coding-skills", "userCodingSkills", "ProfileCodingSkills"],
    ["coding-history", "userCodingHistory", "ProfileCodingHistory"],
    ["coding-progress", "userCodingProgress", "ProfileCodingProgress"],
    ["coding-rank", "userCodingRank", "ProfileCodingRank"],
    ["coding-xp", "userXp", "ProfileCodingXp"],
    ["achievements", "userAchievements", "ProfileAchievements"],
    ["activity", "userFeed", "ProfileActivity"],
    ["challenge-detail", "userSolvedChallengeDetail", "ProfileChallengeDetail"],
    ["coding-detail", "userCodingProblemDetail", "ProfileCodingDetail"],
]

describe("queryProfileEvidence", () => {
    it.each(evidenceCases)(
        "dispatches %s through its own document and unwraps its own response field",
        async (kind, fieldName, operationName) => {
            const payload = { probe: kind }
            mocks.query.mockResolvedValue({ data: { [fieldName]: { success: true, message: "ok", data: payload } } })
            const variables = { userId: "user-1" }
            await expect(queryProfileEvidence(kind, variables)).resolves.toBe(payload)
            expect(mocks.createApolloClient).toHaveBeenCalledWith({ withAuth: false })
            const call = mocks.query.mock.calls[0][0]
            expect(print(call.query)).toContain(`query ${operationName}(`)
            expect(call.variables).toBe(variables)
            expect(call.fetchPolicy).toBe("no-cache")
        },
    )

    it("answers undefined when the transport returns no data at all", async () => {
        await expect(queryProfileEvidence("achievements", { userId: "user-1" })).resolves.toBeUndefined()
    })

    it("answers undefined when the envelope for that field is absent", async () => {
        mocks.query.mockResolvedValue({ data: { somethingElse: { success: false, message: "no" } } })
        await expect(queryProfileEvidence("coding-rank", { userId: "user-1" })).resolves.toBeUndefined()
    })

    it("answers undefined when the envelope carries no payload", async () => {
        mocks.query.mockResolvedValue({ data: { userXp: { success: false, message: "denied", error: "LOCKED" } } })
        await expect(queryProfileEvidence("coding-xp", { userId: "user-1" })).resolves.toBeUndefined()
    })

    it("passes a detail request through unwrapped for the detail families", async () => {
        const variables = { request: { challengeId: "c-1", userId: "user-1" } }
        await queryProfileEvidence("challenge-detail", variables)
        expect(mocks.query.mock.calls[0][0].variables).toBe(variables)
    })

    it("propagates a transport failure to the caller", async () => {
        mocks.query.mockRejectedValue(new Error("evidence offline"))
        await expect(queryProfileEvidence("capstones", { userId: "user-1" })).rejects.toThrow("evidence offline")
    })
})
