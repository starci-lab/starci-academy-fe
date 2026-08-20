/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ProfileEvidenceKind } from "@/modules/api/graphql/queries/types/profile-evidence"
import { useQueryProfileEvidenceSwr } from "./useQueryProfileEvidenceSwr"

/**
 * What these tests guard: TWO argument shapes behind one hook. The activity feed and the two detail
 * families take a nested `request`; every other family takes the fields flat. That is the server's
 * own split, and getting it wrong is silent - the wrong shape is a query that returns nothing
 * rather than one that fails.
 *
 * The extra fields are part of the KEY as well as the request, so paging one evidence family does
 * not serve the previous page from cache.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryProfileEvidence: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-profile-evidence", () => ({
    queryProfileEvidence: mocks.queryProfileEvidence,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** Whatever the evidence family answers with. */
const evidence = { items: [{ id: "evidence-1" }] }

/** Render the hook for one evidence family, since it is generic in its answer. */
const read = (kind: ProfileEvidenceKind, profileId?: string | null, extra?: Record<string, unknown>) =>
    renderHook(() => useQueryProfileEvidenceSwr<typeof evidence>(kind, profileId, extra))

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryProfileEvidence.mockReset().mockResolvedValue(evidence)
})

describe("useQueryProfileEvidenceSwr", () => {
    it("reads nothing until a profile is known", () => {
        read("courses")
        expect(keyOf()).toBeNull()

        read("courses", null)
        expect(keyOf()).toBeNull()

        read("courses", "")
        expect(keyOf()).toBeNull()
    })

    it("names the family, the profile and the extra fields in the key", () => {
        read("courses", "user-1")
        expect(keyOf()).toEqual(["QUERY_PROFILE_EVIDENCE", "courses", "user-1", "{}"])

        read("courses", "user-1", { page: 2 })
        expect(keyOf()).toEqual(["QUERY_PROFILE_EVIDENCE", "courses", "user-1", "{\"page\":2}"])
    })

    it("gives each family its own cache entry for the same profile", () => {
        read("courses", "user-1")
        const courses = keyOf()

        read("achievements", "user-1")
        expect(keyOf()).not.toEqual(courses)
    })

    it("sends the flat shape for an ordinary evidence family", async () => {
        read("courses", "user-1", { page: 2 })
        await expect(fetcherOf()()).resolves.toEqual(evidence)
        expect(mocks.queryProfileEvidence).toHaveBeenCalledWith("courses", { userId: "user-1", page: 2 })
    })

    it("nests the request for the activity feed", async () => {
        read("activity", "user-1", { page: 2 })
        await fetcherOf()()
        expect(mocks.queryProfileEvidence).toHaveBeenCalledWith(
            "activity",
            { request: { userId: "user-1", page: 2 } },
        )
    })

    it("nests the request for every detail family, whichever one it is", async () => {
        read("challenge-detail", "user-1")
        await fetcherOf()()
        expect(mocks.queryProfileEvidence).toHaveBeenLastCalledWith(
            "challenge-detail",
            { request: { userId: "user-1" } },
        )

        read("coding-detail", "user-1")
        await fetcherOf()()
        expect(mocks.queryProfileEvidence).toHaveBeenLastCalledWith(
            "coding-detail",
            { request: { userId: "user-1" } },
        )
    })

    it("lets a transport failure through as a rejection rather than as empty evidence", async () => {
        mocks.queryProfileEvidence.mockRejectedValue(new Error("offline"))
        read("courses", "user-1")
        await expect(fetcherOf()()).rejects.toThrow("offline")
    })
})
