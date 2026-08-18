/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_PLAYGROUNDS_SWR_KEY, useQueryPlaygroundsSwr } from "./useQueryPlaygroundsSwr"

/**
 * What these tests guard: the playgrounds of one course are one cache entry, and no course is no
 * request - a list keyed on the bare prefix would show the previous course's labs for a moment
 * after navigating, which is exactly when a reader is deciding whether they are in the right place.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryPlaygrounds: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-playgrounds", () => ({
    queryPlaygrounds: mocks.queryPlaygrounds,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One lab, trimmed to the fields the document selects. */
const rows = [{ slug: "docker-basics", label: "Docker basics" }]

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryPlaygrounds.mockReset()
    mocks.queryPlaygrounds.mockResolvedValue({
        data: { playgrounds: { success: true, message: "ok", data: rows } },
    })
})

describe("useQueryPlaygroundsSwr", () => {
    it("reads nothing before a course is known", () => {
        renderHook(() => useQueryPlaygroundsSwr())
        expect(keyOf()).toBeNull()
    })

    it("gives each course its own cache entry", () => {
        renderHook(() => useQueryPlaygroundsSwr("course-1"))
        expect(keyOf()).toEqual([QUERY_PLAYGROUNDS_SWR_KEY, "course-1"])

        renderHook(() => useQueryPlaygroundsSwr("course-2"))
        expect(keyOf()).toEqual([QUERY_PLAYGROUNDS_SWR_KEY, "course-2"])
    })

    it("sends the course and hands back the labs, not the envelope", async () => {
        renderHook(() => useQueryPlaygroundsSwr("course-1"))
        await expect(fetcherOf()()).resolves.toEqual(rows)
        expect(mocks.queryPlaygrounds).toHaveBeenCalledWith({ courseId: "course-1" })
    })

    it("resolves to null when the server answered without a list", async () => {
        mocks.queryPlaygrounds.mockResolvedValue({
            data: { playgrounds: { success: false, message: "not found" } },
        })
        renderHook(() => useQueryPlaygroundsSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryPlaygrounds.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryPlaygroundsSwr("course-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
