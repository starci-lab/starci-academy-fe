/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_USER_PROFILE_SWR_KEY, useQueryUserProfileSwr } from "./useQueryUserProfileSwr"

/**
 * What these tests guard: a TRANSPORT error is thrown while a missing profile is `null`, which is
 * the distinction the profile page draws differently - "this person does not exist" is a page, and
 * "we could not reach the server" is a retry. Collapsing the two would show a not-found page every
 * time the network hiccuped.
 *
 * A username is required before anything is read: `null` and `""` are both "nobody yet".
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryUserProfile: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-user-profile", () => ({
    queryUserProfile: mocks.queryUserProfile,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One profile, trimmed to the fields the document selects. */
const profile = { username: "mai", displayName: "Mai", followerCount: 12 }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryUserProfile.mockReset()
    mocks.queryUserProfile.mockResolvedValue({
        data: { userProfile: { success: true, message: "ok", data: profile } },
    })
})

describe("useQueryUserProfileSwr", () => {
    it("reads nothing until a username is known", () => {
        renderHook(() => useQueryUserProfileSwr())
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryUserProfileSwr(null))
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryUserProfileSwr(""))
        expect(keyOf()).toBeNull()
    })

    it("gives each profile its own cache entry under the shared prefix", () => {
        renderHook(() => useQueryUserProfileSwr("mai"))
        expect(keyOf()).toEqual([...QUERY_USER_PROFILE_SWR_KEY, "mai"])

        renderHook(() => useQueryUserProfileSwr("khoa"))
        expect(keyOf()).toEqual([...QUERY_USER_PROFILE_SWR_KEY, "khoa"])
    })

    it("sends the username and hands back the profile, not the envelope", async () => {
        renderHook(() => useQueryUserProfileSwr("mai"))
        await expect(fetcherOf()()).resolves.toEqual(profile)
        expect(mocks.queryUserProfile).toHaveBeenCalledWith({ request: { username: "mai" } })
    })

    it("resolves to null for a username nobody holds", async () => {
        mocks.queryUserProfile.mockResolvedValue({
            data: { userProfile: { success: false, message: "not found", error: "NOT_FOUND" } },
        })
        renderHook(() => useQueryUserProfileSwr("nobody"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryUserProfile.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryUserProfileSwr("mai"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("throws the transport's own error rather than reporting the person missing", async () => {
        const failure = new Error("offline")
        mocks.queryUserProfile.mockResolvedValue({ data: undefined, error: failure })
        renderHook(() => useQueryUserProfileSwr("mai"))
        await expect(fetcherOf()()).rejects.toBe(failure)
    })
})
