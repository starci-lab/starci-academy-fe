/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_PLAYGROUND_SWR_KEY, useQueryPlaygroundSwr } from "./useQueryPlaygroundSwr"

/**
 * What these tests guard: one lab is one cache entry, keyed by the slug the route carries, and no
 * slug is no request.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryPlayground: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-playground", () => ({
    queryPlayground: mocks.queryPlayground,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One lab, trimmed to the fields the document selects. */
const playground = { slug: "docker-basics", label: "Docker basics", steps: [] }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryPlayground.mockReset()
    mocks.queryPlayground.mockResolvedValue({
        data: { playground: { success: true, message: "ok", data: playground } },
    })
})

describe("useQueryPlaygroundSwr", () => {
    it("reads nothing before a slug is known", () => {
        renderHook(() => useQueryPlaygroundSwr())
        expect(keyOf()).toBeNull()
    })

    it("gives each lab its own cache entry", () => {
        renderHook(() => useQueryPlaygroundSwr("docker-basics"))
        expect(keyOf()).toEqual([QUERY_PLAYGROUND_SWR_KEY, "docker-basics"])

        renderHook(() => useQueryPlaygroundSwr("kubernetes-basics"))
        expect(keyOf()).toEqual([QUERY_PLAYGROUND_SWR_KEY, "kubernetes-basics"])
    })

    it("sends the slug and hands back the lab, not the envelope", async () => {
        renderHook(() => useQueryPlaygroundSwr("docker-basics"))
        await expect(fetcherOf()()).resolves.toEqual(playground)
        expect(mocks.queryPlayground).toHaveBeenCalledWith({ slug: "docker-basics" })
    })

    it("resolves to null for a slug the server does not know", async () => {
        mocks.queryPlayground.mockResolvedValue({
            data: { playground: { success: false, message: "not found" } },
        })
        renderHook(() => useQueryPlaygroundSwr("nope"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryPlayground.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryPlaygroundSwr("docker-basics"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
