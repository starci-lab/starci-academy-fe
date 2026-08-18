/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_PUBLIC_USER_CV_SWR_KEY, useQueryPublicUserCvSwr } from "./useQueryPublicUserCvSwr"

/**
 * What these tests guard: the same distinction its sibling draws - a transport error is thrown, a
 * CV nobody has published is `null` - and the fact that a public CV carries NO viewer in its key,
 * because it is the same document for everybody who can see it.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryPublicUserCv: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-public-user-cv", () => ({
    queryPublicUserCv: mocks.queryPublicUserCv,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One CV, trimmed to the fields the document selects. */
const cv = { username: "mai", headline: "Backend engineer", sections: [] }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryPublicUserCv.mockReset()
    mocks.queryPublicUserCv.mockResolvedValue({
        data: { publicUserCv: { success: true, message: "ok", data: cv } },
    })
})

describe("useQueryPublicUserCvSwr", () => {
    it("reads nothing until a username is known", () => {
        renderHook(() => useQueryPublicUserCvSwr())
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryPublicUserCvSwr(null))
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryPublicUserCvSwr(""))
        expect(keyOf()).toBeNull()
    })

    it("gives each CV its own cache entry under the shared prefix, with no viewer in it", () => {
        renderHook(() => useQueryPublicUserCvSwr("mai"))
        expect(keyOf()).toEqual([...QUERY_PUBLIC_USER_CV_SWR_KEY, "mai"])

        renderHook(() => useQueryPublicUserCvSwr("khoa"))
        expect(keyOf()).toEqual([...QUERY_PUBLIC_USER_CV_SWR_KEY, "khoa"])
    })

    it("sends the username and hands back the CV, not the envelope", async () => {
        renderHook(() => useQueryPublicUserCvSwr("mai"))
        await expect(fetcherOf()()).resolves.toEqual(cv)
        expect(mocks.queryPublicUserCv).toHaveBeenCalledWith({ request: { username: "mai" } })
    })

    it("resolves to null for somebody who has published no CV", async () => {
        mocks.queryPublicUserCv.mockResolvedValue({
            data: { publicUserCv: { success: false, message: "not published" } },
        })
        renderHook(() => useQueryPublicUserCvSwr("mai"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryPublicUserCv.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryPublicUserCvSwr("mai"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("throws the transport's own error rather than reporting the CV unpublished", async () => {
        const failure = new Error("offline")
        mocks.queryPublicUserCv.mockResolvedValue({ data: undefined, error: failure })
        renderHook(() => useQueryPublicUserCvSwr("mai"))
        await expect(fetcherOf()()).rejects.toBe(failure)
    })
})
